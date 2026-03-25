"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  GitFork,
  Search,
  ChevronRight,
  Sprout,
  X,
  Zap,
  Plus,
} from "lucide-react";
import { seeds } from "@/lib/data";
import type { SeedPaper } from "@/lib/data";

/* ─── Seed Card ───────────────────────────────────────────── */
function SeedCard({ paper }: { paper: SeedPaper }) {
  const isClaimed = paper.claimedBy !== null;

  return (
    <div
      className="glass-card glow-border-hover rounded-2xl p-6 flex flex-col gap-4 relative"
      style={{
        border: isClaimed
          ? "1px solid rgba(76,175,80,0.3)"
          : "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          <span
            className="text-xs font-bold px-2.5 py-0.5 rounded-full"
            style={{
              background: "rgba(255,87,34,0.1)",
              color: "#FF7043",
              border: "1px solid rgba(255,87,34,0.25)",
            }}
          >
            {paper.domain}
          </span>
          <span
            className="text-xs px-2.5 py-0.5 rounded-full"
            style={{
              background: "rgba(255,255,255,0.06)",
              color: "rgba(232,234,246,0.5)",
            }}
          >
            {paper.conference} {paper.year}
          </span>
        </div>
        {isClaimed ? (
          <span className="badge-claimed text-xs px-2.5 py-0.5 rounded-full shrink-0 font-bold whitespace-nowrap">
            ✓ Claimed
          </span>
        ) : (
          <span
            className="text-xs px-2.5 py-0.5 rounded-full shrink-0 font-semibold"
            style={{
              background: "rgba(66,165,245,0.1)",
              color: "#42A5F5",
              border: "1px solid rgba(66,165,245,0.2)",
            }}
          >
            Open
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-sm font-bold text-white leading-snug flex-1">{paper.title}</h3>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {paper.tags.map((t) => (
          <span key={t} className="paper-tag text-xs px-2 py-0.5 rounded-full">
            {t}
          </span>
        ))}
      </div>

      {/* Description */}
      <p className="text-xs leading-relaxed" style={{ color: "rgba(232,234,246,0.55)" }}>
        {paper.description}
      </p>

      {/* Hackability score */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold" style={{ color: "rgba(232,234,246,0.45)" }}>
            <Zap size={10} className="inline mr-1" />
            Hackability
          </span>
          <span className="text-xs font-bold" style={{ color: "#FF5722" }}>
            {paper.hackabilityScore}%
          </span>
        </div>
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.07)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${paper.hackabilityScore}%`,
              background:
                paper.hackabilityScore >= 80
                  ? "linear-gradient(90deg, #4CAF50, #8BC34A)"
                  : paper.hackabilityScore >= 60
                  ? "linear-gradient(90deg, #FF5722, #FF7043)"
                  : "linear-gradient(90deg, #1A237E, #3949AB)",
            }}
          />
        </div>
      </div>

      {/* Claimed by */}
      {isClaimed && (
        <p className="text-xs font-semibold" style={{ color: "#4CAF50" }}>
          Claimed by {paper.claimedBy}
        </p>
      )}
      {!isClaimed && (
        <p className="text-xs" style={{ color: "rgba(232,234,246,0.4)" }}>
          Proposed by {paper.proposedBy}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <a
          href={paper.arxiv}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1"
          style={{
            background: "rgba(255,87,34,0.1)",
            color: "#FF5722",
            border: "1px solid rgba(255,87,34,0.25)",
          }}
        >
          <ExternalLink size={10} /> arXiv
        </a>

        {!isClaimed ? (
          <a
            href={`https://github.com/vominhduc/vjai-paper-hub/issues/new?title=Claim%3A+${encodeURIComponent(paper.title)}&labels=claim&body=I+want+to+claim+this+seed+paper.`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center btn-orange text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1"
          >
            <GitFork size={10} /> Claim
          </a>
        ) : (
          <div
            className="flex-1 text-center text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-1"
            style={{
              background: "rgba(76,175,80,0.1)",
              color: "#4CAF50",
              border: "1px solid rgba(76,175,80,0.25)",
            }}
          >
            ✓ In Progress
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────── */
export default function SeedsPage() {
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState("all");
  const [showClaimed, setShowClaimed] = useState<"all" | "open" | "claimed">("all");

  const domains = ["all", ...Array.from(new Set(seeds.map((s) => s.domain))).sort()];

  const filtered = seeds.filter((p) => {
    const q = query.toLowerCase();
    const matchQuery =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.domain.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q));
    const matchDomain = domain === "all" || p.domain === domain;
    const matchClaim =
      showClaimed === "all" ||
      (showClaimed === "open" && p.claimedBy === null) ||
      (showClaimed === "claimed" && p.claimedBy !== null);
    return matchQuery && matchDomain && matchClaim;
  });

  const hasFilters = query || domain !== "all" || showClaimed !== "all";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(160deg, #070c26 0%, #0e1550 50%, #070c26 100%)",
        color: "#e8eaf6",
      }}
    >
      {/* Header */}
      <section className="relative pt-28 pb-14 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(26,35,126,0.5) 0%, transparent 70%)",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-4 text-xs font-semibold" style={{ color: "rgba(232,234,246,0.4)" }}>
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={12} />
            <span style={{ color: "#FF5722" }}>Seeds</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Sprout size={20} style={{ color: "#4CAF50" }} />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#4CAF50" }}>
                  Curated Seed Pool
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-3">
                Seed <span className="gradient-text">Papers</span>
              </h1>
              <p className="text-base max-w-xl" style={{ color: "rgba(232,234,246,0.6)" }}>
                High-hackability research ready for implementation sprints. Claim a paper to start
                building — or propose a new one via GitHub.
              </p>
            </div>

            <a
              href="https://github.com/vominhduc/vjai-paper-hub/issues/new?labels=proposal&template=01-propose-seed.yml&title=Propose%3A+"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-orange text-white font-bold px-6 py-3 rounded-full text-sm inline-flex items-center gap-2 shrink-0"
            >
              <Plus size={15} /> Propose a Paper
            </a>
          </div>

          {/* Stats strip */}
          <div className="flex flex-wrap gap-6 mt-8">
            {[
              { value: seeds.length, label: "Curated Seeds" },
              { value: seeds.filter((s) => s.claimedBy === null).length, label: "Open to Claim" },
              { value: seeds.filter((s) => s.claimedBy !== null).length, label: "In Progress" },
              { value: Math.round(seeds.reduce((a, s) => a + s.hackabilityScore, 0) / seeds.length), label: "Avg Hackability" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-black" style={{ color: "#FF5722" }}>
                  {s.value}
                  {s.label === "Avg Hackability" ? "%" : ""}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "rgba(232,234,246,0.4)" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filters */}
      <section
        className="sticky top-16 z-30 py-4"
        style={{
          background: "rgba(7,12,38,0.9)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "rgba(232,234,246,0.35)" }}
            />
            <input
              type="text"
              placeholder="Search seeds…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-transparent text-white placeholder:opacity-40"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            />
          </div>

          {/* Domain */}
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(232,234,246,0.8)",
            }}
          >
            {domains.map((d) => (
              <option key={d} value={d} style={{ background: "#0e1550" }}>
                {d === "all" ? "All Domains" : d}
              </option>
            ))}
          </select>

          {/* Status */}
          <div className="flex gap-1">
            {(["all", "open", "claimed"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setShowClaimed(v)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold capitalize transition-all"
                style={
                  showClaimed === v
                    ? {
                        background: "rgba(255,87,34,0.2)",
                        color: "#FF5722",
                        border: "1px solid rgba(255,87,34,0.4)",
                      }
                    : {
                        background: "rgba(255,255,255,0.04)",
                        color: "rgba(232,234,246,0.45)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }
                }
              >
                {v}
              </button>
            ))}
          </div>

          {hasFilters && (
            <button
              onClick={() => { setQuery(""); setDomain("all"); setShowClaimed("all"); }}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2.5 rounded-xl transition-all"
              style={{
                background: "rgba(255,87,34,0.08)",
                color: "#FF5722",
                border: "1px solid rgba(255,87,34,0.2)",
              }}
            >
              <X size={11} /> Clear
            </button>
          )}

          <span className="text-xs ml-auto" style={{ color: "rgba(232,234,246,0.35)" }}>
            {filtered.length} of {seeds.length}
          </span>
        </div>
      </section>

      {/* Grid */}
      <section className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-6">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-4xl mb-4">🌱</div>
              <p className="text-base font-semibold text-white mb-2">No seeds found</p>
              <p className="text-sm" style={{ color: "rgba(232,234,246,0.45)" }}>
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((paper) => (
                <SeedCard key={paper.id} paper={paper} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Propose CTA */}
      <section
        className="py-16"
        style={{
          background: "rgba(7,12,38,0.6)",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="max-w-2xl mx-auto px-6 text-center">
          <Sprout size={28} className="mx-auto mb-4" style={{ color: "#4CAF50" }} />
          <h2 className="text-2xl font-black text-white mb-3">Have a Paper in Mind?</h2>
          <p className="text-sm mb-6" style={{ color: "rgba(232,234,246,0.55)" }}>
            Propose a paper that you think is hackable, impactful, and ready for a sprint.
            The community votes to add it to the seed pool.
          </p>
          <a
            href="https://github.com/vominhduc/vjai-paper-hub/issues/new?labels=proposal&template=01-propose-seed.yml&title=Propose%3A+"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-orange text-white font-bold px-8 py-3.5 rounded-full text-sm inline-flex items-center gap-2"
          >
            <Plus size={14} /> Open a GitHub Issue
          </a>
        </div>
      </section>
    </div>
  );
}
