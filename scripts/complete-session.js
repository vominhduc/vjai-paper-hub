#!/usr/bin/env node
// scripts/complete-session.js
// Triggered by: GitHub Actions on issue labeled "completed" + "archive"
// Reads: ISSUE_BODY env var
// Actions:
//   1. Fetches arXiv metadata
//   2. Moves selected paper from cycles.json → archive.json
//   3. Marks the cycle as complete, removes it from active exploration
//   4. Removes paper from seeds.json (if present)

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
  console.log("📋 Parsed fields:", JSON.stringify(fields, null, 2));

  const arxivUrl = fields["arxiv url"] || fields["arxiv"];
  if (!arxivUrl?.includes("arxiv")) {
    console.error("❌ No valid arXiv URL.");
    process.exit(1);
  }

  const cycleId = fields["cycle id"];
  if (!cycleId) {
    console.error("❌ No Cycle ID.");
    process.exit(1);
  }

  // Fetch arXiv metadata
  console.log(`🔍 Fetching metadata for: ${arxivUrl}`);
  const meta = await fetchArxivMeta(arxivUrl);
  console.log(`✅ Fetched: "${meta.title}"`);

  // Parse issue fields
  const presenter = fields["presenter name"] || fields["presenter"] || "VJAI Community";
  const presenterRole = fields["presenter role"] || "VJAI Member";
  const dateRead = fields["session date yyyymmdd"] || fields["session date"] || new Date().toISOString().slice(0, 10);
  const sessionStatus = fields["reproduction status"] || "Archived";
  const vibeScore = Math.min(100, Math.max(0, parseInt(fields["vibe score 0100"] || fields["vibe score"] || "75", 10)));
  const youtubeUrl = fields["youtube recording url optional"] || fields["youtube"] || "";
  const githubUrl = fields["papers official github optional"] || fields["github"] || "";
  const vjaiCodeUrl = fields["vjai reproduction repo url optional"] || fields["vjai code"] || "";
  const blogUrl = fields["blog post url optional"] || fields["blog"] || "";
  const tldrRaw = fields["tldr bullets 3 lines"] || fields["tldr"] || meta.abstract.slice(0, 200);
  const tldr = tldrRaw.split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 3);
  const summary = fields["onesentence summary"] || fields["summary"] || meta.abstract.slice(0, 150);
  const conference = fields["conference  venue"] || fields["conference"] || "Preprint";
  const tags = parseTags(fields["tags commaseparated"] || fields["tags"]);

  // ── 1. Update cycles.json ──────────────────────────────────
  const cyclesPath = path.resolve(__dirname, "../data/cycles.json");
  const cycles = JSON.parse(fs.readFileSync(cyclesPath, "utf8"));

  const cycle = cycles.find((c) => c.id === cycleId);
  if (!cycle) {
    console.error(`❌ Cycle "${cycleId}" not found.`);
    process.exit(1);
  }

  // Mark cycle as completed
  cycle.status = "completed";
  fs.writeFileSync(cyclesPath, JSON.stringify(cycles, null, 2) + "\n");
  console.log(`✅ Cycle "${cycleId}" marked as completed.`);

  // ── 2. Build archive entry ─────────────────────────────────
  const archivePath = path.resolve(__dirname, "../data/archive.json");
  const archive = JSON.parse(fs.readFileSync(archivePath, "utf8"));

  // Deduplicate
  const dup = archive.find(
    (p) => p.resources?.arxiv === meta.arxiv_url || p.title.toLowerCase() === meta.title.toLowerCase()
  );
  if (dup) {
    console.log(`⚠️  Already in archive: "${dup.title}". Updating fields instead.`);
    Object.assign(dup, {
      status: sessionStatus,
      presenter,
      date_read: dateRead,
      vibeScore,
      summary,
      tldr,
      resources: {
        arxiv: meta.arxiv_url,
        github: githubUrl,
        vjai_code: vjaiCodeUrl,
        youtube: youtubeUrl,
        blog: blogUrl,
      },
      tags: tags.length ? tags : dup.tags,
    });
    fs.writeFileSync(archivePath, JSON.stringify(archive, null, 2) + "\n");
    console.log(`✅ Updated existing archive entry: "${dup.title}"`);
  } else {
    const archiveId = slugify(meta.title).slice(0, 30);
    const entry = {
      id: archiveId,
      title: meta.title,
      authors: meta.authors,
      conference,
      year: meta.year,
      status: sessionStatus,
      presenter,
      presenter_role: presenterRole,
      tags: tags.length ? tags : ["Uncategorized"],
      date_read: dateRead,
      vibeScore,
      resources: {
        arxiv: meta.arxiv_url,
        github: githubUrl,
        vjai_code: vjaiCodeUrl,
        youtube: youtubeUrl,
        blog: blogUrl,
      },
      summary,
      tldr,
      abstract: meta.abstract,
      issue_number: parseInt(issueNumber, 10),
    };

    archive.unshift(entry); // newest first
    fs.writeFileSync(archivePath, JSON.stringify(archive, null, 2) + "\n");
    console.log(`✅ Added to archive: "${meta.title}" (${archiveId})`);
  }

  // ── 3. Remove from seeds.json if present ──────────────────
  const seedsPath = path.resolve(__dirname, "../data/seeds.json");
  const seeds = JSON.parse(fs.readFileSync(seedsPath, "utf8"));
  const seedIdx = seeds.findIndex(
    (s) => s.arxiv === meta.arxiv_url || s.title.toLowerCase() === meta.title.toLowerCase()
  );
  if (seedIdx !== -1) {
    const removed = seeds.splice(seedIdx, 1)[0];
    fs.writeFileSync(seedsPath, JSON.stringify(seeds, null, 2) + "\n");
    console.log(`🌱 Removed from seeds.json: "${removed.title}"`);
  }

  const stepSummary = `### ✅ Session Completed\n\n**${meta.title}**\n- Cycle: \`${cycleId}\`\n- Presenter: ${presenter}\n- Vibe Score: ${vibeScore}%\n- Status: ${sessionStatus}\n- arXiv: ${meta.arxiv_url}\n`;
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, stepSummary);
  }
}

main().catch((err) => {
  console.error("❌ Script failed:", err.message);
  process.exit(1);
});
