#!/usr/bin/env node
// scripts/add-seed.js
// Triggered by: GitHub Actions on issue labeled "seed"
// Reads: ISSUE_BODY env var (the raw issue body markdown)
// Writes: data/seeds.json  (appends new seed)
// Also fetches arXiv metadata automatically.

const fs = require("fs");
const path = require("path");
const { fetchArxivMeta } = require("./lib/arxiv");
const { parseIssueBody, slugify, parseTags } = require("./lib/parse-issue");

async function main() {
  const issueBody = process.env.ISSUE_BODY;
  const issueNumber = process.env.ISSUE_NUMBER || "0";

  if (!issueBody) {
    console.error("❌ ISSUE_BODY env var is required.");
    process.exit(1);
  }

  const fields = parseIssueBody(issueBody);
  console.log("📋 Parsed issue fields:", JSON.stringify(fields, null, 2));

  // Accept either the new "paper url" field or the legacy "arxiv url" field
  const paperUrl = fields["paper url"] || fields["arxiv url"] || fields["arxiv"] || "";
  // Also accept an explicit arXiv ID field for non-arXiv links
  const explicitArxivId = (fields["arxiv id if paper url is not an arxiv link"] || fields["arxiv id"] || "").trim();

  // Resolve what to pass to fetchArxivMeta: prefer the explicit ID, then the URL
  const arxivInput = explicitArxivId || paperUrl;
  if (!arxivInput) {
    console.error("❌ No Paper URL or arXiv ID found in issue body.");
    process.exit(1);
  }

  // Quick check: if the URL doesn't look like arXiv AND no explicit arXiv ID was given,
  // we won't be able to fetch metadata — fail early with a helpful message.
  const looksLikeArxiv = arxivInput.toLowerCase().includes("arxiv") ||
    /^\d{4}\.\d{4,5}(v\d+)?$/.test(arxivInput.trim());
  if (!looksLikeArxiv) {
    console.error(
      `❌ Cannot fetch metadata: "${paperUrl}" is not an arXiv link.\n` +
      `   Please also fill in the "arXiv ID" field (e.g. 2501.12948) when submitting a non-arXiv URL.`
    );
    process.exit(1);
  }

  // Auto-fetch metadata
  console.log(`🔍 Fetching arXiv metadata for: ${arxivInput}`);
  const meta = await fetchArxivMeta(arxivInput);
  console.log(`✅ Fetched: "${meta.title}" (${meta.year})`);

  // Parse qualitative fields from the issue
  const domain = fields["domain"] || "Other";
  const tags = parseTags(fields["tags"]);
  const hackabilityScore = Math.min(
    100,
    Math.max(0, parseInt(fields["hackability score 0100"] || fields["hackability score"] || "70", 10))
  );
  const description = fields["onelined description"] || fields["description"] || meta.abstract.slice(0, 120) + "…";
  const conference = fields["conference  venue"] || fields["conference"] || "Preprint";
  const proposedBy = process.env.ISSUE_AUTHOR || fields["proposed by"] || "VJAI Community";

  // Build new seed entry
  const seedsPath = path.resolve(__dirname, "../data/seeds.json");
  const seeds = JSON.parse(fs.readFileSync(seedsPath, "utf8"));

  // Prevent duplicates
  const duplicate = seeds.find(
    (s) => s.arxiv === meta.arxiv_url || s.title.toLowerCase() === meta.title.toLowerCase()
  );
  if (duplicate) {
    console.log(`⚠️  Duplicate detected: "${duplicate.title}" already in seeds.json. Skipping.`);
    process.exit(0);
  }

  const id = `s${String(seeds.length + 1).padStart(3, "0")}-${slugify(meta.title).slice(0, 20)}`;

  const newSeed = {
    id,
    title: meta.title,
    authors: meta.authors,
    conference,
    year: meta.year,
    domain,
    tags,
    arxiv: meta.arxiv_url,
    proposedBy,
    claimedBy: null,
    hackabilityScore,
    description,
    abstract: meta.abstract,
    issue_number: parseInt(issueNumber, 10),
  };

  seeds.push(newSeed);
  fs.writeFileSync(seedsPath, JSON.stringify(seeds, null, 2) + "\n");
  console.log(`✅ Added seed: "${meta.title}" (${id})`);

  // Output for GitHub Actions step summary
  const summary = `### ✅ Seed Paper Added\n\n**${meta.title}**\n- ID: \`${id}\`\n- Domain: ${domain}\n- Hackability: ${hackabilityScore}%\n- arXiv: ${meta.arxiv_url}\n`;
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
  }
}

main().catch((err) => {
  console.error("❌ Script failed:", err.message);
  process.exit(1);
});
