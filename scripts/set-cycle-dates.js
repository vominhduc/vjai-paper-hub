#!/usr/bin/env node
// scripts/set-cycle-dates.js
// Triggered by: GitHub Actions on issue labeled "set-dates"
// Writes: data/cycles.json (updates dates for an existing cycle)

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

  const cycleId       = (fields["cycle id"] || "").trim();
  const nominationEnd = (fields["nomination deadline yyyymmdd"] || fields["nomination deadline"] || "").trim();
  const explorationStart = (fields["exploration session date yyyymmdd"] || fields["exploration session date"] || "").trim();
  const sessionDate   = (fields["deep dive session date yyyymmdd"] || fields["deep dive session date"] || "").trim();
  const presenter     = (fields["presenter optional  leave blank to keep existing"] || fields["presenter"] || "").trim();
  const presenterRole = (fields["presenter role optional"] || fields["presenter role"] || "").trim();
  const location      = (fields["location optional"] || fields["location"] || "").trim();

  if (!cycleId) {
    console.error("❌ Cycle ID is required.");
    process.exit(1);
  }
  if (!nominationEnd || !explorationStart || !sessionDate) {
    console.error("❌ All three dates (nomination deadline, exploration, deep dive) are required.");
    process.exit(1);
  }

  // Validate date formats
  const dateRe = /^\d{4}-\d{2}-\d{2}$/;
  for (const [label, val] of [
    ["Nomination Deadline", nominationEnd],
    ["Exploration Start", explorationStart],
    ["Deep Dive Date", sessionDate],
  ]) {
    if (!dateRe.test(val)) {
      console.error(`❌ ${label} "${val}" is not in YYYY-MM-DD format.`);
      process.exit(1);
    }
  }

  // Validate ordering
  if (nominationEnd >= explorationStart) {
    console.error(`❌ Nomination deadline (${nominationEnd}) must be before exploration date (${explorationStart}).`);
    process.exit(1);
  }
  if (explorationStart >= sessionDate) {
    console.error(`❌ Exploration date (${explorationStart}) must be before deep dive date (${sessionDate}).`);
    process.exit(1);
  }

  const cyclesPath = path.resolve(__dirname, "../data/cycles.json");
  const cycles = JSON.parse(fs.readFileSync(cyclesPath, "utf8"));

  const idx = cycles.findIndex((c) => c.id === cycleId);
  if (idx === -1) {
    console.error(`❌ Cycle "${cycleId}" not found in cycles.json.`);
    console.error(`   Available cycles: ${cycles.map((c) => c.id).join(", ")}`);
    process.exit(1);
  }

  const cycle = cycles[idx];

  // Capture old values for the commit message / comment
  const old = {
    nomination_end:    cycle.nomination_end    || "not set",
    exploration_start: cycle.exploration_start || "not set",
    session_date:      cycle.session_date      || "not set",
  };

  // Apply updates
  cycle.nomination_end    = nominationEnd;
  cycle.exploration_start = explorationStart;
  cycle.session_date      = sessionDate;

  if (presenter)     cycle.session.presenter      = presenter;
  if (presenterRole) cycle.session.presenter_role = presenterRole;
  if (location)      cycle.session.location       = location;

  // Also update the session.date field (used for display)
  cycle.session.date = sessionDate;

  cycles[idx] = cycle;
  fs.writeFileSync(cyclesPath, JSON.stringify(cycles, null, 2) + "\n");

  console.log(`✅ Updated cycle "${cycleId}" dates:`);
  console.log(`   Nomination deadline : ${old.nomination_end} → ${nominationEnd}`);
  console.log(`   Exploration session : ${old.exploration_start} → ${explorationStart}`);
  console.log(`   Deep Dive session   : ${old.session_date} → ${sessionDate}`);
  if (presenter)     console.log(`   Presenter           : ${cycle.session.presenter}`);
  if (presenterRole) console.log(`   Presenter role      : ${cycle.session.presenter_role}`);
  if (location)      console.log(`   Location            : ${cycle.session.location}`);

  // Write summary for GitHub Actions step summary
  const summary = [
    `### 📅 Cycle Dates Updated: \`${cycleId}\``,
    ``,
    `| Field | Before | After |`,
    `|---|---|---|`,
    `| Nomination Deadline | \`${old.nomination_end}\` | \`${nominationEnd}\` |`,
    `| Exploration Session | \`${old.exploration_start}\` | \`${explorationStart}\` |`,
    `| Deep Dive Session   | \`${old.session_date}\` | \`${sessionDate}\` |`,
    presenter     ? `| Presenter           | — | ${presenter} |` : "",
    presenterRole ? `| Presenter Role      | — | ${presenterRole} |` : "",
  ].filter(Boolean).join("\n");

  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath) fs.appendFileSync(summaryPath, summary + "\n");

  // Export for the workflow comment step
  const outputPath = process.env.GITHUB_OUTPUT;
  if (outputPath) {
    fs.appendFileSync(outputPath, `cycle_id=${cycleId}\n`);
    fs.appendFileSync(outputPath, `exploration_start=${explorationStart}\n`);
    fs.appendFileSync(outputPath, `session_date=${sessionDate}\n`);
    fs.appendFileSync(outputPath, `comment_body=${summary.replace(/\n/g, "%0A")}\n`);
  }
}

main().catch((err) => {
  console.error("❌ Unexpected error:", err);
  process.exit(1);
});
