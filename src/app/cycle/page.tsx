"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  ThumbsUp,
  ExternalLink,
  Users,
  Calendar,
  MapPin,
  ChevronRight,
  Layers,
  BookOpenCheck,
  FileText,
} from "lucide-react";
import { cycles, getCyclePhase, cycleLabel } from "@/lib/data";
import type { Cycle, CyclePhase } from "@/lib/data";

/* ─── Phase Badge ─────────────────────────────────────────── */
const PHASE_META: Record<CyclePhase, { label: string; color: string; bg: string; border: string; desc: string }> = {
  nominating: {
    label: "📝 Nominating",
    color: "#42A5F5",
    bg: "rgba(66,165,245,0.08)",
    border: "rgba(66,165,245,0.2)",
    desc: "Nominations are open. Propose papers for the group to read.",
  },
  voting: {
    label: "🗳 Voting",
    color: "#FF9800",
    bg: "rgba(255,152,0,0.08)",
    border: "rgba(255,152,0,0.25)",
    desc: "Voting is live! Pick the paper you want to deep-dive.",
  },
  "deep-dive": {
    label: "🔬 Deep Dive",
    color: "#FF5722",
    bg: "rgba(255,87,34,0.08)",
    border: "rgba(255,87,34,0.25)",
    desc: "Paper selected. Deep-dive session is scheduled.",
  },
  archived: {
    label: "✓ Archived",
    color: "#4CAF50",
    bg: "rgba(76,175,80,0.08)",
    border: "rgba(76,175,80,0.25)",
    desc: "This cycle is complete. View the session recording and notes in the archive.",
  },
};

/* ─── Nomination Card ─────────────────────────────────────── */
function NominationCard({
  nom,
  rank,
  phase,
  maxVotes,
}: {
  nom: Cycle["nominations"][0];
  rank: number;
  phase: CyclePhase;
  maxVotes: number;
}) {
  const isSelected = nom.is_selected;
  // is_selected is only meaningful once voting is closed (deep-dive / archived).
  // During nominating/voting all papers are still competing — treat none as "selected".
  const showAsSelected = isSelected && phase !== "nominating" && phase !== "voting";

  return (
    <div
      className="glass-card glow-border-hover rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden"
      style={{
        border: showAsSelected
          ? "1px solid rgba(255,87,34,0.5)"
          : "1px solid rgba(255,255,255,0.07)",
        background: showAsSelected
          ? "rgba(255,87,34,0.05)"
          : "rgba(255,255,255,0.03)",
      }}
    >
      {showAsSelected && (
        <div
          className="absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-full"
          style={{
            background: "rgba(255,87,34,0.2)",
            color: "#FF5722",
            border: "1px solid rgba(255,87,34,0.4)",
          }}
        >
          ✓ Selected
        </div>
      )}

      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black shrink-0"
          style={{
            background: rank === 1 ? "rgba(255,87,34,0.2)" : "rgba(255,255,255,0.07)",
            color: rank === 1 ? "#FF5722" : "rgba(232,234,246,0.4)",
          }}
        >
          #{rank}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {nom.tags.map((t) => (
            <span key={t} className="paper-tag text-xs px-2.5 py-0.5 rounded-full font-semibold">
              {t}
            </span>
          ))}
        </div>
      </div>

      <h3 className="text-sm font-bold text-white leading-snug">{nom.title}</h3>

      <p className="text-xs" style={{ color: "rgba(232,234,246,0.45)" }}>
        Proposed by <span style={{ color: "#FF7043" }}>{nom.proposer}</span>
      </p>

      {/* Vote bar */}
      <div className="flex items-center gap-3">
        <div
          className="flex-1 h-1.5 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.07)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
      width: `${maxVotes > 0 ? Math.round((nom.votes / maxVotes) * 100) : 0}%`,
              background: showAsSelected
                ? "linear-gradient(90deg, #FF5722, #FF7043)"
                : "linear-gradient(90deg, #1A237E, #3949AB)",
            }}
          />
        </div>
        <div
          className="flex items-center gap-1 text-xs font-bold shrink-0"
          style={{ color: showAsSelected ? "#FF5722" : "rgba(232,234,246,0.5)" }}
        >
          <ThumbsUp size={11} />
          {nom.votes}
        </div>
      </div>

      {nom.arxiv && (
        <a
          href={nom.arxiv}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold flex items-center gap-1"
          style={{ color: "#FF5722" }}
        >
          <ExternalLink size={10} /> arXiv Paper
        </a>
      )}

      {/* Vote button — only shown during the voting phase (after Exploration session) */}
      {phase === "voting" && (
        nom.issue_number ? (
          <a
            href={`https://github.com/vominhduc/vjai-paper-hub/issues/${nom.issue_number}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Open the GitHub issue and react with 👍 to cast your vote"
            className="mt-auto w-full text-center text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all"
            style={{
              background: "rgba(255,152,0,0.1)",
              color: "#FF9800",
              border: "1px solid rgba(255,152,0,0.3)",
            }}
          >
            <ThumbsUp size={11} /> Vote on GitHub
          </a>
        ) : (
          <a
            href={`https://github.com/vominhduc/vjai-paper-hub/issues?q=is%3Aissue+is%3Aopen+label%3Anomination+${encodeURIComponent(nom.title.split(" ").slice(0, 5).join(" "))}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Find the nomination issue on GitHub and react with 👍 to vote"
            className="mt-auto w-full text-center text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all"
            style={{
              background: "rgba(255,152,0,0.1)",
              color: "#FF9800",
              border: "1px solid rgba(255,152,0,0.3)",
            }}
          >
            <ThumbsUp size={11} /> Vote on GitHub
          </a>
        )
      )}
    </div>
  );
}

/* ─── Deep Dive Spotlight ─────────────────────────────────── */
function DeepDiveSpotlight({ cycle }: { cycle: Cycle }) {
  const selected = cycle.nominations.find((n) => n.is_selected);

  return (
    <div className="grid lg:grid-cols-5 gap-8">
      {/* Main card */}
      <div
        className="lg:col-span-3 glass-card rounded-2xl p-8 relative overflow-hidden"
        style={{ border: "1px solid rgba(255,87,34,0.3)" }}
      >
        <div
          className="absolute -top-12 -right-12 w-48 h-48 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(255,87,34,0.12) 0%, transparent 70%)",
          }}
        />

        <div className="flex items-center gap-2 mb-6">
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: "#FF5722" }}
          />
          <span
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: "#FF5722" }}
          >
            Deep Dive · {cycle.id.toUpperCase()}
          </span>
        </div>

        {selected && (
          <>
            <div className="flex flex-wrap gap-2 mb-4">
              {selected.tags.map((t) => (
                <span key={t} className="paper-tag text-xs px-3 py-1 rounded-full font-bold">
                  {t}
                </span>
              ))}
            </div>

            <h2 className="text-2xl font-black text-white leading-tight mb-3">
              {selected.title}
            </h2>

            <p className="text-sm mb-6" style={{ color: "rgba(232,234,246,0.55)" }}>
              Selected by community vote — {selected.votes} votes
            </p>

            <div className="glow-line mb-6" />
          </>
        )}

        {/* Session agenda */}
        <div className="mb-6">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-4"
            style={{ color: "rgba(232,234,246,0.35)" }}
          >
            Session Agenda
          </p>
          {cycle.session.agenda.length === 0 ? (
            <p className="text-sm italic" style={{ color: "rgba(232,234,246,0.3)" }}>
              Agenda will be posted once the winning paper is confirmed.
            </p>
          ) : (
          <div className="flex flex-col gap-3">
            {cycle.session.agenda.map((item, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                  style={{ background: "rgba(255,87,34,0.15)", color: "#FF5722" }}
                >
                  {i + 1}
                </div>
                <span className="text-sm" style={{ color: "rgba(232,234,246,0.7)" }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
          )}
        </div>

        <div className="flex gap-3">
          {selected?.arxiv && (
            <a
              href={selected.arxiv}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-orange flex-1 text-center text-white font-bold text-sm py-3 rounded-xl"
            >
              Read Paper
            </a>
          )}
          <a
            href="https://github.com/vominhduc/vjai-paper-hub/discussions"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost flex-1 text-center text-white font-semibold text-sm py-3 rounded-xl"
          >
            Join Session
          </a>
        </div>
      </div>

      {/* Session meta card */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        <div
          className="glass-card rounded-2xl p-6"
          style={{ border: "1px solid rgba(255,255,255,0.09)" }}
        >
          <p
            className="text-xs font-bold uppercase tracking-widest mb-5"
            style={{ color: "rgba(232,234,246,0.35)" }}
          >
            Session Details
          </p>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "rgba(255,87,34,0.12)" }}
              >
                <Calendar size={14} style={{ color: "#FF5722" }} />
              </div>
              <div>
                <p className="text-xs" style={{ color: "rgba(232,234,246,0.4)" }}>
                  Date
                </p>
                <p className="text-sm font-semibold text-white">{cycle.session.date}</p>
              </div>
            </div>

            {cycle.session.location && (
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "rgba(255,87,34,0.12)" }}
                >
                  <MapPin size={14} style={{ color: "#FF5722" }} />
                </div>
                <div>
                  <p className="text-xs" style={{ color: "rgba(232,234,246,0.4)" }}>
                    Location
                  </p>
                  <p className="text-sm font-semibold text-white">{cycle.session.location}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0"
                style={{
                  background: "linear-gradient(135deg, #1A237E, #FF5722)",
                  color: "white",
                }}
              >
                {cycle.session.presenter.charAt(0)}
              </div>
              <div>
                <p className="text-xs" style={{ color: "rgba(232,234,246,0.4)" }}>
                  Presenter
                </p>
                <p className="text-sm font-semibold text-white">{cycle.session.presenter}</p>
                <p className="text-xs" style={{ color: "rgba(232,234,246,0.45)" }}>
                  {cycle.session.presenter_role}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cycle info card */}
        <div
          className="glass-card rounded-2xl p-6 flex-1"
          style={{ border: "1px solid rgba(255,255,255,0.09)" }}
        >
          <p
            className="text-xs font-bold uppercase tracking-widest mb-4"
            style={{ color: "rgba(232,234,246,0.35)" }}
          >
            Cycle Info
          </p>
          <div className="flex flex-col gap-3 text-xs">
            <div className="flex justify-between">
              <span style={{ color: "rgba(232,234,246,0.45)" }}>Month</span>
              <span className="font-semibold text-white">{cycleLabel(cycle)}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "rgba(232,234,246,0.45)" }}>Theme</span>
              <span className="font-semibold" style={{ color: "#FF9800" }}>{cycle.theme}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "rgba(232,234,246,0.45)" }}>Nominations</span>
              <span className="font-semibold text-white">{cycle.nominations.length} papers</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "rgba(232,234,246,0.45)" }}>Exploration</span>
              <span className="font-semibold text-white">
                {cycle.exploration_start
                  ? new Date(cycle.exploration_start).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  : "TBD"}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "rgba(232,234,246,0.45)" }}>Deep Dive</span>
              <span className="font-semibold text-white">
                {cycle.session_date
                  ? new Date(cycle.session_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  : "TBD"}
              </span>
            </div>
          </div>
        </div>

        {/* All nominations mini-list */}
        <div
          className="glass-card rounded-2xl p-6"
          style={{ border: "1px solid rgba(255,255,255,0.09)" }}
        >
          <p
            className="text-xs font-bold uppercase tracking-widest mb-4"
            style={{ color: "rgba(232,234,246,0.35)" }}
          >
            All Nominations
          </p>
          <div className="flex flex-col gap-3">
            {[...cycle.nominations]
              .sort((a, b) => b.votes - a.votes)
              .map((n, i) => (
                <div key={n.id} className="flex items-center gap-2">
                  <span
                    className="text-xs font-bold w-5 shrink-0"
                    style={{ color: "rgba(232,234,246,0.3)" }}
                  >
                    #{i + 1}
                  </span>
                  <p
                    className="text-xs leading-snug flex-1 line-clamp-1"
                    style={{ color: n.is_selected ? "#FF7043" : "rgba(232,234,246,0.6)" }}
                  >
                    {n.title}
                  </p>
                  <span
                    className="text-xs font-bold shrink-0"
                    style={{ color: "rgba(232,234,246,0.4)" }}
                  >
                    {n.votes}v
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Voting Banner ───────────────────────────────────────── */
function VotingBanner({ cycle }: { cycle: Cycle }) {
  if (!cycle.exploration_start) return null;
  const expStart   = new Date(cycle.exploration_start);
  const deadline   = new Date(cycle.exploration_start);
  deadline.setDate(deadline.getDate() + 3);
  const now        = new Date();
  const msLeft     = deadline.getTime() - now.getTime();
  const daysLeft   = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
  const deadlineStr = deadline.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div
      className="rounded-2xl p-4 mb-8 flex items-start gap-3"
      style={{
        background: "rgba(255,152,0,0.07)",
        border: "1px solid rgba(255,152,0,0.22)",
      }}
    >
      <ThumbsUp size={16} className="mt-0.5 shrink-0" style={{ color: "#FF9800" }} />
      <div className="flex-1">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-0.5">
          <p className="text-sm font-bold text-white">Voting is open!</p>
          <span
            className="text-xs font-bold px-2.5 py-0.5 rounded-full"
            style={{
              background: "rgba(255,152,0,0.12)",
              color: "#FF9800",
              border: "1px solid rgba(255,152,0,0.25)",
            }}
          >
            ⏳ {daysLeft} day{daysLeft !== 1 ? "s" : ""} left · closes {deadlineStr}
          </span>
        </div>
        <p className="text-xs" style={{ color: "rgba(232,234,246,0.55)" }}>
          The Exploration session has ended — all nominated papers have been presented.
          React with <strong style={{ color: "#e8eaf6" }}>👍</strong> on any nomination&apos;s GitHub issue to vote it into the Deep Dive.
          Voting closes <strong style={{ color: "#e8eaf6" }}>3 days after the Exploration session</strong> ({deadlineStr}).
        </p>
      </div>
    </div>
  );
}

/* ─── Nominating Banner ───────────────────────────────────── */
function NominatingBanner({ cycle }: { cycle: Cycle }) {
  const deadlineStr = cycle.nomination_end
    ? new Date(cycle.nomination_end).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "TBD";

  return (
    <div
      className="rounded-2xl p-4 mb-8 flex items-start gap-3"
      style={{
        background: "rgba(66,165,245,0.07)",
        border: "1px solid rgba(66,165,245,0.2)",
      }}
    >
      <FileText size={16} className="mt-0.5 shrink-0" style={{ color: "#42A5F5" }} />
      <div className="flex-1">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-0.5">
          <p className="text-sm font-bold text-white">Nominations open</p>
          <span
            className="text-xs font-bold px-2.5 py-0.5 rounded-full"
            style={{
              background: "rgba(66,165,245,0.1)",
              color: "#42A5F5",
              border: "1px solid rgba(66,165,245,0.25)",
            }}
          >
            📅 Closes {deadlineStr}
          </span>
        </div>
        <p className="text-xs" style={{ color: "rgba(232,234,246,0.55)" }}>
          Nominate a paper you will <strong style={{ color: "#e8eaf6" }}>present</strong> at the Exploration session on{" "}
          <strong style={{ color: "#e8eaf6" }}>
            {cycle.exploration_start
              ? new Date(cycle.exploration_start).toLocaleDateString("en-US", { month: "long", day: "numeric" })
              : "TBD"}
          </strong>
          . After all presentations, the community votes to pick one paper for the Deep Dive.
        </p>
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────── */
function CyclePageInner() {
  const searchParams = useSearchParams();

  // Default to the active/nominating cycle, then voting, then first
  const defaultCycleId = (
    cycles.find((c) => c.status === "active") ??
    cycles.find((c) => getCyclePhase(c) === "nominating") ??
    cycles.find((c) => getCyclePhase(c) === "voting") ??
    cycles[0]
  )?.id ?? "";

  // Read ?cycle= param; fall back to default
  const paramCycleId = searchParams.get("cycle") ?? "";
  const resolvedId = cycles.find((c) => c.id === paramCycleId)?.id ?? defaultCycleId;

  const [activeCycleId, setActiveCycleId] = useState<string>(resolvedId);
  const [showPlanned, setShowPlanned] = useState(false);

  // Sync whenever the query param changes (Next.js client-side nav)
  useEffect(() => {
    setActiveCycleId(resolvedId);
  }, [resolvedId]);

  const cycle = cycles.find((c) => c.id === activeCycleId) ?? cycles[0];
  const phase: CyclePhase = cycle ? getCyclePhase(cycle) : "nominating";
  const phaseMeta = PHASE_META[phase];

  const sortedNominations = [...(cycle?.nominations ?? [])].sort(
    (a, b) => b.votes - a.votes
  );

  const showNominations = phase === "nominating" || phase === "voting";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(160deg, #070c26 0%, #0e1550 50%, #070c26 100%)",
        color: "#e8eaf6",
      }}
    >
      {/* Header */}
      <section className="relative pt-28 pb-16 overflow-hidden">
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
            <span style={{ color: "#FF5722" }}>Cycle</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Layers size={20} style={{ color: "#FF5722" }} />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#FF5722" }}>
                  Cycle System
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-3">
                The Nomination{" "}
                <span className="gradient-text">Cycle</span>
              </h1>
              <p className="text-base max-w-xl" style={{ color: "rgba(232,234,246,0.6)" }}>
                Nominate papers, vote for the best, then go deep. Every cycle produces a
                reproduced result and a community artifact.
              </p>
            </div>

            {/* Cycle selector */}
            <div className="flex flex-wrap gap-2 items-center">
              {cycles
                .filter((c) => c.status !== "planned" || c.exploration_start || c.session_date)
                .map((c) => {
                  const isActive = activeCycleId === c.id;
                  const cPhase = getCyclePhase(c);
                  const dot =
                    c.status === "active" ? "#FF5722"
                    : cPhase === "archived" ? "#4CAF50"
                    : "#42A5F5";
                  return (
                    <button
                      key={c.id}
                      onClick={() => setActiveCycleId(c.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200"
                      style={
                        isActive
                          ? { background: "rgba(255,87,34,0.2)", color: "#FF5722", border: "1px solid rgba(255,87,34,0.5)" }
                          : { background: "rgba(255,255,255,0.04)", color: "rgba(232,234,246,0.5)", border: "1px solid rgba(255,255,255,0.08)" }
                      }
                    >
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dot }} />
                      {cycleLabel(c)}
                    </button>
                  );
                })}
              {(() => {
                const undated = cycles.filter((c) => c.status === "planned" && !c.exploration_start && !c.session_date);
                if (undated.length === 0) return null;
                return showPlanned ? (
                  <>
                    {undated.map((c) => {
                      const isActive = activeCycleId === c.id;
                      return (
                        <button
                          key={c.id}
                          onClick={() => setActiveCycleId(c.id)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200"
                          style={
                            isActive
                              ? { background: "rgba(255,87,34,0.2)", color: "#FF5722", border: "1px solid rgba(255,87,34,0.5)" }
                              : { background: "rgba(255,255,255,0.02)", color: "rgba(232,234,246,0.3)", border: "1px dashed rgba(255,255,255,0.1)" }
                          }
                        >
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#42A5F5", opacity: 0.5 }} />
                          {cycleLabel(c)}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setShowPlanned(false)}
                      className="px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200"
                      style={{ color: "rgba(232,234,246,0.3)", border: "1px dashed rgba(255,255,255,0.08)" }}
                    >
                      Hide ↑
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowPlanned(true)}
                    className="px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200"
                    style={{ color: "rgba(66,165,245,0.6)", border: "1px dashed rgba(66,165,245,0.2)", background: "rgba(66,165,245,0.04)" }}
                  >
                    +{undated.length} planned
                  </button>
                );
              })()}
            </div>
          </div>

          {/* Phase status bar */}
          <div
            className="mt-8 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-3"
            style={{ background: phaseMeta.bg, border: `1px solid ${phaseMeta.border}` }}
          >
            <div className="flex items-center gap-3 flex-1">
              <BookOpenCheck size={18} style={{ color: phaseMeta.color, flexShrink: 0 }} />
              <div>
                <span className="text-sm font-bold" style={{ color: phaseMeta.color }}>
                  {phaseMeta.label}
                </span>
                <span className="text-xs ml-3 hidden sm:inline" style={{ color: "rgba(232,234,246,0.5)" }}>
                  {phaseMeta.desc}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: "rgba(232,234,246,0.45)" }}>
              <span className="font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(255,87,34,0.1)", color: "#FF9800" }}>
                🎯 {cycle.theme}
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar size={11} /> Exploration:
                <strong className="text-white ml-1">
                  {cycle.exploration_start
                    ? new Date(cycle.exploration_start).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    : "TBD"}
                </strong>
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar size={11} /> Deep Dive:
                <strong className="text-white ml-1">
                  {cycle.session_date
                    ? new Date(cycle.session_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    : "TBD"}
                </strong>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="flex-1 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          {phase === "archived" ? (
            /* ── Archived ── */
            <div className="text-center py-24">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ background: "rgba(76,175,80,0.12)", border: "1px solid rgba(76,175,80,0.3)" }}
              >
                <BookOpenCheck size={28} style={{ color: "#4CAF50" }} />
              </div>
              <h2 className="text-2xl font-black text-white mb-3">Cycle Complete</h2>
              <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: "rgba(232,234,246,0.5)" }}>
                This cycle has concluded. The session recording, notes, and reproduced results are in the Archive.
              </p>
              <Link
                href="/archive"
                className="btn-orange inline-flex items-center gap-2 text-white font-bold px-6 py-3 rounded-xl text-sm"
              >
                View Archive <ArrowRight size={14} />
              </Link>
            </div>
          ) : phase === "deep-dive" ? (
            /* ── Deep Dive ── */
            cycle && <DeepDiveSpotlight cycle={cycle} />
          ) : (
            /* ── Nominating or Voting ── */
            <>
              {phase === "voting" ? (
                <VotingBanner cycle={cycle!} />
              ) : (
                <NominatingBanner cycle={cycle!} />
              )}

              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-white">
                  Nominations{" "}
                  <span className="text-base font-normal" style={{ color: "rgba(232,234,246,0.4)" }}>
                    · {sortedNominations.length} papers
                  </span>
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {(() => {
                  const maxVotes = Math.max(...sortedNominations.map((n) => n.votes), 1);
                  return sortedNominations.map((nom, i) => (
                    <NominationCard key={nom.id} nom={nom} rank={i + 1} phase={phase} maxVotes={maxVotes} />
                  ));
                })()}
              </div>

              {/* Nomination section */}
              {cycle.status === "active" && phase === "nominating" ? (
                <div className="mt-10 text-center">
                  <p className="text-sm mb-4" style={{ color: "rgba(232,234,246,0.4)" }}>
                    Want to nominate a paper?
                  </p>
                  <a
                    href={
                      `https://github.com/vominhduc/vjai-paper-hub/issues/new` +
                      `?labels=nomination&template=02-nominate-cycle.yml` +
                      `&cycle_id=${encodeURIComponent(cycle.id)}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost text-white font-semibold px-6 py-2.5 rounded-full text-sm inline-flex items-center gap-2"
                  >
                    Nominate a Paper <ArrowRight size={13} />
                  </a>
                </div>
              ) : (
                <div
                  className="mt-8 p-4 rounded-2xl text-sm flex items-center gap-3"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(232,234,246,0.5)" }}
                >
                  <span className="text-base">🔒</span>
                  Nominations are only open for the <strong className="text-white mx-1">active cycle</strong> during the nomination phase.
                  {cycles.find((c) => c.status === "active") && (
                    <button
                      className="ml-auto text-xs font-bold shrink-0"
                      style={{ color: "#FF5722" }}
                      onClick={() => {
                        const active = cycles.find((c) => c.status === "active");
                        if (active) setActiveCycleId(active.id);
                      }}
                    >
                      Go to active cycle →
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default function CyclePage() {
  return (
    <Suspense>
      <CyclePageInner />
    </Suspense>
  );
}
