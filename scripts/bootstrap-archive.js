#!/usr/bin/env node
// scripts/bootstrap-archive.js
// Bootstraps an archive.json entry from a completed cycle's is_selected nomination.
//
// Usage:
//   node scripts/bootstrap-archive.js <cycle_id>
//
// What it does:
//   1. Reads cycles.json → finds the is_selected nomination in the given cycle
//   2. Fetches arXiv metadata (title, authors, abstract, year)
//   3. Appends a skeleton entry to archive.json (blanks for you to fill in)
//
// After running, edit the entry in data/archive.json to add:
//   - summary, tldr, vibeScore, tags, resources.youtube/github/blog, status

const fs   = require("fs");
const path = require("path");
const { fetchArxivMeta } = require("./lib/arxiv");
const { slugify }        = require("./lib/parse-issue");

async function main() {
  const cycleId = process.argv[2];
  if (!cycleId) {
    console.error("Usage: node scripts/bootstrap-archive.js <cycle_id>");
    process.exit(1);
  }

  // ── Load cycles.json ──────────────────────────────────────
  const cyclesPath = path.resolve(__dirname, "../data/cycles.json");
  const cycles = JSON.parse(fs.readFileSync(cyclesPath, "utf8"));

  const cycle = cycles.find((c) => c.id === cycleId);
  if (!cycle) {
    console.error(`❌ Cycle "${cycleId}" not found in cycles.json.`);
    process.exit(1);
  }

  const selected = cycle.nominations?.filter((n) => n.is_selected);
  if (!selected || selected.length === 0) {
    console.error(`❌ No is_selected nomination found in cycle "${cycleId}".`);
    console.log("   Tip: set is_selected: true on the winning nomination first.");
    process.exit(1);
  }

  // ── Load archive.json ─────────────────────────────────────
  const archivePath = path.resolve(__dirname, "../data/archive.json");
  const archive = JSON.parse(fs.readFileSync(archivePath, "utf8"));

  let addedCount = 0;

  for (const nom of selected) {
    // Deduplicate by title
    const dup = archive.find((p) => p.title.toLowerCase() === nom.title.toLowerCase());
    if (dup) {
      console.log(`⚠️  Already in archive: "${nom.title}" — skipping.`);
      continue;
    }

    let meta = null;
    if (nom.arxiv_url || nom.url) {
      const arxivUrl = nom.arxiv_url || nom.url;
      console.log(`🔍 Fetching arXiv metadata: ${arxivUrl}`);
      try {
        meta = await fetchArxivMeta(arxivUrl);
        console.log(`✅ Fetched: "${meta.title}" (${meta.year})`);
      } catch (e) {
        console.warn(`⚠️  Could not fetch arXiv metadata: ${e.message}`);
      }
    } else {
      console.warn(`⚠️  No arxiv_url on nomination "${nom.title}" — skipping metadata fetch.`);
    }

    const archiveId = slugify(meta?.title || nom.title).slice(0, 40);
    const sessionDate = cycle.session_date || new Date().toISOString().slice(0, 10);
    const year = meta?.year || new Date(sessionDate).getFullYear();
    const abstract = meta?.abstract || "";

    const entry = {
      id: archiveId,
      title: meta?.title || nom.title,
      authors: meta?.authors || [],
      conference: "TODO",          // fill in: e.g. "NeurIPS 2024", "ICML", "arXiv"
      year,
      status: "TODO",              // fill in: "Reproduced" | "Reviewed" | "Archived"
      presenter: nom.proposer || "TODO",
      presenter_role: "VJAI Member",
      tags: nom.tags || ["TODO"],  // fill in with relevant tags
      date_read: sessionDate,
      vibeScore: 75,               // fill in: 0–100
      resources: {
        arxiv: meta?.arxiv_url || nom.arxiv_url || nom.url || "",
        github: "",                // fill in if available
        vjai_code: "",             // fill in if VJAI reproduced it
        youtube: "",               // fill in recording URL
        blog: "",                  // fill in blog post URL
      },
      summary: abstract.slice(0, 200) || "TODO — one sentence summary",
      tldr: [                      // fill in 3–4 bullet points
        "TODO — key finding 1",
        "TODO — key finding 2",
        "TODO — key finding 3",
      ],
      abstract,
    };

    archive.unshift(entry); // newest first
    addedCount++;
    console.log(`✅ Bootstrapped archive entry: "${entry.title}" (id: ${archiveId})`);
  }

  if (addedCount > 0) {
    fs.writeFileSync(archivePath, JSON.stringify(archive, null, 2) + "\n");
    console.log(`\n📝 Saved ${addedCount} new entr${addedCount === 1 ? "y" : "ies"} to data/archive.json`);
    console.log("   → Open data/archive.json and fill in the TODO fields.");
  } else {
    console.log("ℹ️  No new entries added.");
  }
}

main().catch((err) => {
  console.error("❌ bootstrap-archive failed:", err.message);
  process.exit(1);
});
