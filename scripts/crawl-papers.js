#!/usr/bin/env node
// scripts/crawl-papers.js
// Triggered by: GitHub Actions workflow_dispatch
// Fetches highly-cited papers from a conference/venue via Semantic Scholar API,
// deduplicates against existing seeds.json, and appends new entries.

const fs   = require("fs");
const path = require("path");

// Semantic Scholar venue aliases (API "venue" or "externalIds.venue" values)
const VENUE_MAP = {
  "ICLR":    { name: "ICLR",    fields: "iclr" },
  "NeurIPS": { name: "NeurIPS", fields: "neurips" },
  "ICML":    { name: "ICML",    fields: "icml" },
  "CVPR":    { name: "CVPR",    fields: "cvpr" },
  "EMNLP":   { name: "EMNLP",   fields: "emnlp" },
  "ACL":     { name: "ACL",     fields: "acl" },
  "NAACL":   { name: "NAACL",   fields: "naacl" },
  "ECCV":    { name: "ECCV",    fields: "eccv" },
  "ICCV":    { name: "ICCV",    fields: "iccv" },
};

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
  const conference = (process.env.CONFERENCE || "").toUpperCase().trim();
  const year       = parseInt(process.env.YEAR || String(new Date().getFullYear()), 10);
  const limit      = parseInt(process.env.LIMIT || "20", 10);
  const minCites   = parseInt(process.env.MIN_CITATIONS || "50", 10);

  if (!conference) { console.error("❌ CONFERENCE env var required (e.g. ICLR, NeurIPS, CVPR)"); process.exit(1); }

  console.log(`🔍 Crawling ${conference} ${year} — top ${limit} papers (min ${minCites} citations)`);

  // ── Query Semantic Scholar ────────────────────────────────────
  // Strategy: search by venue + year, sort by citationCount desc
  const query = `${conference} ${year}`;
  const params = new URLSearchParams({
    query,
    fields: FIELDS,
    year:   `${year}`,
    limit:  String(Math.min(limit * 4, 100)), // over-fetch; filter below
    sort:   "citationCount:desc",
  });

  let papers = [];
  try {
    const res  = await fetchWithRetry(`${API_BASE}/paper/search?${params}`);
    const data = await res.json();
    papers = data.data || [];
    console.log(`📦 Received ${papers.length} results from Semantic Scholar`);
  } catch (err) {
    console.error("❌ Semantic Scholar search failed:", err.message);
    process.exit(1);
  }

  // Filter: must mention the conference in venue field and have enough citations
  const filtered = papers
    .filter((p) => {
      const venue = (p.venue || "").toUpperCase();
      return (
        venue.includes(conference) &&
        (p.citationCount || 0) >= minCites &&
        p.title &&
        p.externalIds?.ArXiv
      );
    })
    .sort((a, b) => (b.citationCount || 0) - (a.citationCount || 0))
    .slice(0, limit);

  console.log(`✅ ${filtered.length} papers pass filter (venue match + ≥${minCites} citations + arXiv ID)`);

  if (filtered.length === 0) {
    console.log("⚠️  No papers match criteria. Try lowering MIN_CITATIONS or check the conference name.");
    process.exit(0);
  }

  // ── Deduplication ─────────────────────────────────────────────
  const seedsPath = path.resolve(__dirname, "../data/seeds.json");
  const seeds = JSON.parse(fs.readFileSync(seedsPath, "utf8"));
  const existingArxivIds = new Set(
    seeds
      .map((s) => (s.arxiv || "").match(/abs\/([0-9.]+)/)?.[1])
      .filter(Boolean)
  );

  const newPapers = filtered.filter((p) => {
    const aid = p.externalIds?.ArXiv;
    return aid && !existingArxivIds.has(aid);
  });

  console.log(`🆕 ${newPapers.length} new (${filtered.length - newPapers.length} already in seeds.json)`);

  if (newPapers.length === 0) {
    console.log("✅ seeds.json is already up to date.");
    process.exit(0);
  }

  // ── Build new seed entries ────────────────────────────────────
  // Find next ID number
  const maxId = seeds.reduce((max, s) => {
    const n = parseInt((s.id || "s000").replace(/[^0-9]/g, ""), 10);
    return isNaN(n) ? max : Math.max(max, n);
  }, 0);

  const newSeeds = newPapers.map((p, i) => {
    const arxivId = p.externalIds.ArXiv;
    const domain  = inferDomain(p.fieldsOfStudy, p.title);
    const tags    = inferTags(p.title, p.abstract, p.fieldsOfStudy);
    const authors = (p.authors || []).slice(0, 3).map((a) => a.name).join(", ");
    const shortAbstract = (p.abstract || "").replace(/\s+/g, " ").trim().slice(0, 180);

    return {
      id: `s${String(maxId + i + 1).padStart(3, "0")}`,
      title: p.title,
      conference: `${conference} ${year}`,
      year,
      domain,
      tags,
      arxiv: `https://arxiv.org/abs/${arxivId}`,
      proposedBy: "VJAI Bot (crawled)",
      claimedBy: null,
      hackabilityScore: hackabilityScore(p),
      citationCount: p.citationCount || 0,
      authors: authors || "Unknown",
      description: shortAbstract ? shortAbstract + (p.abstract?.length > 180 ? "…" : "") : p.title,
    };
  });

  const updated = [...seeds, ...newSeeds];
  fs.writeFileSync(seedsPath, JSON.stringify(updated, null, 2) + "\n");
  console.log(`💾 Saved ${newSeeds.length} new seeds to seeds.json`);

  // ── GitHub outputs ─────────────────────────────────────────────
  const rows = newSeeds.map((s) =>
    `| [${s.title.slice(0, 60)}](${s.arxiv}) | ${s.domain} | ${s.citationCount} | ${s.hackabilityScore} |`
  ).join("\n");

  const summary = `## 🤖 Paper Crawl Complete\n\n**Conference:** ${conference} ${year}\n**New papers added:** ${newSeeds.length}\n\n| Title | Domain | Citations | Hackability |\n|---|---|---|---|\n${rows}\n`;

  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
  }
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `count<<EOF\n${newSeeds.length}\nEOF\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `summary<<EOF\n${summary}\nEOF\n`);
  }
}

main().catch((err) => {
  console.error("❌ Unexpected error:", err.message);
  process.exit(1);
});
