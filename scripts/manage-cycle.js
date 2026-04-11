#!/usr/bin/env node
// scripts/manage-cycle.js
// Triggered by: GitHub Actions on issue labeled "manage-cycle"
// Supports three actions:
//   status  — change a cycle's status (planned | active | archived)
//   edit    — update theme / month / year fields
//   delete  — remove a planned cycle entirely

const fs   = require("fs");
const path = require("path");
const { parseIssueBody } = require("./lib/parse-issue");

const VALID_STATUSES = ["planned", "active", "archived"];
const VALID_ACTIONS  = ["status", "edit", "delete"];

async function main() {
  const issueBody = process.env.ISSUE_BODY;
  if (!issueBody) { console.error("❌ ISSUE_BODY env var is required."); process.exit(1); }

  const fields = parseIssueBody(issueBody);
  console.log("📋 Parsed fields:", JSON.stringify(fields, null, 2));

  const cycleId = (fields["cycle id"] || "").trim();
  const action  = (fields["action"] || "").toLowerCase().trim();
  const newStatus = (fields["new status (for status action)"] || fields["new status"] || "").toLowerCase().trim();
  const newTheme  = (fields["new theme (for edit action)"] || fields["new theme"] || "").trim();
  const newMonth  = (fields["new month (for edit action)"] || fields["new month"] || "").trim();
  const newYear   = (fields["new year (for edit action)"] || fields["new year"] || "").trim();
  const notes     = (fields["notes (optional)"] || fields["notes"] || "").trim();

  if (!cycleId) { console.error("❌ Cycle ID is required."); process.exit(1); }
  if (!VALID_ACTIONS.includes(action)) {
    console.error(`❌ Invalid action "${action}". Must be one of: ${VALID_ACTIONS.join(", ")}`);
    process.exit(1);
  }

  const cyclesPath = path.resolve(__dirname, "../data/cycles.json");
  const cycles = JSON.parse(fs.readFileSync(cyclesPath, "utf8"));

  const idx = cycles.findIndex((c) => c.id === cycleId);
  if (idx === -1) {
    console.error(`❌ Cycle "${cycleId}" not found.`);
    process.exit(1);
  }

  const cycle = cycles[idx];
  let summary = "";

  // ── Action: status ────────────────────────────────────────────
  if (action === "status") {
    if (!VALID_STATUSES.includes(newStatus)) {
      console.error(`❌ Invalid status "${newStatus}". Must be one of: ${VALID_STATUSES.join(", ")}`);
      process.exit(1);
    }
    const old = cycle.status || "unknown";
    cycle.status = newStatus;
    summary = `## ✅ Cycle Status Updated\n\n| Field | Value |\n|---|---|\n| Cycle | \`${cycleId}\` |\n| Old Status | \`${old}\` |\n| New Status | \`${newStatus}\` |\n${notes ? `| Notes | ${notes} |` : ""}`;
    console.log(`✅ ${cycleId}: status ${old} → ${newStatus}`);
  }

  // ── Action: edit ──────────────────────────────────────────────
  else if (action === "edit") {
    const changes = [];
    if (newTheme) {
      changes.push(`Theme: "${cycle.theme}" → "${newTheme}"`);
      cycle.theme = newTheme;
    }
    if (newMonth) {
      changes.push(`Month: "${cycle.month}" → "${newMonth}"`);
      cycle.month = newMonth;
    }
    if (newYear) {
      const y = parseInt(newYear, 10);
      if (isNaN(y)) { console.error("❌ New Year must be a valid integer."); process.exit(1); }
      changes.push(`Year: ${cycle.year} → ${y}`);
      cycle.year = y;
    }
    if (changes.length === 0) {
      console.log("⚠️  No fields to update. Exiting without changes.");
      process.exit(0);
    }
    const changesList = changes.map((c) => `- ${c}`).join("\n");
    summary = `## ✅ Cycle Edited\n\n**Cycle:** \`${cycleId}\`\n\n**Changes:**\n${changesList}\n${notes ? `\n**Notes:** ${notes}` : ""}`;
    console.log(`✅ ${cycleId}: edited`);
    changes.forEach((c) => console.log("  " + c));
  }

  // ── Action: delete ────────────────────────────────────────────
  else if (action === "delete") {
    if (cycle.status !== "planned") {
      console.error(`❌ Cannot delete cycle "${cycleId}" — only planned cycles can be deleted (current status: "${cycle.status}").`);
      process.exit(1);
    }
    if (cycle.nominations && cycle.nominations.length > 0) {
      console.error(`❌ Cannot delete cycle "${cycleId}" — it has ${cycle.nominations.length} existing nomination(s). Archive it instead.`);
      process.exit(1);
    }
    cycles.splice(idx, 1);
    summary = `## 🗑️ Cycle Deleted\n\n**Cycle:** \`${cycleId}\`\n\n> Cycle was in \`planned\` status with no nominations.\n${notes ? `\n**Notes:** ${notes}` : ""}`;
    console.log(`🗑️  Deleted planned cycle: ${cycleId}`);
  }

  // ── Write back ────────────────────────────────────────────────
  fs.writeFileSync(cyclesPath, JSON.stringify(cycles, null, 2) + "\n");
  console.log("💾 Saved cycles.json");

  // GitHub step summary
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary + "\n");
  }
  // Output for comment step
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `summary<<EOF\n${summary}\nEOF\n`);
  }
}

main().catch((err) => {
  console.error("❌ Unexpected error:", err.message);
  process.exit(1);
});
