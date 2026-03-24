#!/usr/bin/env node
// scripts/add-nomination.js
// Triggered by: GitHub Actions on issue labeled "nomination"
// Reads: ISSUE_BODY, ISSUE_AUTHOR env vars
// Writes: data/cycles.json  (appends nomination to target cycle)
// Also fetches arXiv metadata automatically.

const fs = require("fs");
const path = require("path");
const { fetchArxivMeta } = require("./lib/arxiv");
const { parseIssueBody, slugify, parseTags } = require("./lib/parse-issue");

async function main() {
  const issueBody = process.env.ISSUE_BODY;
  const issueNumber = process.env.ISSUE_NUMBER || "0";
  const issueAuthor = process.env.ISSUE_AUTHOR || "VJAI Community";

  if (!issueBody) {
    console.error("❌ ISSUE_BODY env var is required.");
    process.exit(1);
  }

  const fields = parseIssueBody(issueBody);
  console.log("📋 Parsed fields:", JSON.stringify(fields, null, 2));

  const arxivUrl = fields["arxiv url"] || fields["arxiv"];
  if (!arxivUrl?.includes("arxiv")) {
    console.error("❌ No valid arXiv URL in issue body.");
    process.exit(1);
  }

  const cycleId = fields["cycle id"];
  if (!cycleId) {
    console.error("❌ No Cycle ID in issue body.");
    process.exit(1);
  }

  // Fetch metadata
  console.log(`🔍 Fetching arXiv metadata for: ${arxivUrl}`);
  const meta = await fetchArxivMeta(arxivUrl);
  console.log(`✅ Fetched: "${meta.title}"`);

  const cyclesPath = path.resolve(__dirname, "../data/cycles.json");
  const cycles = JSON.parse(fs.readFileSync(cyclesPath, "utf8"));

  const cycle = cycles.find((c) => c.id === cycleId);
  if (!cycle) {
    console.error(`❌ Cycle "${cycleId}" not found in cycles.json.`);
    console.log(
      `   Available cycles: ${cycles.map((c) => c.id).join(", ")}`
    );
    process.exit(1);
  }

  if (cycle.status !== "exploration") {
    console.error(
      `❌ Cycle "${cycleId}" is in "${cycle.status}" status — nominations only accepted during exploration.`
    );
    process.exit(1);
  }

  // Prevent duplicates within the cycle
  const dup = cycle.nominations.find(
    (n) => n.arxiv === meta.arxiv_url || n.title.toLowerCase() === meta.title.toLowerCase()
  );
  if (dup) {
    console.log(`⚠️  Already nominated: "${dup.title}". Skipping.`);
    process.exit(0);
  }

  const tags = parseTags(fields["tags"]);
  const nomId = `p${cycle.nominations.length + 1}-${slugify(meta.title).slice(0, 15)}`;

  const nomination = {
    id: nomId,
    title: meta.title,
    proposer: issueAuthor,
    arxiv: meta.arxiv_url,
    tags: tags.length ? tags : ["Uncategorized"],
    is_selected: false,
    votes: 0,
    issue_number: parseInt(issueNumber, 10),
  };

  cycle.nominations.push(nomination);
  fs.writeFileSync(cyclesPath, JSON.stringify(cycles, null, 2) + "\n");
  console.log(`✅ Nomination added to cycle "${cycleId}": "${meta.title}"`);

  const summary = `### 🗳️ Nomination Added\n\n**${meta.title}**\n- Cycle: \`${cycleId}\`\n- Proposer: @${issueAuthor}\n- arXiv: ${meta.arxiv_url}\n\nReact with 👍 on the issue to vote!\n`;
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
  }
}

main().catch((err) => {
  console.error("❌ Script failed:", err.message);
  process.exit(1);
});
