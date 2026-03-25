"use client";

import Link from "next/link";
import { BookOpen, GitFork, ArrowRight, CheckCircle2, Circle, Loader2, Clock } from "lucide-react";
import {
  archive,
  cycles,
  quarterMetas,
  archiveForQuarter,
  quarterOf,
  type ArchivePaper,
  type QuarterMeta,
} from "@/lib/data";

/* ─── Types ─────────────────────────────────────────────── */
type QStatus = "completed" | "in-progress" | "upcoming" | "planned";

/* ─── Helpers ────────────────────────────────────────────── */
function getQStatus(meta: QuarterMeta, now: Date): QStatus {
  const currentQ = quarterOf(now);
  const currentYear = now.getFullYear();
  if (meta.year < currentYear) return "completed";
  if (meta.year > currentYear) return "planned";
  const order = ["Q1", "Q2", "Q3", "Q4"];
  const metaIdx = order.indexOf(meta.q);
  const nowIdx = order.indexOf(currentQ);
  if (metaIdx < nowIdx) return "completed";
  if (metaIdx === nowIdx) return "in-progress";
  if (metaIdx === nowIdx + 1) return "upcoming";
  return "planned";
}

const statusConfig: Record<
  QStatus,
  { label: string; color: string; bg: string; border: string; icon: React.ReactNode }
> = {
  completed: {
    label: "Completed", color: "#4CAF50", bg: "rgba(76,175,80,0.12)", border: "rgba(76,175,80,0.3)",
    icon: <CheckCircle2 size={14} />,
  },
  "in-progress": {
    label: "In Progress", color: "#FF5722", bg: "rgba(255,87,34,0.15)", border: "rgba(255,87,34,0.5)",
    icon: <Loader2 size={14} className="animate-spin" />,
  },
  upcoming: {
    label: "Upcoming", color: "#42A5F5", bg: "rgba(66,165,245,0.1)", border: "rgba(66,165,245,0.3)",
    icon: <Clock size={14} />,
  },
  planned: {
    label: "Planned", color: "rgba(232,234,246,0.4)", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.1)",
    icon: <Circle size={14} />,
  },
};

function QStatusBadge({ status }: { status: QStatus }) {
  const cfg = statusConfig[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

function ProgressBar({ done, target, status }: { done: number; target: number; status: QStatus }) {
  const pct = Math.min(Math.round((done / target) * 100), 100);
  const color = status === "completed" ? "#4CAF50" : status === "in-progress" ? "#FF5722" : "rgba(255,255,255,0.15)";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-bold shrink-0" style={{ color }}>
        {done}/{target}
      </span>
    </div>
  );
}

function PaperRow({ paper }: { paper: ArchivePaper }) {
  return (
    <div
      className="flex items-start gap-3 p-3 rounded-xl"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div
        className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
        style={{
          background:
            paper.status === "Reproduced" ? "#4CAF50" :
            paper.status === "In Review" ? "#FF5722" : "rgba(232,234,246,0.35)",
        }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-white leading-snug truncate">{paper.title}</p>
        <p className="text-xs mt-0.5" style={{ color: "rgba(232,234,246,0.4)" }}>
          {paper.conference} {paper.year} · {paper.presenter}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {paper.resources.arxiv && (
          <a href={paper.resources.arxiv} target="_blank" rel="noopener noreferrer"
            className="text-xs font-semibold flex items-center gap-0.5" style={{ color: "#FF5722" }}>
            <BookOpen size={10} /> PDF
          </a>
        )}
        {paper.resources.vjai_code && (
          <a href={paper.resources.vjai_code} target="_blank" rel="noopener noreferrer"
            className="text-xs font-semibold flex items-center gap-0.5" style={{ color: "#4CAF50" }}>
            <GitFork size={10} /> Repo
          </a>
        )}
      </div>
    </div>
  );
}

function CycleChip({ theme, status }: { theme: string; status: string }) {
  const isActive = status === "deep-dive" || status === "exploration";
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
      style={{
        background: isActive ? "rgba(255,87,34,0.12)" : "rgba(255,255,255,0.05)",
        border: isActive ? "1px solid rgba(255,87,34,0.35)" : "1px solid rgba(255,255,255,0.08)",
        color: isActive ? "#FF7043" : "rgba(232,234,246,0.5)",
      }}
    >
      {isActive && <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#FF5722" }} />}
      {theme}
    </span>
  );
}

function QuarterCard({
  meta, papers, qStatus, qCycles,
}: {
  meta: QuarterMeta;
  papers: ArchivePaper[];
  qStatus: QStatus;
  qCycles: typeof cycles;
}) {
  const cfg = statusConfig[qStatus];
  const isActive = qStatus === "in-progress";

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        border: isActive ? "1px solid rgba(255,87,34,0.4)" : "1px solid rgba(255,255,255,0.08)",
        boxShadow: isActive ? "0 0 40px rgba(255,87,34,0.08)" : undefined,
        background: isActive ? "rgba(255,87,34,0.03)" : "rgba(255,255,255,0.02)",
      }}
    >
      {/* Header */}
      <div
        className="p-6 pb-5"
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: isActive ? "rgba(255,87,34,0.06)" : "rgba(255,255,255,0.02)",
        }}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-2xl font-black" style={{ color: cfg.color }}>{meta.q}</span>
              <span className="text-sm font-semibold" style={{ color: "rgba(232,234,246,0.5)" }}>{meta.year}</span>
            </div>
            <h2 className="text-base font-black text-white">{meta.theme}</h2>
          </div>
          <QStatusBadge status={qStatus} />
        </div>

        {/* Conference pills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {meta.conferences.map((c) => (
            <span key={c} className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
              style={{ background: "rgba(66,165,245,0.1)", border: "1px solid rgba(66,165,245,0.2)", color: "#42A5F5" }}>
              {c}
            </span>
          ))}
        </div>

        {/* Progress */}
        <div className="mb-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold" style={{ color: "rgba(232,234,246,0.45)" }}>Papers Read</span>
            <span className="text-xs font-bold" style={{ color: cfg.color }}>
              {Math.min(Math.round((papers.length / meta.target) * 100), 100)}%
            </span>
          </div>
          <ProgressBar done={papers.length} target={meta.target} status={qStatus} />
        </div>
      </div>

      {/* Active cycles */}
      {qCycles.length > 0 && (
        <div className="px-6 pt-4 pb-2">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(232,234,246,0.3)" }}>
            Cycles
          </p>
          <div className="flex flex-wrap gap-2">
            {qCycles.map((c) => (
              <CycleChip key={c.id} theme={c.theme} status={c.status} />
            ))}
          </div>
        </div>
      )}

      {/* Papers list */}
      <div className="px-6 pt-4 pb-6">
        {papers.length > 0 ? (
          <>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(232,234,246,0.3)" }}>
              Papers Read ({papers.length})
            </p>
            <div className="flex flex-col gap-2">
              {papers.map((p) => <PaperRow key={p.id} paper={p} />)}
            </div>
          </>
        ) : qStatus !== "planned" ? (
          <p className="text-xs italic" style={{ color: "rgba(232,234,246,0.3)" }}>
            No papers archived yet for this quarter.
          </p>
        ) : (
          <p className="text-xs italic" style={{ color: "rgba(232,234,246,0.25)" }}>
            Sessions scheduled — nominations open closer to the quarter start.
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────── */
export default function RoadmapPage() {
  const now = new Date();
  const currentQ = quarterOf(now);
  const currentYear = now.getFullYear();

  const totalTarget = quarterMetas.reduce((a, m) => a + m.target, 0);
  const totalDone = archive.length;
  const overallPct = Math.min(Math.round((totalDone / totalTarget) * 100), 100);

  const quarterData = quarterMetas.map((meta) => ({
    meta,
    papers: archiveForQuarter(meta.q, meta.year),
    qStatus: getQStatus(meta, now),
    qCycles: cycles.filter((c) => c.quarter === meta.q),
  }));

  const inProgressData = quarterData.find((d) => d.qStatus === "in-progress");

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
              {currentYear} Reading Plan · Currently in {currentQ}
            </span>
            <div className="h-px w-12" style={{ background: "rgba(255,87,34,0.5)" }} />
          </div>

          <h1 className="text-5xl lg:text-6xl font-black text-center text-white mb-6 tracking-tight">
            The {currentYear}{" "}
            <span style={{ background: "linear-gradient(135deg, #e8eaf6, #FF5722)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Paper Roadmap
            </span>
          </h1>

          <p className="text-center text-lg max-w-2xl mx-auto mb-12" style={{ color: "rgba(232,234,246,0.65)" }}>
            {totalTarget} papers across 4 quarters — tracked live from our archive.
            Progress updates automatically as sessions are completed.
          </p>

          {/* Overall progress */}
          <div className="glass-card rounded-2xl p-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-white">Season Progress</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(232,234,246,0.5)" }}>
                  {totalDone} of {totalTarget} papers read
                </p>
              </div>
              <div className="text-3xl font-black" style={{ color: "#FF5722" }}>{overallPct}%</div>
            </div>
            <div className="w-full rounded-full h-2.5 overflow-hidden mb-5" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${overallPct}%`, background: "linear-gradient(90deg, #1A237E, #FF5722)" }}
              />
            </div>
            <div className="flex flex-wrap gap-5">
              {(["completed", "in-progress", "upcoming", "planned"] as QStatus[]).map((s) => {
                const cfg = statusConfig[s];
                const count = quarterData.filter((d) => d.qStatus === s).length;
                return (
                  <div key={s} className="flex items-center gap-1.5">
                    <span style={{ color: cfg.color }}>{cfg.icon}</span>
                    <span className="text-xs" style={{ color: "rgba(232,234,246,0.55)" }}>
                      {cfg.label}: <strong className="text-white">{count}</strong>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* In-progress banner */}
          {inProgressData && (
            <div
              className="mt-6 max-w-2xl mx-auto p-4 rounded-xl flex items-center gap-4"
              style={{ background: "rgba(255,87,34,0.08)", border: "1px solid rgba(255,87,34,0.25)" }}
            >
              <span className="text-xl">🔥</span>
              <div>
                <p className="text-sm font-bold text-white">
                  {inProgressData.meta.q} is live —{" "}
                  <span style={{ color: "#FF5722" }}>{inProgressData.meta.theme}</span>
                </p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(232,234,246,0.5)" }}>
                  {inProgressData.papers.length} of {inProgressData.meta.target} papers read ·{" "}
                  Conferences: {inProgressData.meta.conferences.join(", ")}
                </p>
              </div>
              <Link
                href="/cycle"
                className="ml-auto btn-orange text-white text-xs font-bold px-4 py-2 rounded-full shrink-0 inline-flex items-center gap-1"
              >
                View Cycle <ArrowRight size={11} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ══ QUARTER GRID ════════════════════════════════════ */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-6">
            {quarterData.map(({ meta, papers, qStatus, qCycles }) => (
              <QuarterCard key={meta.q} meta={meta} papers={papers} qStatus={qStatus} qCycles={qCycles} />
            ))}
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
            Q3 &amp; Q4 slots are open for community picks. Submit a nomination — the top-voted papers get scheduled.
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
