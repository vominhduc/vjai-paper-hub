#!/usr/bin/env node
// scripts/sync-votes.js
// Triggered by: GitHub Actions on a schedule (every 6 hours) or manual dispatch
// Reads: All open issues labeled "nomination" via GitHub API
// Writes: data/cycles.json  (updates vote counts from 👍 reactions, marks is_selected)
//
// Env vars required:
//   GITHUB_TOKEN   – classic PAT or Actions GITHUB_TOKEN with read:issues
//   GITHUB_REPO    – "owner/repo" e.g. "vjai/paper-hub"

const fs = require("fs");
const path = require("path");

const REPO = process.env.GITHUB_REPO;
const TOKEN = process.env.GITHUB_TOKEN;

if (!REPO || !TOKEN) {
  console.error("❌ GITHUB_REPO and GITHUB_TOKEN env vars are required.");
  process.exit(1);
}

async function ghFetch(endpoint) {
  const res = await fetch(`https://api.github.com/repos/${REPO}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!res.ok) throw new Error(`GitHub API ${endpoint} → ${res.status}`);
  return res.json();
}

async function main() {
  const cyclesPath = path.resolve(__dirname, "../data/cycles.json");
  const cycles = JSON.parse(fs.readFileSync(cyclesPath, "utf8"));

  // Only process exploration-phase cycles
  const activeCycles = cycles.filter((c) => c.status === "exploration");
  if (!activeCycles.length) {
    console.log("ℹ️  No exploration-phase cycles found. Nothing to sync.");
    return;
  }

  // Fetch all open issues with label "nomination"
  let page = 1;
  let allIssues = [];
  while (true) {
    const batch = await ghFetch(`/issues?state=open&labels=nomination&per_page=100&page=${page}`);
    if (!batch.length) break;
    allIssues = allIssues.concat(batch);
    if (batch.length < 100) break;
    page++;
  }
  console.log(`🔍 Found ${allIssues.length} open nomination issues.`);

  // For each nomination in each active cycle, try to match to an issue
  let totalUpdated = 0;
  for (const cycle of activeCycles) {
    for (const nom of cycle.nominations) {
      if (!nom.issue_number) continue;
      const issue = allIssues.find((i) => i.number === nom.issue_number);
      if (!issue) continue;

      // Count +1 reactions
      const reactions = await ghFetch(`/issues/${issue.number}/reactions`);
      const thumbsUp = reactions.filter((r) => r.content === "+1").length;

      if (thumbsUp !== nom.votes) {
        console.log(`  ↑ #${issue.number} "${nom.title.slice(0, 50)}…" → ${nom.votes} → ${thumbsUp} votes`);
        nom.votes = thumbsUp;
        totalUpdated++;
      }
    }

    // Re-select the nomination with the most votes (only if none is_selected yet)
    const hasSelected = cycle.nominations.some((n) => n.is_selected);
    if (!hasSelected && cycle.nominations.length > 0) {
      const best = [...cycle.nominations].sort((a, b) => b.votes - a.votes)[0];
      // Don't auto-select unless it has at least 3 votes (prevents 0-vote auto-selection)
      if (best.votes >= 3) {
        best.is_selected = true;
        console.log(`🏆 Auto-selected: "${best.title.slice(0, 60)}" with ${best.votes} votes in cycle ${cycle.id}`);
      }
    }
  }

  fs.writeFileSync(cyclesPath, JSON.stringify(cycles, null, 2) + "\n");
  console.log(`✅ Vote sync complete. Updated ${totalUpdated} nominations.`);

  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      `### 🗳️ Vote Sync\nUpdated **${totalUpdated}** nomination vote counts.\n`
    );
  }
}

main().catch((err) => {
  console.error("❌ sync-votes failed:", err.message);
  process.exit(1);
});
