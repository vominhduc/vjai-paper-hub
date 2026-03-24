#!/usr/bin/env node
// scripts/open-cycle.js
// Triggered by: GitHub Actions on issue labeled "new-cycle"
// Writes: data/cycles.json (appends new exploration-phase cycle)

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

  const cycleId = fields["cycle id"];
  const quarter = fields["quarter"];
  const cycleNum = parseInt(fields["cycle number within quarter"] || fields["cycle number"] || "1", 10);
  const theme = fields["cycle theme"] || "TBD";
  const sessionDate = fields["planned session date yyyymmdd"] || fields["planned session date"] || "";
  const presenter = fields["tentative presenter can be tbd"] || fields["presenter"] || "TBD";
  const presenterRole = fields["presenter role"] || "VJAI Community";

  if (!cycleId || !quarter) {
    console.error("❌ Cycle ID and Quarter are required.");
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
    quarter,
    cycle: cycleNum,
    status: "exploration",
    theme,
    nominations: [],
    session: {
      date: sessionDate,
      presenter,
      presenter_role: presenterRole,
      agenda: [],
    },
  };

  cycles.push(newCycle);
  fs.writeFileSync(cyclesPath, JSON.stringify(cycles, null, 2) + "\n");
  console.log(`✅ Opened new cycle: "${cycleId}" — ${theme}`);

  const summary = `### 📅 New Cycle Opened\n\n**${cycleId}**\n- Quarter: ${quarter}\n- Theme: ${theme}\n- Session Date: ${sessionDate || "TBD"}\n\nNominations are now open! Use the [Nominate template](../../issues/new?template=02-nominate-cycle.yml) to add papers.\n`;
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
  }
}

main().catch((err) => {
  console.error("❌ open-cycle failed:", err.message);
  process.exit(1);
});
