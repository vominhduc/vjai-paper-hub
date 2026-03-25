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
  Trophy,
  Vote,
  Clock,
  CheckCircle2,
  FlameKindling,
} from "lucide-react";
import { cycles, archive } from "@/lib/data";
import type { Cycle, Nomination } from "@/lib/data";

/* ─── Helpers ─────────────────────────────────────────────── */

/** The single cycle where people are actively nominating / voting. */
function getExplorationCycle(): Cycle | undefined {
  return cycles.find((c) => c.status === "exploration");
}

/** The single cycle currently in deep-dive (paper selected, session scheduled). */
function getDeepDiveCycle(): Cycle | undefined {
  return cycles.find((c) => c.status === "deep-dive");
}

type NomStatus = "selected" | "nominated" | "completed";

function getNomStatus(nom: Nomination): NomStatus {
  const inArchive = archive.some(
    (a) =>
      (nom.arxiv && a.resources.arxiv === nom.arxiv) ||
      a.title.toLowerCase().includes(nom.title.toLowerCase().slice(0, 30))
  );
  if (inArchive) return "completed";
  if (nom.is_selected) return "selected";
  return "nominated";
}

const statusBadge: Record<NomStatus, { label: string; color: string; bg: string; border: string }> = {
  selected:  { label: "⚡ Selected",  color: "#FF5722", bg: "rgba(255,87,34,0.12)",  border: "rgba(255,87,34,0.4)"  },
  nominated: { label: "🗳 Nominated", color: "#42A5F5", bg: "rgba(66,165,245,0.1)",  border: "rgba(66,165,245,0.25)" },
  completed: { label: "✓ Done",       color: "#4CAF50", bg: "rgba(76,175,80,0.1)",   border: "rgba(76,175,80,0.3)"  },
};

/* ─── Nomination Card ─────────────────────────────────────── */
function NomCard({
  nom,
  cycleId,
  isExploration,
  maxVotes,
}: {
  nom: Nomination;
  cycleId: string;
  isExploration: boolean;
  maxVotes: number;
}) {
  const status = getNomStatus(nom);
  const badge = statusBadge[status];
  const voteBarPct = maxVotes > 0 ? Math.round((nom.votes / maxVotes) * 100) : 0;

  return (
    <div
      className="glass-card glow-border-hover rounded-2xl p-6 flex flex-col gap-4 relative"
      style={{
        border:
          status === "selected"
            ? "1px solid rgba(255,87,34,0.4)"
            : status === "completed"
            ? "1px solid rgba(76,175,80,0.3)"
            : "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {nom.tags.map((t) => (
            <span
              key={t}
              className="text-xs font-bold px-2.5 py-0.5 rounded-full"
              style={{
                background: "rgba(255,87,34,0.1)",
                color: "#FF7043",
                border: "1px solid rgba(255,87,34,0.25)",
              }}
            >
              {t}
            </span>
          ))}
        </div>
        <span
          className="text-xs px-2.5 py-0.5 rounded-full shrink-0 font-bold whitespace-nowrap"
          style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}
        >
          {badge.label}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-bold text-white leading-snug">{nom.title}</h3>

      {/* Proposer */}
      <p className="text-xs" style={{ color: "rgba(232,234,246,0.4)" }}>
        Proposed by <span style={{ color: "rgba(232,234,246,0.65)" }}>{nom.proposer}</span>
      </p>

      {/* Vote bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold flex items-center gap-1" style={{ color: "rgba(232,234,246,0.45)" }}>
            <Vote size={10} />
            Community votes
          </span>
          <span className="text-xs font-bold" style={{ color: badge.color }}>
            {nom.votes}
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${voteBarPct}%`,
              background:
                status === "selected"
                  ? "linear-gradient(90deg, #FF5722, #FF7043)"
                  : status === "completed"
                  ? "linear-gradient(90deg, #4CAF50, #8BC34A)"
                  : "linear-gradient(90deg, #1A237E, #3949AB)",
            }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        {nom.arxiv ? (
          <a
            href={nom.arxiv}
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
        ) : (
          <div
            className="flex-1 text-center text-xs py-2 rounded-xl flex items-center justify-center gap-1"
            style={{
              background: "rgba(255,255,255,0.03)",
              color: "rgba(232,234,246,0.3)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            No arXiv link
          </div>
        )}

        {status === "completed" ? (
          <Link
            href="/archive"
            className="flex-1 text-center text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-1"
            style={{
              background: "rgba(76,175,80,0.1)",
              color: "#4CAF50",
              border: "1px solid rgba(76,175,80,0.25)",
            }}
          >
            <CheckCircle2 size={10} /> Archive
          </Link>
        ) : status === "selected" ? (
          <Link
            href="/cycle"
            className="flex-1 text-center btn-orange text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1"
          >
            <Zap size={10} /> View Session
          </Link>
        ) : isExploration ? (
          <a
            href={`https://github.com/vominhduc/vjai-paper-hub/issues/new?title=Vote%3A+${encodeURIComponent(nom.title)}&labels=nomination&template=02-nominate-cycle.yml`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center btn-orange text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1"
          >
            <GitFork size={10} /> Vote / Nominate
          </a>
        ) : (
          <Link
            href="/cycle"
            className="flex-1 text-center text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-1"
            style={{
              background: "rgba(255,255,255,0.04)",
              color: "rgba(232,234,246,0.45)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            View Cycle
          </Link>
        )}
      </div>
    </div>
  );
}

/* ─── Cycle Section ───────────────────────────────────────── */
function CycleSection({
  cycle,
  isExploration,
}: {
  cycle: Cycle;
  isExploration: boolean;
}) {
  const [query, setQuery] = useState("");

  const maxVotes = Math.max(...cycle.nominations.map((n) => n.votes), 1);

  const filtered = cycle.nominations.filter((n) => {
    const q = query.toLowerCase();
    return (
      !q ||
      n.title.toLowerCase().includes(q) ||
      n.tags.some((t) => t.toLowerCase().includes(q)) ||
      n.proposer.toLowerCase().includes(q)
    );
  });

  return (
    <div className="mb-16">
      {/* Cycle header */}
      <div
        className="rounded-2xl p-6 mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        style={{
          background: isExploration
            ? "linear-gradient(135deg, rgba(255,87,34,0.08) 0%, rgba(26,35,126,0.3) 100%)"
            : "linear-gradient(135deg, rgba(26,35,126,0.4) 0%, rgba(7,12,38,0.6) 100%)",
          border: isExploration
            ? "1px solid rgba(255,87,34,0.25)"
            : "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            {isExploration ? (
              <>
                <FlameKindling size={16} style={{ color: "#FF5722" }} />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#FF5722" }}>
                  Active — Nominations Open
                </span>
              </>
            ) : (
              <>
                <Trophy size={16} style={{ color: "#FFD700" }} />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#FFD700" }}>
                  Deep-Dive — Paper Selected
                </span>
              </>
            )}
          </div>
          <h2 className="text-xl font-black text-white">
            {cycle.quarter} Cycle {cycle.cycle} ·{" "}
            <span className="gradient-text">{cycle.theme}</span>
          </h2>
          <p className="text-xs mt-1" style={{ color: "rgba(232,234,246,0.45)" }}>
            {cycle.nominations.length} nominations · Session:{" "}
            {new Date(cycle.session.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="flex gap-3 shrink-0">
          {isExploration && (
            <a
              href="https://github.com/vominhduc/vjai-paper-hub/issues/new?labels=nomination&template=02-nominate-cycle.yml&title=Nominate%3A+"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-orange text-white font-bold px-5 py-2.5 rounded-full text-xs inline-flex items-center gap-1.5"
            >
              <Plus size={13} /> Nominate a Paper
            </a>
          )}
          <Link
            href="/cycle"
            className="font-semibold px-5 py-2.5 rounded-full text-xs inline-flex items-center gap-1.5"
            style={{
              background: "rgba(255,255,255,0.05)",
              color: "rgba(232,234,246,0.7)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            Full Cycle Page →
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-6">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: "rgba(232,234,246,0.35)" }}
        />
        <input
          type="text"
          placeholder="Filter nominations…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-transparent text-white placeholder:opacity-40"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: "rgba(232,234,246,0.35)" }}
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <p className="text-sm py-8 text-center" style={{ color: "rgba(232,234,246,0.35)" }}>
          No nominations match &ldquo;{query}&rdquo;
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((nom) => (
            <NomCard
              key={nom.id}
              nom={nom}
              cycleId={cycle.id}
              isExploration={isExploration}
              maxVotes={maxVotes}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────── */
export default function SeedsPage() {
  const explorationCycle = getExplorationCycle();
  const deepDiveCycle = getDeepDiveCycle();

  const activeCycles = [explorationCycle, deepDiveCycle].filter(Boolean) as Cycle[];
  const allActiveNoms = activeCycles.flatMap((c) => c.nominations);
  const totalNoms = allActiveNoms.length;
  const openNoms = allActiveNoms.filter(
    (n) => !n.is_selected && getNomStatus(n) !== "completed"
  ).length;
  const avgVotes =
    totalNoms > 0
      ? Math.round(allActiveNoms.reduce((s, n) => s + n.votes, 0) / totalNoms)
      : 0;

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
          {/* Breadcrumb */}
          <div
            className="flex items-center gap-2 mb-4 text-xs font-semibold"
            style={{ color: "rgba(232,234,246,0.4)" }}
          >
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight size={12} />
            <span style={{ color: "#FF5722" }}>Seeds</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Sprout size={20} style={{ color: "#4CAF50" }} />
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: "#4CAF50" }}
                >
                  Active Cycle · Seed Pool
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-3">
                Cycle <span className="gradient-text">Seeds</span>
              </h1>
              <p className="text-base max-w-xl" style={{ color: "rgba(232,234,246,0.6)" }}>
                Each cycle has its own seed pool — papers nominated by the community for that
                sprint. When the cycle ends, a fresh set of seeds opens for the next one.
              </p>
            </div>

            <a
              href="https://github.com/vominhduc/vjai-paper-hub/issues/new?labels=nomination&template=02-nominate-cycle.yml&title=Nominate%3A+"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-orange text-white font-bold px-6 py-3 rounded-full text-sm inline-flex items-center gap-2 shrink-0"
            >
              <Plus size={15} /> Nominate a Paper
            </a>
          </div>

          {/* Stats strip */}
          <div className="flex flex-wrap gap-6 mt-8">
            {[
              { value: activeCycles.length, label: "Active Cycles" },
              { value: totalNoms, label: "Total Nominations" },
              { value: openNoms, label: "Open to Vote" },
              { value: avgVotes, label: "Avg Votes / Paper" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-black" style={{ color: "#FF5722" }}>
                  {s.value}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "rgba(232,234,246,0.4)" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-6">
          {activeCycles.length === 0 ? (
            /* ── Between cycles state ── */
            <div className="text-center py-24">
              <Clock size={40} className="mx-auto mb-5" style={{ color: "rgba(232,234,246,0.2)" }} />
              <h2 className="text-2xl font-black text-white mb-3">Between Cycles</h2>
              <p className="text-sm max-w-md mx-auto mb-8" style={{ color: "rgba(232,234,246,0.45)" }}>
                No active cycle right now. A new seed pool opens at the start of each cycle.
                Propose a paper for the next one!
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <a
                  href="https://github.com/vominhduc/vjai-paper-hub/issues/new?labels=nomination&template=02-nominate-cycle.yml&title=Nominate%3A+"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-orange text-white font-bold px-6 py-3 rounded-full text-sm inline-flex items-center gap-2"
                >
                  <Plus size={14} /> Nominate Early
                </a>
                <Link
                  href="/archive"
                  className="font-semibold px-6 py-3 rounded-full text-sm inline-flex items-center gap-2"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    color: "rgba(232,234,246,0.7)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  Browse Archive
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Exploration cycle first (nominations open) */}
              {explorationCycle && (
                <CycleSection cycle={explorationCycle} isExploration={true} />
              )}
              {/* Deep-dive cycle (paper selected, session scheduled) */}
              {deepDiveCycle && (
                <CycleSection cycle={deepDiveCycle} isExploration={false} />
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA footer */}
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
            Nominate a paper for the current cycle. The community votes — top paper gets selected
            for the deep-dive session.
          </p>
          <a
            href="https://github.com/vominhduc/vjai-paper-hub/issues/new?labels=nomination&template=02-nominate-cycle.yml&title=Nominate%3A+"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-orange text-white font-bold px-8 py-3.5 rounded-full text-sm inline-flex items-center gap-2"
          >
            <Plus size={14} /> Open a Nomination Issue
          </a>
        </div>
      </section>
    </div>
  );
}
