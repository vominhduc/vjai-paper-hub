#!/usr/bin/env node
// scripts/lib/parse-issue.js
// Parses GitHub Issue body (generated from .yml form templates) into a key→value map.

/**
 * GitHub Issue forms render as Markdown with sections like:
 *
 * ### arXiv URL
 * https://arxiv.org/abs/2501.12948
 *
 * ### Domain
 * LLM
 *
 * This function returns { "arxiv url": "https://...", "domain": "LLM", ... }
 * Keys are lowercased & trimmed. Values are trimmed strings.
 */
function parseIssueBody(body) {
  if (!body) return {};

  const result = {};
  // Split on "### " headings
  const sections = body.split(/^###\s+/m).filter(Boolean);

  for (const section of sections) {
    const lines = section.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) continue;

    const key = lines[0].toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
    // Value is everything after the heading, skip empty placeholder lines
    const value = lines
      .slice(1)
      .filter((l) => l !== "_No response_" && l !== "None")
      .join("\n")
      .trim();

    if (key && value) result[key] = value;
  }

  return result;
}

/**
 * Generate a slug ID from a title string.
 * e.g. "LoRA: Low-Rank Adaptation..." → "lora-low-rank-adaptation"
 */
function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 40);
}

/**
 * Parse a comma-separated tags string into a trimmed array.
 */
function parseTags(raw) {
  if (!raw) return [];
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

module.exports = { parseIssueBody, slugify, parseTags };
