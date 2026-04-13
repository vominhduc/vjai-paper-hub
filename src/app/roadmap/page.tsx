"use client";

import Link from "next/link";
import { ArrowRight, Calendar, FlameKindling, CheckCircle2, Clock } from "lucide-react";
import { cycles, cycleLabel, getCyclePhase } from "@/lib/data";

/* ─── Page ────────────────────────────────────────────────── */
export default function RoadmapPage() {
  return (
    <div
      className="flex flex-col"
      style={{
        background: "linear-gradient(160deg, #070c26 0%, #111a5e 50%, #0a0f2e 100%)",
        color: "#e8eaf6",
      }}
    >
      {/* ══ HERO ════════════════════════════════════════════ */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(26,35,126,0.6) 0%, transparent 70%)" }}
        />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-6 justify-center">
            <div className="h-px w-12" style={{ background: "rgba(255,87,34,0.5)" }} />
            <span className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: "#FF5722" }}>
              Reading Plan
            </span>
            <div className="h-px w-12" style={{ background: "rgba(255,87,34,0.5)" }} />
          </div>

          <h1 className="text-5xl lg:text-6xl font-black text-center text-white mb-6 tracking-tight">
            The{" "}
            <span style={{ background: "linear-gradient(135deg, #e8eaf6, #FF5722)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Paper Roadmap
            </span>
          </h1>

          <p className="text-center text-lg max-w-2xl mx-auto mb-12" style={{ color: "rgba(232,234,246,0.65)" }}>
            {cycles.length} sessions across the year — tracked live from our archive.
            Progress updates automatically as sessions are completed.
          </p>
        </div>
      </section>

      {/* ══ SESSION GRID ════════════════════════════════════ */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-6">
            {cycles.map((cycle) => {
              const phase = getCyclePhase(cycle);
              const isActive = cycle.status === "active";
              const isArchived = phase === "archived";

              const phaseLabel = isArchived
                ? { icon: <CheckCircle2 size={12} />, text: "Completed", color: "#4CAF50", bg: "rgba(76,175,80,0.1)", border: "rgba(76,175,80,0.25)" }
                : isActive
                ? { icon: <FlameKindling size={12} />, text: "Active", color: "#FF5722", bg: "rgba(255,87,34,0.1)", border: "rgba(255,87,34,0.35)" }
                : { icon: <Clock size={12} />, text: "Planned", color: "#42A5F5", bg: "rgba(66,165,245,0.08)", border: "rgba(66,165,245,0.2)" };

              return (
                <div
                  key={cycle.id}
                  className="glass-card rounded-2xl p-6 flex flex-col gap-3"
                  style={{ border: isActive ? "1px solid rgba(255,87,34,0.35)" : "1px solid rgba(255,255,255,0.08)" }}
                >
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-lg font-black" style={{ color: "#FF5722" }}>{cycleLabel(cycle)}</span>
                      <span
                        className="ml-2 text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: "rgba(255,87,34,0.08)", color: "#FF9800" }}
                      >
                        {cycle.theme}
                      </span>
                    </div>
                    <span
                      className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full shrink-0"
                      style={{ color: phaseLabel.color, background: phaseLabel.bg, border: `1px solid ${phaseLabel.border}` }}
                    >
                      {phaseLabel.icon} {phaseLabel.text}
                    </span>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center gap-3 text-xs" style={{ color: "rgba(232,234,246,0.5)" }}>
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={11} />
                      Exploration: <strong className="text-white ml-1">
                        {cycle.exploration_start
                          ? new Date(cycle.exploration_start).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                          : "TBD"}
                      </strong>
                    </span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={11} />
                      Deep Dive: <strong className="text-white ml-1">
                        {cycle.session_date
                          ? new Date(cycle.session_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                          : "TBD"}
                      </strong>
                    </span>
                  </div>

                  {/* Top nominations */}
                  {cycle.nominations.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      {cycle.nominations.slice(0, 3).map((n, i) => (
                        <div key={n.id} className="flex items-start gap-2 text-xs" style={{ color: n.is_selected ? "#FF7043" : "rgba(232,234,246,0.55)" }}>
                          <span className="font-bold shrink-0" style={{ color: i === 0 ? "#FF5722" : "rgba(232,234,246,0.25)" }}>#{i + 1}</span>
                          <span className="line-clamp-1">{n.title}</span>
                        </div>
                      ))}
                      {cycle.nominations.length > 3 && (
                        <p className="text-xs" style={{ color: "rgba(232,234,246,0.3)" }}>
                          +{cycle.nominations.length - 3} more nominations
                        </p>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-1 mt-auto">
                    <span className="text-xs" style={{ color: "rgba(232,234,246,0.5)" }}>
                      Presenter: <strong className="text-white">{cycle.session.presenter || "TBA"}</strong>
                    </span>
                    <div className="flex items-center gap-2">
                      {isActive && getCyclePhase(cycle) === "nominating" && (
                        <a
                          href={`https://github.com/vominhduc/vjai-paper-hub/issues/new?labels=nomination&template=02-nominate-cycle.yml&cycle_id=${encodeURIComponent(cycle.id)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
                          style={{
                            color: "#FF9800",
                            border: "1px solid rgba(255,152,0,0.35)",
                            background: "rgba(255,152,0,0.07)",
                          }}
                        >
                          Nominate
                        </a>
                      )}
                      <Link
                        href={`/cycle?cycle=${cycle.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
                        style={{
                          color: "#FF5722",
                          border: "1px solid rgba(255,87,34,0.35)",
                          background: "rgba(255,87,34,0.07)",
                        }}
                      >
                        View Details <ArrowRight size={11} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ NOMINATE CTA ════════════════════════════════════ */}
      <section
        className="py-20"
        style={{ background: "rgba(10,15,46,0.7)", borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="text-4xl mb-6">🗳️</div>
          <h2 className="text-3xl font-black text-white mb-4">Nominate a Paper</h2>
          <p className="text-base mb-8" style={{ color: "rgba(232,234,246,0.6)" }}>
            Open a GitHub issue to nominate a paper for the current active cycle. You commit to presenting it at the Exploration session — after all presentations, the community votes for one paper to deep-dive.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="https://github.com/vominhduc/vjai-paper-hub/issues/new?labels=nomination&template=02-nominate-cycle.yml"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-orange text-white font-bold px-8 py-3.5 rounded-full text-sm inline-flex items-center gap-2"
            >
              Nominate a Paper <ArrowRight size={14} />
            </a>
            <Link href="/" className="btn-ghost text-white font-bold px-8 py-3.5 rounded-full text-sm">
              ← Back to Home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
