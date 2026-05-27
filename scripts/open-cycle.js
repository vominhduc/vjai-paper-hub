#!/usr/bin/env node
// scripts/open-cycle.js
// Triggered by: GitHub Actions on issue labeled "new-cycle"
// Writes: data/cycles.json (appends new active cycle)

const fs = require("fs");
const path = require("path");
const { parseIssueBody } = require("./lib/parse-issue");

async function main() {
  const issueBody = process.env.ISSUE_BODY;
  if (!issueBody) {
    console.error("❌ ISSUE_BODY env var is required.");
    process.exit(1);
  }

  const fields = parseIssueBody(issueBody);
  console.log("📋 Parsed fields:", JSON.stringify(fields, null, 2));

  const cycleId        = (fields["cycle id"] || "").trim();
  const month          = (fields["month"] || "").trim();
  const year           = parseInt(fields["year"] || new Date().getFullYear(), 10);
  const theme          = (fields["cycle theme"] || "TBD").trim();
  const nominationEnd  = (fields["nomination end date yyyymmdd"] || fields["nomination end date"] || "").trim();
  const explorationStart = (fields["exploration session date yyyymmdd"] || fields["exploration session date"] || "").trim();
  const sessionDate    = (fields["deep dive session date yyyymmdd optional"] || fields["deep dive session date"] || "").trim();
  const presenter      = (fields["tentative presenter can be tbd"] || fields["presenter"] || "TBD").trim();
  const presenterRole  = (fields["presenter role"] || "VJAI Community").trim();

  if (!cycleId) {
    console.error("❌ Cycle ID is required.");
    process.exit(1);
  }

  const cyclesPath = path.resolve(__dirname, "../data/cycles.json");
  const cycles = JSON.parse(fs.readFileSync(cyclesPath, "utf8"));

  if (cycles.find((c) => c.id === cycleId)) {
    console.log(`⚠️  Cycle "${cycleId}" already exists. Skipping.`);
    process.exit(0);
  }

  const newCycle = {
    id: cycleId,
    month,
    year,
    theme,
    status: "active",
    nomination_end: nominationEnd,
    exploration_start: explorationStart,
    session_date: sessionDate,
    nominations: [],
    session: {
      date: sessionDate,
      location: "TBD",
      presenter,
      presenter_role: presenterRole,
      agenda: [],
    },
  };

  cycles.push(newCycle);
  fs.writeFileSync(cyclesPath, JSON.stringify(cycles, null, 2) + "\n");
  console.log(`✅ Opened new cycle: "${cycleId}" — ${theme}`);

  const issueNumber = process.env.ISSUE_NUMBER || "?";
  const repoUrl = `https://github.com/${process.env.GITHUB_REPOSITORY || "vominhduc/vjai-paper-hub"}`;
  const summary = [
    `### 📅 New Cycle Opened`,
    ``,
    `**${cycleId}** — ${theme}`,
    `- Month: ${month} ${year}`,
    `- Nomination End: ${nominationEnd || "TBD"}`,
    `- Exploration: ${explorationStart || "TBD"}`,
    `- Deep Dive: ${sessionDate || "TBD"}`,
    ``,
    `Nominations are now open! Use the [Nominate template](${repoUrl}/issues/new?template=02-nominate-cycle.yml) to add papers.`,
  ].join("\n");

  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
  }
}

main().catch((err) => {
  console.error("❌ open-cycle failed:", err.message);
  process.exit(1);
});
