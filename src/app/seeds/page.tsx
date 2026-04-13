"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
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
  ArrowRight,
  SortAsc,
  Calendar,
  ThumbsUp,
} from "lucide-react";
import { cycles, archive, seeds, getCyclePhase, cycleLabel } from "@/lib/data";
import type { Cycle, Nomination, SeedPaper, CyclePhase } from "@/lib/data";

/* ─── Helpers ─────────────────────────────────────────────── */

/** All cycles currently accepting nominations or voting (there may be multiple). */
function getExplorationCycles(): Cycle[] {
  return cycles.filter((c) => {
    if (c.status !== "active") return false;
    const p = getCyclePhase(c);
    return p === "nominating" || p === "voting";
  });
}

/** All cycles currently in deep-dive (paper selected, session scheduled). */
function getDeepDiveCycles(): Cycle[] {
  return cycles.filter((c) => c.status === "active" && getCyclePhase(c) === "deep-dive");
}

type NomStatus = "selected" | "nominated" | "completed";

function getNomStatus(nom: Nomination): NomStatus {
  const inArchive = !!nom.arxiv && archive.some((a) => a.resources.arxiv === nom.arxiv);
  if (inArchive) return "completed";
  if (nom.is_selected) return "selected";
  return "nominated";
}

const statusBadge: Record<NomStatus, { label: string; color: string; bg: string; border: string }> = {
  selected:  { label: "⚡ Selected",  color: "#FF5722", bg: "rgba(255,87,34,0.12)",  border: "rgba(255,87,34,0.4)"  },
  nominated: { label: "🗳 Nominated", color: "#42A5F5", bg: "rgba(66,165,245,0.1)",  border: "rgba(66,165,245,0.25)" },
  completed: { label: "✓ Done",       color: "#4CAF50", bg: "rgba(76,175,80,0.1)",   border: "rgba(76,175,80,0.3)"  },
};

/* ─── Nomination Card (already in cycle pool) ─────────────── */
function NomCard({
  nom,
  cycleId,
  maxVotes,
  phase,
}: {
  nom: Nomination;
  cycleId: string;
  maxVotes: number;
  phase: CyclePhase;
}) {
  const rawStatus = getNomStatus(nom);
  // During nominating/voting no winner is decided yet — show all as "nominated"
  const status: NomStatus =
    rawStatus === "selected" && (phase === "nominating" || phase === "voting")
      ? "nominated"
      : rawStatus;
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
      {/* Tags + status badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {nom.tags.map((t) => (
            <span key={t} className="text-xs font-bold px-2.5 py-0.5 rounded-full"
              style={{ background: "rgba(255,87,34,0.1)", color: "#FF7043", border: "1px solid rgba(255,87,34,0.25)" }}>
              {t}
            </span>
          ))}
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded-full shrink-0 font-bold whitespace-nowrap"
          style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
          {badge.label}
        </span>
      </div>

      <h3 className="text-sm font-bold text-white leading-snug">{nom.title}</h3>

      <p className="text-xs" style={{ color: "rgba(232,234,246,0.4)" }}>
        Presenter: <span style={{ color: "rgba(232,234,246,0.65)" }}>{nom.proposer}</span>
      </p>

      {/* Vote bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold flex items-center gap-1" style={{ color: "rgba(232,234,246,0.45)" }}>
            <Vote size={10} /> Community votes
          </span>
          <span className="text-xs font-bold" style={{ color: badge.color }}>{nom.votes}</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${voteBarPct}%`,
              background: status === "selected"
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
          <a href={nom.arxiv} target="_blank" rel="noopener noreferrer"
            className="flex-1 text-center text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1"
            style={{ background: "rgba(255,87,34,0.1)", color: "#FF5722", border: "1px solid rgba(255,87,34,0.25)" }}>
            <ExternalLink size={10} /> arXiv
          </a>
        ) : (
          <div className="flex-1 text-center text-xs py-2 rounded-xl flex items-center justify-center gap-1"
            style={{ background: "rgba(255,255,255,0.03)", color: "rgba(232,234,246,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}>
            No arXiv link
          </div>
        )}
        {status === "completed" ? (
          <Link href="/archive"
            className="flex-1 text-center text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-1"
            style={{ background: "rgba(76,175,80,0.1)", color: "#4CAF50", border: "1px solid rgba(76,175,80,0.25)" }}>
            <CheckCircle2 size={10} /> Archive
          </Link>
        ) : status === "selected" ? (
          <Link href={`/cycle?cycle=${cycleId}`}
            className="flex-1 text-center btn-orange text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1">
            <Zap size={10} /> View Session
          </Link>
        ) : phase === "voting" ? (
          <a href={nom.issue_number
              ? `https://github.com/vominhduc/vjai-paper-hub/issues/${nom.issue_number}`
              : `https://github.com/vominhduc/vjai-paper-hub/issues?q=is%3Aissue+is%3Aopen+label%3Anomination+${encodeURIComponent(nom.title.split(" ").slice(0, 5).join(" "))}`}
            target="_blank" rel="noopener noreferrer"
            title={nom.issue_number ? "Open the GitHub issue and react with 👍 to vote" : "Find the nomination issue on GitHub and react with 👍 to vote"}
            className="flex-1 text-center text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1"
            style={{ background: "rgba(255,152,0,0.1)", color: "#FF9800", border: "1px solid rgba(255,152,0,0.3)" }}>
            <ThumbsUp size={10} /> Vote on GitHub
          </a>
        ) : (
          /* Nomination pool — not yet voting */
          <div className="flex-1 text-center text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-1 cursor-not-allowed"
            style={{ background: "rgba(255,255,255,0.03)", color: "rgba(232,234,246,0.3)", border: "1px solid rgba(255,255,255,0.07)" }}
            title="Voting opens after the Exploration session">
            <CheckCircle2 size={10} /> Nominated
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Seed Card (organizer suggestion, not yet nominated) ──── */
function SeedCard({ seed, cycleId }: { seed: SeedPaper; cycleId: string }) {
  const nomUrl =
    `https://github.com/vominhduc/vjai-paper-hub/issues/new` +
    `?labels=nomination&template=02-nominate-cycle.yml` +
    `&title=${encodeURIComponent(`Nominate: ${seed.title}`)}` +
    `&cycle_id=${encodeURIComponent(cycleId)}` +
    (seed.arxiv ? `&arxiv_url=${encodeURIComponent(seed.arxiv)}` : "");

  return (
    <div
      className="glass-card glow-border-hover rounded-2xl p-6 flex flex-col gap-4 relative"
      style={{ border: "1px solid rgba(255,255,255,0.07)", opacity: 0.85 }}
    >
      {/* Tags + seed badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {seed.tags.map((t) => (
            <span key={t} className="text-xs font-bold px-2.5 py-0.5 rounded-full"
              style={{ background: "rgba(76,175,80,0.08)", color: "#66BB6A", border: "1px solid rgba(76,175,80,0.2)" }}>
              {t}
            </span>
          ))}
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded-full shrink-0 font-bold whitespace-nowrap"
          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(232,234,246,0.45)", border: "1px solid rgba(255,255,255,0.1)" }}>
          🌱 Seed
        </span>
      </div>

      <h3 className="text-sm font-bold text-white leading-snug">{seed.title}</h3>

      <p className="text-xs" style={{ color: "rgba(232,234,246,0.4)" }}>
        Suggested by <span style={{ color: "rgba(232,234,246,0.65)" }}>{seed.proposedBy}</span>
      </p>

      {seed.description && (
        <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "rgba(232,234,246,0.5)" }}>
          {seed.description}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        {seed.arxiv ? (
          <a href={seed.arxiv} target="_blank" rel="noopener noreferrer"
            className="flex-1 text-center text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1"
            style={{ background: "rgba(255,87,34,0.1)", color: "#FF5722", border: "1px solid rgba(255,87,34,0.25)" }}>
            <ExternalLink size={10} /> arXiv
          </a>
        ) : null}
        <a href={nomUrl} target="_blank" rel="noopener noreferrer"
          className="flex-1 text-center btn-orange text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1">
          <Plus size={10} /> Nominate
        </a>
      </div>
    </div>
  );
}
function CycleSection({
  cycle,
  isExploration,
}: {
  cycle: Cycle;
  isExploration: boolean;
}) {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"votes" | "recent">("votes");

  const phase = getCyclePhase(cycle);
  const maxVotes = Math.max(...cycle.nominations.map((n) => n.votes), 1);

  const filtered = cycle.nominations
    .filter((n) => {
      const q = query.toLowerCase();
      return (
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q)) ||
        n.proposer.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => sortBy === "votes" ? b.votes - a.votes : 0);

  const selectedNom = cycle.nominations.find((n) => n.is_selected);

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
          <h2 className="text-xl font-black text-white">{cycleLabel(cycle)}</h2>
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(255,152,0,0.1)", color: "#FF9800" }}>
              🎯 {cycle.theme}
            </span>
            <span className="text-xs" style={{ color: "rgba(232,234,246,0.45)" }}>
              {cycle.nominations.length} nominations
            </span>
            <span className="text-xs" style={{ color: "rgba(232,234,246,0.45)" }}>
              Deep Dive: {cycle.session_date
                  ? new Date(cycle.session_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                  : "TBD"}
            </span>
          </div>
          {/* Show selected paper preview if deep-dive */}
          {!isExploration && selectedNom && (
            <div className="mt-3 text-xs p-3 rounded-xl" style={{ background: "rgba(255,87,34,0.08)", border: "1px solid rgba(255,87,34,0.2)" }}>
              <span style={{ color: "#FF7043" }}>⚡ Selected: </span>
              <span className="text-white font-semibold">{selectedNom.title}</span>
            </div>
          )}
        </div>

        <div className="flex gap-3 shrink-0">
          {isExploration && (
            <a
              href={
                `https://github.com/vominhduc/vjai-paper-hub/issues/new` +
                `?labels=nomination&template=02-nominate-cycle.yml` +
                `&title=${encodeURIComponent("Nominate: ")}` +
                `&cycle_id=${encodeURIComponent(cycle.id)}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="btn-orange text-white font-bold px-4 py-2 rounded-full text-xs inline-flex items-center gap-1.5"
            >
              <Plus size={12} /> Nominate
            </a>
          )}
          <Link
            href={`/cycle?cycle=${cycle.id}`}
            className="font-semibold px-4 py-2 rounded-full text-xs inline-flex items-center gap-1.5"
            style={{
              background: "rgba(255,255,255,0.05)",
              color: "rgba(232,234,246,0.7)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            Full Cycle <ArrowRight size={11} />
          </Link>
        </div>
      </div>

      {/* Search + Sort controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(232,234,246,0.35)" }} />
          <input
            type="text"
            placeholder="Filter nominations…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-transparent text-white placeholder:opacity-40"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(232,234,246,0.35)" }}>
              <X size={13} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <SortAsc size={13} style={{ color: "rgba(232,234,246,0.35)" }} />
          {(["votes", "recent"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={sortBy === s
                ? { background: "rgba(255,87,34,0.15)", color: "#FF5722", border: "1px solid rgba(255,87,34,0.3)" }
                : { background: "rgba(255,255,255,0.04)", color: "rgba(232,234,246,0.45)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              {s === "votes" ? "Top Votes" : "Recent"}
            </button>
          ))}
        </div>
      </div>

      {/* Nominations grid */}
      {filtered.length === 0 && cycle.nominations.length > 0 ? (
        <p className="text-sm py-8 text-center" style={{ color: "rgba(232,234,246,0.35)" }}>
          No nominations match &ldquo;{query}&rdquo;
        </p>
      ) : filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((nom) => (
            <NomCard key={nom.id} nom={nom} cycleId={cycle.id} maxVotes={maxVotes} phase={phase} />
          ))}
        </div>
      ) : null}

      {/* Organizer seed suggestions not yet nominated */}
      {isExploration && (() => {
        const nominatedArxivs = new Set(cycle.nominations.map((n) => n.arxiv).filter(Boolean));
        const unseeded = seeds.filter((s) => s.arxiv && !nominatedArxivs.has(s.arxiv));
        if (unseeded.length === 0) return null;
        return (
          <div className="mt-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(232,234,246,0.4)" }}>
                🌱 Organizer Suggestions — not yet nominated
              </span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {unseeded.map((s) => (
                <SeedCard key={s.arxiv} seed={s} cycleId={cycle.id} />
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────── */
export default function SeedsPage() {
  const explorationCycles = getExplorationCycles();
  const deepDiveCycles = getDeepDiveCycles();

  const activeCycles = [...explorationCycles, ...deepDiveCycles];
  const plannedCycles = cycles.filter((c) => c.status === "planned");

  const allActiveNoms = activeCycles.flatMap((c) => c.nominations);
  const totalNoms = allActiveNoms.length;
  const totalVotes = allActiveNoms.reduce((s, n) => s + n.votes, 0);

  const phaseLabel =
    explorationCycles.length > 0 && deepDiveCycles.length === 0
      ? "Nominations Open"
      : deepDiveCycles.length > 0 && explorationCycles.length === 0
      ? "Deep-Dive Phase"
      : activeCycles.length > 0
      ? "Active Cycles"
      : "Between Cycles";

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
                  Seed Pool · {phaseLabel}
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-3">
                Cycle <span className="gradient-text">Seeds</span>
              </h1>
              <p className="text-base max-w-xl" style={{ color: "rgba(232,234,246,0.6)" }}>
                Each cycle has its own seed pool — papers nominated by the community for that
                sprint. Vote for your favourites or nominate a new one.
              </p>
            </div>
          </div>

          {/* Stats strip */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mt-8">
            <div className="flex flex-wrap gap-8">
              <div>
                <div className="text-2xl font-black" style={{ color: "#FF5722" }}>{activeCycles.length}</div>
                <div className="text-xs mt-0.5" style={{ color: "rgba(232,234,246,0.4)" }}>Active Cycles</div>
              </div>
              <div>
                <div className="text-2xl font-black" style={{ color: "#FF5722" }}>{totalNoms}</div>
                <div className="text-xs mt-0.5" style={{ color: "rgba(232,234,246,0.4)" }}>Nominations</div>
              </div>
              <div>
                <div className="text-2xl font-black" style={{ color: "#FF5722" }}>{totalVotes}</div>
                <div className="text-xs mt-0.5" style={{ color: "rgba(232,234,246,0.4)" }}>Total Votes Cast</div>
              </div>
              <div>
                <div className="text-2xl font-black" style={{ color: "#FF5722" }}>{plannedCycles.length}</div>
                <div className="text-xs mt-0.5" style={{ color: "rgba(232,234,246,0.4)" }}>Cycles Planned</div>
              </div>
            </div>
            <a
              href="https://github.com/vominhduc/vjai-paper-hub/issues/new?labels=seed&template=01-propose-seed.yml"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold px-5 py-2.5 rounded-full text-sm inline-flex items-center gap-2 self-start lg:self-auto"
              style={{
                background: "rgba(76,175,80,0.08)",
                color: "#66BB6A",
                border: "1px solid rgba(76,175,80,0.25)",
              }}
            >
              <Sprout size={14} /> Propose a Seed Paper
            </a>
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
                  href={
                    `https://github.com/vominhduc/vjai-paper-hub/issues/new` +
                    `?labels=nomination&template=02-nominate-cycle.yml` +
                    `&title=${encodeURIComponent("Nominate: ")}`
                  }
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
              {/* Exploration cycles (nominations open / voting) */}
              {explorationCycles.map((c) => (
                <CycleSection key={c.id} cycle={c} isExploration={true} />
              ))}
              {/* Deep-dive cycles (paper selected, session scheduled) */}
              {deepDiveCycles.map((c) => (
                <CycleSection key={c.id} cycle={c} isExploration={false} />
              ))}
            </>
          )}

          {/* ── Upcoming planned cycles ── */}
          {plannedCycles.length > 0 && (
            <div className="mt-4 mb-16">
              <div className="flex items-center gap-3 mb-6">
                <Calendar size={16} style={{ color: "rgba(232,234,246,0.4)" }} />
                <h2 className="text-lg font-black text-white">Upcoming Cycles</h2>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: "rgba(255,255,255,0.06)", color: "rgba(232,234,246,0.4)" }}
                >
                  {plannedCycles.length} planned
                </span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {plannedCycles.map((c) => (
                  <Link
                    key={c.id}
                    href={`/cycle?cycle=${c.id}`}
                    className="group rounded-xl p-4 transition-all hover:border-white/20"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm font-bold text-white">{cycleLabel(c)}</p>
                        <p className="text-xs mt-0.5" style={{ color: "rgba(232,234,246,0.4)" }}>
                          Session: {c.session_date
                            ? new Date(c.session_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                            : "TBD"}
                        </p>
                      </div>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-semibold shrink-0"
                        style={{ background: "rgba(255,255,255,0.06)", color: "rgba(232,234,246,0.35)" }}
                      >
                        Planned
                      </span>
                    </div>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: "rgba(255,152,0,0.08)", color: "#FF9800" }}
                    >
                      🎯 {c.theme}
                    </span>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs" style={{ color: "rgba(232,234,246,0.3)" }}>
                        {c.nominations.length} nominations
                      </span>
                      <ArrowRight
                        size={13}
                        className="opacity-0 group-hover:opacity-60 transition-opacity"
                        style={{ color: "#FF5722" }}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA footer */}
      <section
        className="py-16"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="max-w-3xl mx-auto px-6 text-center">
          <Sprout size={28} className="mx-auto mb-4" style={{ color: "#4CAF50" }} />
          <h2 className="text-2xl font-black text-white mb-3">
            Shape What We Read Next
          </h2>
          <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: "rgba(232,234,246,0.5)" }}>
            Every nomination and vote directly influences the papers we deep-dive into.
            Join the community and make your voice count.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="https://github.com/vominhduc/vjai-paper-hub/issues/new?labels=seed&template=01-propose-seed.yml"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold px-6 py-3 rounded-full text-sm inline-flex items-center gap-2"
              style={{
                background: "rgba(76,175,80,0.08)",
                color: "#66BB6A",
                border: "1px solid rgba(76,175,80,0.25)",
              }}
            >
              <Sprout size={14} /> Propose a Seed Paper
            </a>
            <a
              href={
                `https://github.com/vominhduc/vjai-paper-hub/issues/new` +
                `?labels=nomination&template=02-nominate-cycle.yml` +
                `&title=${encodeURIComponent("Nominate: ")}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="btn-orange text-white font-bold px-6 py-3 rounded-full text-sm inline-flex items-center gap-2"
            >
              <Plus size={14} /> Nominate a Paper
            </a>
            <Link
              href="/roadmap"
              className="font-semibold px-6 py-3 rounded-full text-sm inline-flex items-center gap-2"
              style={{
                background: "rgba(255,255,255,0.05)",
                color: "rgba(232,234,246,0.7)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <Calendar size={14} /> View Roadmap
            </Link>
            <Link
              href="/archive"
              className="font-semibold px-6 py-3 rounded-full text-sm inline-flex items-center gap-2"
              style={{
                background: "rgba(255,255,255,0.05)",
                color: "rgba(232,234,246,0.7)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <CheckCircle2 size={14} /> Browse Archive
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
