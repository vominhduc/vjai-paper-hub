import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Users,
  GitFork,
  Zap,
  TrendingUp,
  Calendar,
  ChevronRight,
  Star,
} from "lucide-react";
import { cycles, archive, getCyclePhase, siteStats, cycleLabel } from "@/lib/data";
import Countdown from "@/components/Countdown";



const globalStats = [
  { icon: BookOpen, value: String(siteStats.papersDigested), label: "Papers Digested", color: "#FF5722" },
  { icon: Users, value: String(siteStats.activeMembers), label: "Active Members", color: "#42A5F5" },
  { icon: GitFork, value: String(siteStats.ossRepos), label: "OSS Repos", color: "#4CAF50" },
  { icon: Zap, value: "Monthly", label: "Cadence", color: "#FF5722" },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="h-px w-8" style={{ background: "rgba(255,87,34,0.5)" }} />
      <span className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: "#FF5722" }}>
        {children}
      </span>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────── */
export default function Home() {
  const deepDiveCycle = cycles.find((c) => getCyclePhase(c) === "deep-dive");
  const activeCycle =
    deepDiveCycle ??
    cycles.find((c) => getCyclePhase(c) === "voting") ??
    cycles.find((c) => getCyclePhase(c) === "nominating") ??
    cycles[0];
  const phase = activeCycle ? getCyclePhase(activeCycle) : "nominating";
  const selected = deepDiveCycle?.nominations.find((n) => n.is_selected);
  const recentPapers = archive.slice(0, 3);

  return (
    <div
      className="flex flex-col"
      style={{
        background: "linear-gradient(160deg, #070c26 0%, #0e1550 50%, #070c26 100%)",
        color: "#e8eaf6",
      }}
    >
      {/* ══ HERO ══════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(26,35,126,0.5) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-24 right-8 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(255,87,34,0.1) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 py-24 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* ── Left: copy ── */}
            <div>
              <div
                className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full text-xs font-semibold"
                style={{
                  background: "rgba(255,87,34,0.1)",
                  border: "1px solid rgba(255,87,34,0.35)",
                  color: "#FF7043",
                }}
              >
                <span className="relative flex h-2 w-2">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ background: "#FF5722" }}
                  />
                  <span
                    className="relative inline-flex rounded-full h-2 w-2"
                    style={{ background: "#FF5722" }}
                  />
                </span>
                2026 Season Active · Vietnam–Japan AI
              </div>

              <h1
                className="text-5xl lg:text-6xl font-black leading-[1.1] mb-6 tracking-tight"
                style={{ fontFamily: "var(--font-geist-sans)" }}
              >
                <span className="gradient-text">VJAI</span>{" "}
                <span className="text-white">Paper</span>
                <br />
                <span className="text-white">Reading</span>{" "}
                <span style={{ color: "#FF5722" }}>Hub.</span>
              </h1>

              <p
                className="text-lg mb-10 max-w-lg leading-relaxed"
                style={{ color: "rgba(232,234,246,0.65)" }}
              >
                Bridging the gap between academic SOTA and hackathon-ready MVPs.
                Monthly deep-dives for AI engineers and researchers in Japan &amp; Vietnam.
              </p>

              <div className="flex flex-wrap gap-4 mb-12">
                <a
                  href="#featured"
                  className="btn-orange inline-flex items-center gap-2 text-white font-bold px-7 py-3.5 rounded-full text-sm"
                >
                  View This Cycle <ArrowRight size={14} />
                </a>
                <Link
                  href="/roadmap"
                  className="btn-ghost inline-flex items-center gap-2 font-semibold px-7 py-3.5 rounded-full text-sm text-white"
                >
                  2026 Roadmap <ChevronRight size={14} />
                </Link>
              </div>

              {/* Stat row */}
              <div className="flex flex-wrap gap-8">
                {globalStats.map((s) => (
                  <div key={s.label} className="flex items-center gap-2.5">
                    <s.icon size={16} style={{ color: s.color }} />
                    <div>
                      <div className="text-lg font-black leading-none" style={{ color: s.color }}>
                        {s.value}
                      </div>
                      <div
                        className="text-xs mt-0.5"
                        style={{ color: "rgba(232,234,246,0.45)" }}
                      >
                        {s.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: Spotlight + Countdown ── */}
            <div className="float-anim flex flex-col gap-4">
              {/* Countdown — always shown when there's a session date */}
              {activeCycle?.session.date && (
                <div className="glass-card rounded-2xl p-5">
                  <p className="text-xs font-semibold mb-4 text-center uppercase tracking-widest"
                    style={{ color: "rgba(232,234,246,0.4)" }}>
                    <Calendar size={11} className="inline mr-1.5" />
                    Next Session · {activeCycle.session.date}
                  </p>
                  <Countdown targetDate={activeCycle.session.date} />
                </div>
              )}

              {/* Deep-dive: selected paper spotlight */}
              {phase === "deep-dive" && selected && (
                <div
                  className="glass-card rounded-2xl p-7 relative overflow-hidden"
                  style={{ border: "1px solid rgba(255,87,34,0.25)" }}
                >
                  <div
                    className="absolute -top-8 -right-8 w-36 h-36 rounded-full pointer-events-none"
                    style={{
                      background: "radial-gradient(circle, rgba(255,87,34,0.15) 0%, transparent 70%)",
                    }}
                  />
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs mb-2" style={{ color: "rgba(232,234,246,0.4)" }}>
                        {activeCycle?.id?.toUpperCase()} · Selected Paper
                      </p>
                      <div className="flex gap-2">
                        {selected.tags.slice(0, 2).map((t) => (
                          <span key={t} className="paper-tag text-xs font-bold px-2.5 py-0.5 rounded-full">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"
                      style={{
                        background: "rgba(255,87,34,0.15)",
                        color: "#FF5722",
                        border: "1px solid rgba(255,87,34,0.4)",
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                      Deep Dive
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white leading-snug mb-2">
                    {selected.title}
                  </h2>
                  <p className="text-xs mb-4" style={{ color: "#FF7043" }}>
                    Presenter: {activeCycle?.session.presenter} · {activeCycle?.session.presenter_role}
                  </p>
                  <div className="glow-line mb-4" />
                  <ul className="flex flex-col gap-2 mb-5">
                    {activeCycle?.session.agenda.slice(0, 3).map((item: string, i: number) => (
                      <li key={i} className="flex gap-2 text-xs" style={{ color: "rgba(232,234,246,0.6)" }}>
                        <span className="font-bold shrink-0" style={{ color: "#FF5722" }}>
                          0{i + 1}
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-3">
                    {selected.arxiv && (
                      <a href={selected.arxiv} target="_blank" rel="noopener noreferrer"
                        className="btn-orange flex-1 text-center text-white font-bold text-sm py-2.5 rounded-xl">
                        Read Paper
                      </a>
                    )}
                    <Link href="/cycle"
                      className="btn-ghost flex-1 text-center text-white font-semibold text-sm py-2.5 rounded-xl">
                      Full Agenda
                    </Link>
                  </div>
                </div>
              )}

              {/* Nominating / Voting: show current nominations */}
              {(phase === "nominating" || phase === "voting") && activeCycle && (
                <div
                  className="glass-card rounded-2xl p-7 relative overflow-hidden"
                  style={{ border: "1px solid rgba(66,165,245,0.2)" }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs mb-1" style={{ color: "rgba(232,234,246,0.4)" }}>
                        {cycleLabel(activeCycle)}
                      </p>
                    </div>

                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0"
                      style={{
                        background: phase === "voting" ? "rgba(255,152,0,0.12)" : "rgba(66,165,245,0.1)",
                        color: phase === "voting" ? "#FF9800" : "#42A5F5",
                        border: `1px solid ${phase === "voting" ? "rgba(255,152,0,0.3)" : "rgba(66,165,245,0.25)"}`,
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                      {phase === "voting" ? "Voting Open" : "Nominations Open"}
                    </span>
                  </div>

                  <div className="glow-line mb-4" />

                  <div className="flex flex-col gap-3 mb-5">
                    {[...activeCycle.nominations]
                      .sort((a, b) => b.votes - a.votes)
                      .slice(0, 3)
                      .map((nom, i) => (
                        <div key={nom.id} className="flex items-start gap-3">
                          <span
                            className="text-xs font-black w-5 shrink-0 mt-0.5"
                            style={{ color: i === 0 ? "#FF5722" : "rgba(232,234,246,0.3)" }}
                          >
                            #{i + 1}
                          </span>
                          <p className="text-xs text-white leading-snug flex-1 line-clamp-2">
                            {nom.title}
                          </p>
                        </div>
                      ))}
                  </div>

                  <Link href="/cycle"
                    className="btn-ghost w-full text-center text-white font-semibold text-sm py-2.5 rounded-xl block">
                    {phase === "voting" ? "Vote Now →" : "View & Nominate →"}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══ KEY INSIGHTS (featured paper bullet points) ══════ */}
      {selected && (
        <section id="featured" className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <div>
                <SectionLabel>Current Deep Dive</SectionLabel>
                <h2 className="text-3xl font-black text-white mb-4 leading-tight">
                  {selected.title}
                </h2>
                <p className="text-base mb-8" style={{ color: "rgba(232,234,246,0.6)" }}>
                  Key technical insights your team will walk away with after this session.
                </p>

                <div className="flex flex-col gap-4">
                  {(activeCycle?.session.agenda ?? [
                    "How pure RL (GRPO) produces emergent chain-of-thought reasoning with zero SFT warm-up",
                    "Why the reward function design (format + accuracy) is the critical hyperparameter",
                    "Benchmark-level comparison vs OpenAI o1 on MATH-500, AIME 2024, and LiveCodeBench",
                    "Practical guide: running DeepSeek-R1-7B locally with Ollama on your laptop",
                  ]).slice(0, 4).map((insight, i) => (
                    <div
                      key={i}
                      className="flex gap-4 p-4 rounded-xl glow-border-hover"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.07)",
                      }}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                        style={{ background: "rgba(255,87,34,0.15)", color: "#FF5722" }}
                      >
                        {i + 1}
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: "rgba(232,234,246,0.75)" }}>
                        {insight}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Session full agenda */}
              <div
                className="glass-card rounded-2xl p-7"
                style={{ border: "1px solid rgba(255,255,255,0.09)" }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-bold text-white">Session Agenda</h3>
                  <span className="text-xs" style={{ color: "rgba(232,234,246,0.4)" }}>
                    {activeCycle?.session.date}
                  </span>
                </div>

                <div className="flex flex-col gap-3 mb-6">
                  {activeCycle?.session.agenda.map((item, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                        style={{ background: "rgba(255,87,34,0.2)", color: "#FF5722" }}
                      >
                        {i + 1}
                      </div>
                      <span className="text-sm" style={{ color: "rgba(232,234,246,0.7)" }}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="glow-line mb-6" />

                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm"
                    style={{ background: "linear-gradient(135deg, #1A237E, #FF5722)", color: "white" }}
                  >
                    {activeCycle?.session.presenter.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{activeCycle?.session.presenter}</p>
                    <p className="text-xs" style={{ color: "rgba(232,234,246,0.45)" }}>
                      {activeCycle?.session.presenter_role}
                    </p>
                  </div>
                </div>

                <Link
                  href="/cycle"
                  className="btn-orange w-full text-center text-white font-bold text-sm py-3 rounded-xl block"
                >
                  View Session Details →
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══ RECENT PAPERS ════════════════════════════════════ */}
      <section className="py-20" style={{ background: "rgba(7,12,38,0.5)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <SectionLabel>Knowledge Hub</SectionLabel>
              <h2 className="text-3xl font-black text-white">Recent Papers</h2>
            </div>
            <Link
              href="/archive"
              className="text-sm font-semibold flex items-center gap-1.5"
              style={{ color: "#FF5722" }}
            >
              All {archive.length} papers <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-5 mb-10">
            {recentPapers.map((paper) => (
              <div
                key={paper.id}
                className="stat-card glass-card glow-border-hover rounded-2xl p-6 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5 flex-wrap">
                    {paper.tags.slice(0, 2).map((t) => (
                      <span key={t} className="paper-tag text-xs px-2.5 py-0.5 rounded-full font-semibold">
                        {t}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs font-mono" style={{ color: "rgba(232,234,246,0.3)" }}>
                    {paper.conference}
                  </span>
                </div>
                <p className="text-sm font-bold text-white leading-snug flex-1">{paper.title}</p>
                <div className="flex items-center gap-2">
                  <div
                    className="flex-1 h-1 rounded-full overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.07)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${paper.vibeScore}%`,
                        background: "linear-gradient(90deg, #1A237E, #FF5722)",
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold shrink-0" style={{ color: "#FF5722" }}>
                    ⚡ {paper.vibeScore}%
                  </span>
                </div>
                <div className="flex gap-2">
                  {paper.resources.arxiv && (
                    <a
                      href={paper.resources.arxiv}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold flex items-center gap-1"
                      style={{ color: "#FF5722" }}
                    >
                      <BookOpen size={10} /> Paper
                    </a>
                  )}
                  {paper.resources.vjai_code && (
                    <a
                      href={paper.resources.vjai_code}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold flex items-center gap-1 ml-2"
                      style={{ color: "#4CAF50" }}
                    >
                      <GitFork size={10} /> Repo
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ══════════════════════════════════════════════ */}
      <section
        className="py-20"
        style={{ background: "rgba(7,12,38,0.8)", borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div
            className="rounded-3xl p-12 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(26,35,126,0.65) 0%, rgba(255,87,34,0.12) 100%)",
              border: "1px solid rgba(255,87,34,0.2)",
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse 60% 60% at 50% 100%, rgba(255,87,34,0.1) 0%, transparent 70%)",
              }}
            />
            <TrendingUp size={32} className="mx-auto mb-4" style={{ color: "#FF5722" }} />
            <h2 className="text-3xl font-black text-white mb-3 relative">
              From Paper to Prototype
            </h2>
            <p className="text-base mb-8 relative" style={{ color: "rgba(232,234,246,0.6)" }}>
              Join {siteStats.activeMembers}+ AI engineers and researchers in Vietnam &amp; Japan building at the frontier.
              Next session: <strong style={{ color: "#FF5722" }}>
                {activeCycle?.session.date ?? "Coming Soon"}
              </strong>.
            </p>
            <div className="flex flex-wrap gap-4 justify-center relative">
              <Link
                href="/cycle"
                className="btn-orange text-white font-bold px-8 py-3.5 rounded-full text-sm inline-flex items-center gap-2"
              >
                Join This Cycle <ArrowRight size={14} />
              </Link>
              <Link
                href="/seeds"
                className="btn-ghost text-white font-semibold px-8 py-3.5 rounded-full text-sm"
              >
                Browse Seed Papers
              </Link>
              <Link
                href="/guide"
                className="btn-ghost text-white font-semibold px-8 py-3.5 rounded-full text-sm"
              >
                How it Works
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
