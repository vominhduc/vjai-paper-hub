#!/usr/bin/env node
// scripts/add-nomination.js
// Triggered by: GitHub Actions on issue labeled "nomination"
// Reads: ISSUE_BODY, ISSUE_AUTHOR, ISSUE_TITLE env vars
// Writes: data/cycles.json  (appends nomination to target cycle)
// Also fetches arXiv metadata automatically when an arXiv link is provided.

const fs = require("fs");
const path = require("path");
const { fetchArxivMeta } = require("./lib/arxiv");
const { parseIssueBody, slugify, parseTags } = require("./lib/parse-issue");

async function main() {
  const issueBody = process.env.ISSUE_BODY;
  const issueNumber = process.env.ISSUE_NUMBER || "0";
  const issueAuthor = process.env.ISSUE_AUTHOR || "VJAI Community";
  const issueTitle = process.env.ISSUE_TITLE || "";

  if (!issueBody) {
    console.error("❌ ISSUE_BODY env var is required.");
    process.exit(1);
  }

  const fields = parseIssueBody(issueBody);
  console.log("📋 Parsed fields:", JSON.stringify(fields, null, 2));

  // Prefer the self-reported name from the form; fall back to GitHub login
  // parseIssueBody lowercases and strips non-alphanumeric chars except spaces,
  // so "Your Name / Handle" → "your name  handle"
  const nominatorName = (
    fields["your name  handle"] ||
    fields["your name / handle"] ||
    fields["nominator name"] ||
    ""
  ).trim();
  const proposer = nominatorName || issueAuthor;

  // Accept either the new "paper url" field or the legacy "arxiv url" field
  const paperUrl = fields["paper url"] || fields["arxiv url"] || fields["arxiv"] || "";
  if (!paperUrl) {
    console.error("❌ No Paper URL found in issue body.");
    process.exit(1);
  }

  // Title always comes from the issue title ("Nominate: Paper Title" → "Paper Title").
  const title = issueTitle.replace(/^nominate:\s*/i, "").trim();
  if (!title) {
    console.error("❌ Issue title is empty. Please set it to \"Nominate: Your Paper Title\".");
    process.exit(1);
  }

  const looksLikeArxiv = paperUrl.toLowerCase().includes("arxiv") ||
    /^\d{4}\.\d{4,5}(v\d+)?$/.test(paperUrl.trim());

  let arxivUrl;

  if (looksLikeArxiv) {
    console.log(`🔍 Fetching arXiv URL for: ${paperUrl}`);
    const meta = await fetchArxivMeta(paperUrl);
    arxivUrl = meta.arxiv_url;
    console.log(`✅ Resolved arXiv URL: ${arxivUrl}`);
  } else {
    arxivUrl = null;
    console.log(`📄 Non-arXiv paper: "${title}" → ${paperUrl}`);
  }

  const cycleId = fields["cycle id"];
  if (!cycleId) {
    console.error("❌ No Cycle ID in issue body.");
    process.exit(1);
  }

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

  // Accept nominations for active cycles that are still in the nominating phase
  // (today <= nomination_end), OR active cycles with no dates yet (planned/just opened).
  // Reject only if status is explicitly not "active", or if nomination window has closed.
  if (cycle.status !== "active") {
    console.error(
      `❌ Cycle "${cycleId}" has status "${cycle.status}" — nominations only accepted for active cycles.`
    );
    process.exit(1);
  }
  if (cycle.nomination_end) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nomEnd = new Date(cycle.nomination_end);
    nomEnd.setHours(0, 0, 0, 0);
    if (today > nomEnd) {
      console.error(
        `❌ Nominations for cycle "${cycleId}" closed on ${cycle.nomination_end}.`
      );
      process.exit(1);
    }
  }

  // Prevent duplicates within the cycle
  const dup = cycle.nominations.find(
    (n) => (arxivUrl && n.arxiv === arxivUrl) ||
           (n.paper_url && n.paper_url === paperUrl) ||
           n.title.toLowerCase() === title.toLowerCase()
  );
  if (dup) {
    console.log(`⚠️  Already nominated: "${dup.title}". Skipping.`);
    process.exit(0);
  }

  const tags = parseTags(fields["tags"]);
  const nomId = `p${cycle.nominations.length + 1}-${slugify(title).slice(0, 15)}`;

  const nomination = {
    id: nomId,
    title,
    proposer: proposer,
    ...(arxivUrl ? { arxiv: arxivUrl } : { paper_url: paperUrl }),
    tags: tags.length ? tags : ["Uncategorized"],
    is_selected: false,
    votes: 0,
    issue_number: parseInt(issueNumber, 10),
  };

  cycle.nominations.push(nomination);
  fs.writeFileSync(cyclesPath, JSON.stringify(cycles, null, 2) + "\n");
  console.log(`✅ Nomination added to cycle "${cycleId}": "${title}"`);

  const paperLink = arxivUrl || paperUrl;
  const summary = `### 🗳️ Nomination Added\n\n**${title}**\n- Cycle: \`${cycleId}\`\n- Proposer: ${proposer} (GitHub: @${issueAuthor})\n- Paper: ${paperLink}\n\nReact with 👍 on the issue to vote!\n`;
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
  }
}

main().catch((err) => {
  console.error("❌ Script failed:", err.message);
  process.exit(1);
});
