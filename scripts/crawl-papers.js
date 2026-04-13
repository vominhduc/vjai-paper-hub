#!/usr/bin/env node
// scripts/crawl-papers.js
// Triggered by: GitHub Actions workflow_dispatch
//
// Four modes:
//   MODE=conference  — fetch highly-cited papers from a conference venue (post-proceedings)
//   MODE=topic       — search arXiv/Semantic Scholar by keyword (pre-conference or any time)
//   MODE=arxiv       — fetch one specific paper by arXiv ID or URL (e.g. 2106.09685)
//   MODE=author      — fetch recent papers from a specific researcher by name or S2 author ID
//
// Target: papers are added as organizer suggestions (nominations) to a specific CYCLE_ID,
// OR appended to seeds.json when no CYCLE_ID is provided.

const fs   = require("fs");
const path = require("path");

const API_BASE = "https://api.semanticscholar.org/graph/v1";
const FIELDS   = "paperId,title,abstract,year,citationCount,venue,authors,externalIds,fieldsOfStudy,openAccessPdf";

/** Sleep ms */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Slugify string → usable tag */
function slugTag(s) {
  return s.replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, " ").trim();
}

/** Map Semantic Scholar fieldsOfStudy → our domain labels */
function inferDomain(fields, title) {
  const haystack = ((fields || []).join(" ") + " " + (title || "")).toLowerCase();
  if (/computer vision|image|visual|pixel|segmentation|detection|diffusion/.test(haystack)) return "Vision";
  if (/speech|audio|sound|wav/.test(haystack)) return "Audio";
  if (/reinforcement|reward|agent|policy|rl\b/.test(haystack)) return "RL";
  if (/graph|gnn|node|edge|molecular/.test(haystack)) return "Graph";
  if (/language|nlp|text|token|transfor|gpt|llm|bert|generation/.test(haystack)) return "LLM";
  if (/efficient|hardware|kernel|flash|memory|inference|quant/.test(haystack)) return "Systems";
  if (/multi.?modal|vision.language|clip|vqa|captioning/.test(haystack)) return "Multimodal";
  return "ML";
}

/** Generate tags from title / abstract */
function inferTags(title, abstract, fieldsOfStudy) {
  const tags = new Set();
  const text = `${title} ${abstract || ""}`.toLowerCase();
  const mappings = [
    [/\btransform/,    "Transformers"],
    [/\bdiffusion\b/,  "Diffusion"],
    [/\brl\b|reinforcement learning/, "RL"],
    [/\bllm|large language/, "LLM"],
    [/\bfine.tun|finetun/, "Fine-tuning"],
    [/\blora\b/,       "LoRA"],
    [/\brag\b|retrieval.augmented/, "RAG"],
    [/\bagent/,        "Agents"],
    [/\befficiency|efficient/, "Efficiency"],
    [/\bquantiz/,      "Quantization"],
    [/\bpruning/,      "Pruning"],
    [/\bvision|visual/, "Vision"],
    [/\bspeech\b/,     "Speech"],
    [/\bgraph\b/,      "Graph"],
    [/\bmulti.?modal/, "Multimodal"],
    [/\breasoning/,    "Reasoning"],
    [/\bscaling/,      "Scaling"],
    [/\bpretraining|pre.train/, "Pretraining"],
    [/\bsafety|alignment|rlhf/, "Alignment"],
  ];
  mappings.forEach(([re, tag]) => { if (re.test(text)) tags.add(tag); });
  if (tags.size === 0 && fieldsOfStudy?.length) tags.add(slugTag(fieldsOfStudy[0]));
  return [...tags].slice(0, 5);
}

/** Rough hackability heuristic: open-source + shorter abstract + systems/training = higher */
function hackabilityScore(paper) {
  let score = 50;
  const text = `${paper.title} ${paper.abstract || ""}`.toLowerCase();
  if (paper.openAccessPdf?.url) score += 10;
  if (/\bgithub\b/.test(text)) score += 10;
  if (/\bcode\b|open.source/.test(text)) score += 8;
  if (/\btraining|fine.tun|lora/.test(text)) score += 7;
  if (/\bsystem|kernel|hardware/.test(text)) score += 5;
  if ((paper.citationCount || 0) > 500) score += 5;
  if ((paper.citationCount || 0) > 200) score += 3;
  return Math.min(score, 99);
}

/** Fetch with retry on 429 */
async function fetchWithRetry(url, opts = {}, retries = 3) {
  for (let i = 0; i <= retries; i++) {
    const res = await fetch(url, { ...opts, headers: { "User-Agent": "vjai-paper-hub/1.0" } });
    if (res.status === 429) {
      const wait = 10000 * (i + 1);
      console.log(`⏳ Rate-limited — waiting ${wait / 1000}s ...`);
      await sleep(wait);
      continue;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return res;
  }
  throw new Error(`Gave up after ${retries} retries for ${url}`);
}

async function main() {
  const mode       = (process.env.MODE || "conference").toLowerCase().trim(); // "conference" | "topic" | "arxiv" | "author"
  const cycleId    = (process.env.CYCLE_ID || "").trim();
  const conference = (process.env.CONFERENCE || "").toUpperCase().trim();
  const year       = parseInt(process.env.YEAR || String(new Date().getFullYear()), 10);
  const topic      = (process.env.TOPIC || "").trim();        // free-text keyword (topic mode)
  const arxivInput = (process.env.ARXIV_ID || "").trim();     // arxiv mode: ID or full URL
  const authorInput= (process.env.AUTHOR || "").trim();       // author mode: name or S2 author ID
  const limit      = parseInt(process.env.LIMIT || "15", 10);
  const minCites   = parseInt(process.env.MIN_CITATIONS || "0", 10);

  if (!["conference", "topic", "arxiv", "author"].includes(mode)) {
    console.error(`❌ MODE must be "conference", "topic", "arxiv", or "author" (got "${mode}")`);
    process.exit(1);
  }
  if (mode === "conference" && !conference) {
    console.error("❌ CONFERENCE env var required in conference mode (e.g. ICLR, NeurIPS, CVPR)");
    process.exit(1);
  }
  if (mode === "topic" && !topic) {
    console.error("❌ TOPIC env var required in topic mode (e.g. 'reasoning LLM', 'diffusion models')");
    process.exit(1);
  }
  if (mode === "arxiv" && !arxivInput) {
    console.error("❌ ARXIV_ID env var required in arxiv mode (e.g. '2106.09685' or full arXiv URL)");
    process.exit(1);
  }
  if (mode === "author" && !authorInput) {
    console.error("❌ AUTHOR env var required in author mode (e.g. 'Andrej Karpathy' or S2 author ID)");
    process.exit(1);
  }
  // ── Load cycles.json ──────────────────────────────────────────
  const cyclesPath = path.resolve(__dirname, "../data/cycles.json");
  const cycles = JSON.parse(fs.readFileSync(cyclesPath, "utf8"));

  let targetCycle = null;
  if (cycleId) {
    targetCycle = cycles.find((c) => c.id === cycleId);
    if (!targetCycle) {
      console.error(`❌ Cycle "${cycleId}" not found in cycles.json`);
      process.exit(1);
    }
    console.log(`🎯 Target cycle: ${cycleId} — "${targetCycle.theme}"`);
  }

  // ── Fetch papers based on mode ───────────────────────────────
  let papers = [];
  let logLabel = "";

  if (mode === "conference" || mode === "topic") {
    let searchQuery;
    if (mode === "conference") {
      searchQuery = `${conference} ${year}`;
      logLabel    = `${conference} ${year}`;
      console.log(`🔍 [conference mode] Crawling ${logLabel} — top ${limit} papers (min ${minCites} citations)`);
    } else {
      searchQuery = topic;
      logLabel    = `topic: "${topic}"`;
      console.log(`🔍 [topic mode] Crawling "${topic}" — top ${limit} papers sorted by recency`);
    }

    const ssParams = new URLSearchParams({
      query:  searchQuery,
      fields: FIELDS,
      limit:  String(Math.min(limit * 5, 100)),
    });
    if (mode === "conference") {
      ssParams.set("year", `${year}`);
      ssParams.set("sort", "citationCount:desc");
    } else {
      ssParams.set("sort", "year:desc");
    }

    try {
      const res  = await fetchWithRetry(`${API_BASE}/paper/search?${ssParams}`);
      const data = await res.json();
      papers = data.data || [];
      console.log(`📦 Received ${papers.length} results from Semantic Scholar`);
    } catch (err) {
      console.error("❌ Semantic Scholar search failed:", err.message);
      process.exit(1);
    }

  } else if (mode === "arxiv") {
    // ── ArXiv ID mode: fetch a single specific paper ──────────
    // Accept full URLs like https://arxiv.org/abs/2106.09685 or bare IDs
    const arxivId = arxivInput.replace(/.*abs\//, "").replace(/v\d+$/, "").trim();
    logLabel = `arXiv:${arxivId}`;
    console.log(`🔍 [arxiv mode] Fetching paper arXiv:${arxivId}`);

    try {
      const res  = await fetchWithRetry(`${API_BASE}/paper/arXiv:${arxivId}?fields=${FIELDS}`);
      const data = await res.json();
      if (data.error || !data.title) {
        console.error(`❌ Paper arXiv:${arxivId} not found on Semantic Scholar.`);
        process.exit(1);
      }
      papers = [data];
      console.log(`📦 Found: "${data.title}"`);
    } catch (err) {
      console.error("❌ Semantic Scholar lookup failed:", err.message);
      process.exit(1);
    }

  } else if (mode === "author") {
    // ── Author mode: fetch recent papers by a specific researcher ──
    logLabel = `author: "${authorInput}"`;
    console.log(`🔍 [author mode] Fetching recent papers by "${authorInput}" — top ${limit}`);

    // Step 1: resolve author (name → S2 author ID, or use bare numeric ID directly)
    let authorId = null;
    if (/^\d+$/.test(authorInput)) {
      authorId = authorInput; // already an S2 author ID
    } else {
      try {
        const searchRes  = await fetchWithRetry(
          `${API_BASE}/author/search?query=${encodeURIComponent(authorInput)}&fields=authorId,name,paperCount&limit=5`
        );
        const searchData = await searchRes.json();
        const candidates = searchData.data || [];
        if (candidates.length === 0) {
          console.error(`❌ No author found for "${authorInput}". Try using their full name or S2 author ID from semanticscholar.org.`);
          process.exit(1);
        }
        // Pick the one with the most papers (most likely the well-known researcher)
        authorId = candidates.sort((a, b) => (b.paperCount || 0) - (a.paperCount || 0))[0].authorId;
        const matched = candidates[0].name;
        console.log(`👤 Resolved to author: "${matched}" (ID: ${authorId})`);
      } catch (err) {
        console.error("❌ Author search failed:", err.message);
        process.exit(1);
      }
    }

    // Step 2: fetch their papers, sorted by year desc, filter for arXiv papers
    try {
      const papersRes  = await fetchWithRetry(
        `${API_BASE}/author/${authorId}/papers?fields=${FIELDS}&limit=50&sort=year:desc`
      );
      const papersData = await papersRes.json();
      papers = papersData.data || [];
      console.log(`📦 Received ${papers.length} papers by author`);
    } catch (err) {
      console.error("❌ Author papers fetch failed:", err.message);
      process.exit(1);
    }
  }

  // ── Filter ────────────────────────────────────────────────────
  const filtered = papers
    .filter((p) => {
      if (!p.title || !p.externalIds?.ArXiv) return false;
      if ((p.citationCount || 0) < minCites) return false;
      if (mode === "conference") {
        const venue = (p.venue || "").toUpperCase();
        if (!venue.includes(conference)) return false;
      }
      return true;
    })
    .sort((a, b) =>
      mode === "conference"
        ? (b.citationCount || 0) - (a.citationCount || 0)
        : (b.year || 0) - (a.year || 0)
    )
    .slice(0, limit);

  console.log(`✅ ${filtered.length} papers pass filter`);

  if (filtered.length === 0) {
    const tip =
      mode === "conference" ? "Try lowering MIN_CITATIONS or check the conference name." :
      mode === "topic"      ? "Try different keywords or check spelling." :
      mode === "arxiv"      ? "Check that the arXiv ID is correct (e.g. 2106.09685)." :
                              "This author may not have recent arXiv papers, or MIN_CITATIONS is too high.";
    console.log(`⚠️  No papers match criteria. ${tip}`);
    process.exit(0);
  }

  // ── Collect existing arXiv IDs (seeds + cycle nominations) ────
  const seedsPath = path.resolve(__dirname, "../data/seeds.json");
  const seeds = JSON.parse(fs.readFileSync(seedsPath, "utf8"));

  const existingArxivIds = new Set([
    ...seeds.map((s) => (s.arxiv || "").match(/abs\/([0-9.]+)/)?.[1]).filter(Boolean),
    ...cycles.flatMap((c) =>
      (c.nominations || []).map((n) => (n.arxiv || "").match(/abs\/([0-9.]+)/)?.[1]).filter(Boolean)
    ),
  ]);

  const newPapers = filtered.filter((p) => {
    const aid = p.externalIds?.ArXiv;
    return aid && !existingArxivIds.has(aid);
  });

  console.log(`🆕 ${newPapers.length} new (${filtered.length - newPapers.length} already in data)`);

  if (newPapers.length === 0) {
    console.log("✅ All found papers are already in the dataset.");
    process.exit(0);
  }

  // ── Build paper entries ───────────────────────────────────────
  const conferenceLabel = mode === "conference" ? `${conference} ${year}` : "Preprint";

  const builtPapers = newPapers.map((p) => {
    const arxivId = p.externalIds.ArXiv;
    const domain  = inferDomain(p.fieldsOfStudy, p.title);
    const tags    = inferTags(p.title, p.abstract, p.fieldsOfStudy);
    const authors = (p.authors || []).slice(0, 3).map((a) => a.name).join(", ");
    const shortAbstract = (p.abstract || "").replace(/\s+/g, " ").trim().slice(0, 180);
    return {
      title:          p.title,
      conference:     conferenceLabel,
      year:           p.year || year,
      domain,
      tags,
      arxiv:          `https://arxiv.org/abs/${arxivId}`,
      authors:        authors || "Unknown",
      citationCount:  p.citationCount || 0,
      hackabilityScore: hackabilityScore(p),
      description:    shortAbstract ? shortAbstract + ((p.abstract?.length ?? 0) > 180 ? "…" : "") : p.title,
    };
  });

  // ── Write output ──────────────────────────────────────────────
  let writtenFiles = [];
  let summaryTarget = "";

  if (targetCycle) {
    // ── Mode A: inject as organizer suggestions into cycle nominations ──
    const existingNomIds = targetCycle.nominations.map((n) => n.id);
    const maxNomNum = existingNomIds.reduce((max, id) => {
      const n = parseInt((id || "p0").replace(/[^0-9]/g, ""), 10);
      return isNaN(n) ? max : Math.max(max, n);
    }, 0);

    const newNominations = builtPapers.map((p, i) => ({
      id:           `p${maxNomNum + i + 1}`,
      title:        p.title,
      proposer:     "VJAI Bot (organizer suggestion)",
      arxiv:        p.arxiv,
      tags:         p.tags,
      is_selected:  false,
      votes:        0,
      authors:      p.authors,
      citationCount: p.citationCount,
      crawledFrom:  logLabel,
      description:  p.description,
    }));

    targetCycle.nominations = [...targetCycle.nominations, ...newNominations];

    const cycleIdx = cycles.findIndex((c) => c.id === cycleId);
    cycles[cycleIdx] = targetCycle;
    fs.writeFileSync(cyclesPath, JSON.stringify(cycles, null, 2) + "\n");
    writtenFiles.push("data/cycles.json");
    summaryTarget = `cycle \`${cycleId}\` nominations`;
    console.log(`💾 Added ${newNominations.length} organizer suggestions to cycle "${cycleId}"`);
  } else {
    // ── Mode B: append to seeds.json ─────────────────────────────
    const maxId = seeds.reduce((max, s) => {
      const n = parseInt((s.id || "s000").replace(/[^0-9]/g, ""), 10);
      return isNaN(n) ? max : Math.max(max, n);
    }, 0);

    const newSeeds = builtPapers.map((p, i) => ({
      id:              `s${String(maxId + i + 1).padStart(3, "0")}`,
      proposedBy:      "VJAI Bot (crawled)",
      claimedBy:       null,
      ...p,
    }));

    const updated = [...seeds, ...newSeeds];
    fs.writeFileSync(seedsPath, JSON.stringify(updated, null, 2) + "\n");
    writtenFiles.push("data/seeds.json");
    summaryTarget = "`data/seeds.json`";
    console.log(`💾 Saved ${newSeeds.length} new papers to seeds.json`);
  }

  // ── GitHub outputs ────────────────────────────────────────────
  const rows = builtPapers.map((p) =>
    `| [${p.title.slice(0, 55)}…](${p.arxiv}) | ${p.domain} | ${p.citationCount} | ${p.hackabilityScore} |`
  ).join("\n");

  const modeLabel = 
    mode === "conference" ? `${conference} ${year}` :
    mode === "topic"      ? `topic "${topic}"` :
    mode === "arxiv"      ? `arXiv:${arxivInput.replace(/.*abs\//, "").replace(/v\d+$/, "").trim()}` :
                            `author "${authorInput}"`;
  const summary   = [
    `## 🤖 Paper Crawl Complete`,
    ``,
    `**Mode:** ${mode} | **Source:** ${modeLabel}`,
    `**Target:** ${summaryTarget}`,
    `**Papers added:** ${builtPapers.length}`,
    ``,
    `| Title | Domain | Citations | Hackability |`,
    `|---|---|---|---|`,
    rows,
  ].join("\n");

  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary + "\n");
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `count<<EOF\n${builtPapers.length}\nEOF\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `files<<EOF\n${writtenFiles.join(",")}\nEOF\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `summary<<EOF\n${summary}\nEOF\n`);
  }
}

main().catch((err) => {
  console.error("❌ Unexpected error:", err.message);
  process.exit(1);
});
