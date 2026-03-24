#!/usr/bin/env node
// scripts/lib/arxiv.js
// Fetches paper metadata from the arXiv API given any arXiv URL or ID.

/**
 * Extract the arXiv ID from a URL or raw ID string.
 * Handles:
 *   https://arxiv.org/abs/2501.12948
 *   https://arxiv.org/pdf/2501.12948
 *   2501.12948
 *   2501.12948v2
 */
function extractArxivId(input) {
  const clean = input.trim();
  // Match ID in URL path
  const urlMatch = clean.match(/arxiv\.org\/(?:abs|pdf)\/([0-9]{4}\.[0-9]{4,5}(?:v\d+)?)/i);
  if (urlMatch) return urlMatch[1].replace(/v\d+$/, "");
  // Raw ID
  const rawMatch = clean.match(/^([0-9]{4}\.[0-9]{4,5})(?:v\d+)?$/);
  if (rawMatch) return rawMatch[1];
  throw new Error(`Cannot parse arXiv ID from: "${input}"`);
}

/**
 * Fetch metadata for an arXiv paper.
 * Returns: { id, title, authors, abstract, year, arxiv_url }
 */
async function fetchArxivMeta(arxivUrlOrId) {
  const id = extractArxivId(arxivUrlOrId);
  const apiUrl = `https://export.arxiv.org/api/query?id_list=${id}&max_results=1`;

  const res = await fetch(apiUrl, {
    headers: { "User-Agent": "vjai-paper-hub/1.0 (github.com/vjai)" },
  });

  if (!res.ok) {
    throw new Error(`arXiv API returned ${res.status} for ID ${id}`);
  }

  const xml = await res.text();

  // --- Parse fields from Atom XML (no external parser needed) ---

  const getField = (tag) => {
    const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
    const m = xml.match(re);
    return m ? m[1].replace(/<[^>]+>/g, "").trim().replace(/\s+/g, " ") : "";
  };

  const title = getField("title");
  const abstract = getField("summary");

  // Published date → year
  const pubMatch = xml.match(/<published>(\d{4})/);
  const year = pubMatch ? parseInt(pubMatch[1], 10) : new Date().getFullYear();

  // Authors (multiple <name> inside <author>)
  const authorBlocks = [...xml.matchAll(/<author>[\s\S]*?<name>(.*?)<\/name>[\s\S]*?<\/author>/gi)];
  const authors = authorBlocks
    .map((m) => m[1].trim())
    .slice(0, 4) // cap at 4 to stay concise
    .join(", ");

  if (!title) throw new Error(`No paper found for arXiv ID: ${id}`);

  return {
    id,
    title,
    authors: authors || "Unknown",
    abstract,
    year,
    arxiv_url: `https://arxiv.org/abs/${id}`,
  };
}

module.exports = { extractArxivId, fetchArxivMeta };
