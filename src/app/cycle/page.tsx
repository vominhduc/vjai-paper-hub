"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ThumbsUp,
  ExternalLink,
  Users,
  Calendar,
  ChevronRight,
  Layers,
  Telescope,
  BookOpenCheck,
} from "lucide-react";
import { cycles } from "@/lib/data";
import type { Cycle } from "@/lib/data";

/* ─── Phase Tab ───────────────────────────────────────────── */
type Phase = "exploration" | "deep-dive";

function PhaseTab({
  phase,
  active,
  onClick,
}: {
  phase: Phase;
  active: boolean;
  onClick: () => void;
}) {
  const labels: Record<Phase, { label: string; icon: React.ReactNode }> = {
    exploration: { label: "Exploration Phase", icon: <Telescope size={15} /> },
    "deep-dive": { label: "Deep Dive Phase", icon: <BookOpenCheck size={15} /> },
  };
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-200"
      style={
        active
          ? {
              background: "linear-gradient(135deg, #1A237E, #FF5722)",
              color: "white",
              boxShadow: "0 0 24px rgba(255,87,34,0.35)",
            }
          : {
              background: "rgba(255,255,255,0.05)",
              color: "rgba(232,234,246,0.5)",
              border: "1px solid rgba(255,255,255,0.08)",
            }
      }
    >
      {labels[phase].icon}
      {labels[phase].label}
    </button>
  );
}

/* ─── Nomination Card ─────────────────────────────────────── */
function NominationCard({
  nom,
  rank,
}: {
  nom: Cycle["nominations"][0];
  rank: number;
}) {
  const isSelected = nom.is_selected;

  return (
    <div
      className="glass-card glow-border-hover rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden"
      style={{
        border: isSelected
          ? "1px solid rgba(255,87,34,0.5)"
          : "1px solid rgba(255,255,255,0.07)",
        background: isSelected
          ? "rgba(255,87,34,0.05)"
          : "rgba(255,255,255,0.03)",
      }}
    >
      {isSelected && (
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
              width: `${Math.min(nom.votes * 10, 100)}%`,
              background: isSelected
                ? "linear-gradient(90deg, #FF5722, #FF7043)"
                : "linear-gradient(90deg, #1A237E, #3949AB)",
            }}
          />
        </div>
        <div
          className="flex items-center gap-1 text-xs font-bold shrink-0"
          style={{ color: isSelected ? "#FF5722" : "rgba(232,234,246,0.5)" }}
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
          className="text-xs font-semibold flex items-center gap-1 mt-auto"
          style={{ color: "#FF5722" }}
        >
          <ExternalLink size={10} /> arXiv Paper
        </a>
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
            href="https://github.com/vominhduc/vjai-paper-hub/issues/new?labels=nomination&template=02-nominate-cycle.yml"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost flex-1 text-center text-white font-semibold text-sm py-3 rounded-xl"
          >
            Register
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

        {/* Theme card */}
        <div
          className="glass-card rounded-2xl p-6 flex-1"
          style={{ border: "1px solid rgba(255,255,255,0.09)" }}
        >
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: "rgba(232,234,246,0.35)" }}
          >
            Cycle Theme
          </p>
          <h3 className="text-base font-bold text-white mb-2">{cycle.theme}</h3>
          <p className="text-xs" style={{ color: "rgba(232,234,246,0.5)" }}>
            Quarter {cycle.quarter} · Cycle {cycle.cycle}
          </p>
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

/* ─── Page ────────────────────────────────────────────────── */
export default function CyclePage() {
  const [activeCycleId, setActiveCycleId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      if (hash && cycles.some((c) => c.id === hash)) return hash;
    }
    return cycles[0]?.id ?? "";
  });
  const cycle = cycles.find((c) => c.id === activeCycleId) ?? cycles[0];

  const [phase, setPhase] = useState<Phase>(
    (cycle?.status as Phase) ?? "exploration"
  );

  const sortedNominations = [...(cycle?.nominations ?? [])].sort(
    (a, b) => b.votes - a.votes
  );

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
                Two phases. Explore nominations, vote for the best, then go deep. Every cycle
                produces a reproduced result and a community artifact.
              </p>
            </div>

            {/* Cycle selector */}
            <div className="flex gap-2">
              {cycles.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setActiveCycleId(c.id);
                    setPhase(c.status as Phase);
                  }}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
                  style={
                    activeCycleId === c.id
                      ? {
                          background: "rgba(255,87,34,0.2)",
                          color: "#FF5722",
                          border: "1px solid rgba(255,87,34,0.5)",
                        }
                      : {
                          background: "rgba(255,255,255,0.04)",
                          color: "rgba(232,234,246,0.5)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }
                  }
                >
                  {c.id.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Phase indicator */}
          <div
            className="mt-8 p-4 rounded-2xl flex items-center gap-6"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div className="flex gap-2">
              <PhaseTab phase="exploration" active={phase === "exploration"} onClick={() => setPhase("exploration")} />
              <PhaseTab phase="deep-dive" active={phase === "deep-dive"} onClick={() => setPhase("deep-dive")} />
            </div>
            <p className="text-xs hidden sm:block" style={{ color: "rgba(232,234,246,0.4)" }}>
              {phase === "exploration"
                ? "Community nominations are open. Vote for the paper you want to deep-dive."
                : "Paper selected. Deep dive session scheduled — register to attend."}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="flex-1 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          {phase === "exploration" ? (
            <>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-white">
                  Nominations{" "}
                  <span className="text-base font-normal" style={{ color: "rgba(232,234,246,0.4)" }}>
                    · {sortedNominations.length} papers
                  </span>
                </h2>
                <div
                  className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full"
                  style={{
                    background: "rgba(66,165,245,0.1)",
                    color: "#42A5F5",
                    border: "1px solid rgba(66,165,245,0.25)",
                  }}
                >
                  <Users size={11} />
                  Voting open · {cycle?.quarter}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {sortedNominations.map((nom, i) => (
                  <NominationCard key={nom.id} nom={nom} rank={i + 1} />
                ))}
              </div>

              <div className="mt-10 text-center">
                <p className="text-sm mb-4" style={{ color: "rgba(232,234,246,0.4)" }}>
                  Want to nominate a paper?
                </p>
                <a
                  href="https://github.com/vominhduc/vjai-paper-hub/issues/new?labels=nomination&template=02-nominate-cycle.yml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost text-white font-semibold px-6 py-2.5 rounded-full text-sm inline-flex items-center gap-2"
                >
                  Nominate a Paper <ArrowRight size={13} />
                </a>
              </div>
            </>
          ) : (
            cycle && <DeepDiveSpotlight cycle={cycle} />
          )}
        </div>
      </section>
    </div>
  );
}
