"use client";

import Link from "next/link";

/* ─── Types ──────────────────────────────────────────────── */
type Status = "completed" | "current" | "upcoming" | "planned";

interface RoadmapItem {
  session: string;
  /** ISO date string: "YYYY-MM-DD" or display string "Mon DD" */
  date: string;
  title: string;
  authors: string;
  tag: string;
  theme: string;
  /** Do NOT set manually — computed at runtime by computeStatuses() */
  status?: Status;
  arxiv?: string;
  notesAvailable?: boolean;
}

/* ─── Timeline Logic ──────────────────────────────────────
 * Automatically derives each item's status from today's date.
 *
 * Rules:
 *   - date < today - 3 days  → "completed"
 *   - within ±3 days of today → "current"
 *   - next upcoming (first after today) → "upcoming"
 *   - everything else future → "planned"
 *
 * Dates are stored as "YYYY-MM-DD" for reliable parsing.
 */
const YEAR = 2026;

function parseSessionDate(raw: string): Date | null {
  // Already ISO: "2026-04-12"
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return new Date(raw + "T12:00:00");
  // "Apr 12" style
  const m = raw.match(/^([A-Za-z]+)\s+(\d+)$/);
  if (m) {
    const months: Record<string, number> = {
      Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
      Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
    };
    const mo = months[m[1]];
    if (mo !== undefined) return new Date(YEAR, mo, parseInt(m[2]), 12, 0, 0);
  }
  return null;
}

function computeStatuses(
  items: RoadmapItem[],
  now: Date = new Date()
): (RoadmapItem & { status: Status })[] {
  const nowMs = now.getTime();
  const dayMs = 86_400_000;

  // Parse all dates first
  const parsed = items.map((item) => ({
    item,
    d: parseSessionDate(item.date),
  }));

  // Find the first item whose date is in the future → "upcoming"
  let upcomingSet = false;

  return parsed.map(({ item, d }) => {
    if (!d) return { ...item, status: "planned" as Status };

    const diff = d.getTime() - nowMs; // positive = future, negative = past

    let status: Status;
    if (diff < -3 * dayMs) {
      // More than 3 days ago
      status = "completed";
    } else if (Math.abs(diff) <= 3 * dayMs) {
      // Within ±3 days of today
      status = "current";
    } else if (!upcomingSet && diff > 3 * dayMs) {
      // First future item
      status = "upcoming";
      upcomingSet = true;
    } else {
      status = "planned";
    }

    return { ...item, status };
  });
}

/** Returns current quarter label based on today's month */
function getCurrentQuarter(now: Date = new Date()): string {
  const month = now.getMonth(); // 0-based
  if (month <= 2) return "Q1";
  if (month <= 5) return "Q2";
  if (month <= 8) return "Q3";
  return "Q4";
}

/* ─── Data (no status fields — computed at runtime) ─────── */
const quartersRaw: { label: string; items: RoadmapItem[] }[] = [
  {
    label: "Q1 2026 — Foundation & Scale",
    items: [
      {
        session: "S01", date: "2026-01-11",
        title: "Attention Is All You Need (Revisited)", authors: "Vaswani et al.",
        tag: "Architecture", theme: "Foundations",
        arxiv: "https://arxiv.org/abs/1706.03762", notesAvailable: true,
      },
      {
        session: "S02", date: "2026-01-25",
        title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP", authors: "Lewis et al., Meta AI",
        tag: "RAG", theme: "Retrieval",
        arxiv: "https://arxiv.org/abs/2005.11401", notesAvailable: true,
      },
      {
        session: "S03", date: "2026-02-08",
        title: "Mixture of Experts: A Survey", authors: "Cai et al.",
        tag: "Architecture", theme: "Scaling",
        arxiv: "https://arxiv.org/abs/2407.06204", notesAvailable: true,
      },
      {
        session: "S04", date: "2026-02-22",
        title: "AlphaFold 3: Protein Structure Prediction", authors: "Google DeepMind",
        tag: "Biology", theme: "Science AI",
        arxiv: "https://www.nature.com/articles/s41586-024-07487-w", notesAvailable: true,
      },
      {
        session: "S05", date: "2026-03-08",
        title: "Diffusion Policy: Visuomotor Policy Learning", authors: "Chi et al., Columbia",
        tag: "Robotics", theme: "Embodied AI",
        arxiv: "https://arxiv.org/abs/2303.04137", notesAvailable: true,
      },
      {
        session: "S06", date: "2026-03-22",
        title: "QLoRA: Efficient Finetuning of Quantized LLMs", authors: "Dettmers et al.",
        tag: "Training", theme: "Efficiency",
        arxiv: "https://arxiv.org/abs/2305.14314", notesAvailable: true,
      },
    ],
  },
  {
    label: "Q2 2026 — Reasoning & Efficiency",
    items: [
      {
        session: "S07", date: "2026-04-05",
        title: "Mamba: Linear-Time Sequence Modeling with SSMs", authors: "Gu & Dao",
        tag: "Architecture", theme: "State Space",
        arxiv: "https://arxiv.org/abs/2312.00752", notesAvailable: true,
      },
      {
        session: "S08", date: "2026-04-12",
        title: "DeepSeek-R1: Incentivizing Reasoning via Reinforcement Learning", authors: "DeepSeek-AI",
        tag: "LLM Reasoning", theme: "RL for LLMs",
        arxiv: "https://arxiv.org/abs/2501.12948",
      },
      {
        session: "S09", date: "2026-04-26",
        title: "JEPA: A World Model for Self-Supervised Learning", authors: "LeCun, Meta AI",
        tag: "World Models", theme: "Self-Supervised",
        arxiv: "https://arxiv.org/abs/2301.08243",
      },
      {
        session: "S10", date: "2026-05-10",
        title: "FlashAttention-3: Fast and Accurate Attention on H100 GPUs", authors: "Shah et al., Dao-AILab",
        tag: "Systems", theme: "Efficiency",
        arxiv: "https://arxiv.org/abs/2407.08608",
      },
      {
        session: "S11", date: "2026-05-24",
        title: "Gemini 2.0: Technical Report", authors: "Google DeepMind",
        tag: "Multimodal", theme: "Foundation Models",
      },
      {
        session: "S12", date: "2026-06-07",
        title: "Constitutional AI: Harmlessness from AI Feedback", authors: "Anthropic",
        tag: "Alignment", theme: "AI Safety",
        arxiv: "https://arxiv.org/abs/2212.08073",
      },
    ],
  },
  {
    label: "Q3 2026 — Vision, Agents & Robotics",
    items: [
      {
        session: "S13", date: "2026-06-21",
        title: "Segment Anything Model 2 (SAM 2)", authors: "Meta AI Research",
        tag: "Vision", theme: "Foundation Vision",
        arxiv: "https://arxiv.org/abs/2408.00714",
      },
      {
        session: "S14", date: "2026-07-05",
        title: "Voyager: An Open-Ended Embodied Agent with LLMs", authors: "Wang et al., NVIDIA",
        tag: "Agents", theme: "LLM Agents",
        arxiv: "https://arxiv.org/abs/2305.16291",
      },
      {
        session: "S15", date: "2026-07-19",
        title: "RT-2: Vision-Language-Action Models", authors: "Google DeepMind",
        tag: "Robotics", theme: "Embodied AI",
        arxiv: "https://arxiv.org/abs/2307.15818",
      },
      {
        session: "S16", date: "2026-08-02",
        title: "Scaling Laws for Neural Language Models", authors: "Kaplan et al., OpenAI",
        tag: "Scaling", theme: "Foundations",
        arxiv: "https://arxiv.org/abs/2001.08361",
      },
      {
        session: "S17", date: "2026-08-16",
        title: "DreamerV3: Mastering Diverse Domains", authors: "Hafner et al., Google",
        tag: "RL", theme: "World Models",
        arxiv: "https://arxiv.org/abs/2301.04104",
      },
      {
        session: "S18", date: "2026-08-30",
        title: "Toolformer: Language Models That Can Use Tools", authors: "Schick et al., Meta",
        tag: "Agents", theme: "Tool Use",
        arxiv: "https://arxiv.org/abs/2302.04761",
      },
    ],
  },
  {
    label: "Q4 2026 — Frontiers & Research Directions",
    items: [
      {
        session: "S19", date: "2026-09-13",
        title: "RLHF: Training Language Models to Follow Instructions", authors: "Ouyang et al., OpenAI",
        tag: "Alignment", theme: "Instruction Following",
        arxiv: "https://arxiv.org/abs/2203.02155",
      },
      {
        session: "S20", date: "2026-09-27",
        title: "Hyper-Networks and Dynamic Architecture", authors: "TBD — Community Vote",
        tag: "Architecture", theme: "Meta-Learning",
      },
      {
        session: "S21", date: "2026-10-11",
        title: "Multimodal Chain-of-Thought Reasoning", authors: "TBD — Community Vote",
        tag: "Reasoning", theme: "Multimodal",
      },
      {
        session: "S22", date: "2026-10-25",
        title: "Mechanistic Interpretability Survey", authors: "TBD — Community Vote",
        tag: "Interpretability", theme: "AI Safety",
      },
      {
        session: "S23", date: "2026-11-08",
        title: "Neuromorphic Computing & Spiking Neural Networks", authors: "TBD — Community Vote",
        tag: "Hardware", theme: "Neuromorphic",
      },
      {
        session: "S24", date: "2026-11-22",
        title: "2026 Year in Review — Community Picks", authors: "VJAI Community",
        tag: "Special", theme: "Review",
      },
    ],
  },
];

const statusConfig: Record<
  Status,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  completed: {
    label: "Completed",
    color: "#4CAF50",
    bg: "rgba(76,175,80,0.12)",
    border: "rgba(76,175,80,0.35)",
    dot: "#4CAF50",
  },
  current: {
    label: "Current",
    color: "#FF5722",
    bg: "rgba(255,87,34,0.15)",
    border: "rgba(255,87,34,0.5)",
    dot: "#FF5722",
  },
  upcoming: {
    label: "Upcoming",
    color: "#42A5F5",
    bg: "rgba(66,165,245,0.1)",
    border: "rgba(66,165,245,0.3)",
    dot: "#42A5F5",
  },
  planned: {
    label: "Planned",
    color: "rgba(232,234,246,0.4)",
    bg: "rgba(255,255,255,0.04)",
    border: "rgba(255,255,255,0.1)",
    dot: "rgba(232,234,246,0.3)",
  },
};

const tagColors: Record<string, string> = {
  Architecture: "#7C4DFF",
  RAG: "#00BCD4",
  Biology: "#66BB6A",
  Robotics: "#FF7043",
  Training: "#FFA726",
  "LLM Reasoning": "#FF5722",
  "World Models": "#AB47BC",
  Systems: "#26C6DA",
  Multimodal: "#EC407A",
  Alignment: "#78909C",
  Vision: "#29B6F6",
  Agents: "#FFCA28",
  RL: "#EF5350",
  Scaling: "#8D6E63",
  Interpretability: "#9E9E9E",
  Hardware: "#607D8B",
  Special: "#FF5722",
};

/* ─── Components ─────────────────────────────────────────── */
function StatusBadge({ status }: { status: Status }) {
  const cfg = statusConfig[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
    >
      {status === "current" ? (
        <span className="relative flex h-1.5 w-1.5">
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ background: cfg.dot }}
          />
          <span
            className="relative inline-flex rounded-full h-1.5 w-1.5"
            style={{ background: cfg.dot }}
          />
        </span>
      ) : (
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{ background: cfg.dot }}
        />
      )}
      {cfg.label}
    </span>
  );
}

function TagPill({ tag }: { tag: string }) {
  const color = tagColors[tag] ?? "#FF5722";
  return (
    <span
      className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
      style={{
        background: `${color}22`,
        border: `1px solid ${color}55`,
        color,
      }}
    >
      {tag}
    </span>
  );
}

/* ─── Page ────────────────────────────────────────────────── */
export default function RoadmapPage() {
  const now = new Date();
  const currentQ = getCurrentQuarter(now);

  // Compute statuses dynamically from today's date
  const quarters = quartersRaw.map((q) => ({
    ...q,
    items: computeStatuses(q.items, now),
  }));

  const totalSessions = quarters.reduce((a, q) => a + q.items.length, 0);
  const completedCount = quarters
    .flatMap((q) => q.items)
    .filter((i) => i.status === "completed").length;
  const progressPct = Math.round((completedCount / totalSessions) * 100);

  return (
    <div
      className="flex flex-col"
      style={{
        background: "linear-gradient(160deg, #070c26 0%, #111a5e 50%, #0a0f2e 100%)",
        color: "#e8eaf6",
      }}
    >
      {/* ══ HERO ══════════════════════════════════════════════ */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(26,35,126,0.6) 0%, transparent 70%)",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-6 justify-center">
            <div className="h-px w-12" style={{ background: "rgba(255,87,34,0.5)" }} />
            <span
              className="text-xs font-bold tracking-[0.2em] uppercase"
              style={{ color: "#FF5722" }}
            >
              2026 Reading Plan · Currently in {currentQ}
            </span>
            <div className="h-px w-12" style={{ background: "rgba(255,87,34,0.5)" }} />
          </div>

          <h1 className="text-5xl lg:text-6xl font-black text-center text-white mb-6 tracking-tight">
            The 2026{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #e8eaf6, #FF5722)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Paper Roadmap
            </span>
          </h1>

          <p
            className="text-center text-lg max-w-2xl mx-auto mb-12"
            style={{ color: "rgba(232,234,246,0.65)" }}
          >
            24 sessions across 4 quarters. From foundational architectures to frontier
            research — here is every paper we are reading this year.
          </p>

          {/* Progress card */}
          <div className="glass-card rounded-2xl p-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-white">Season Progress</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(232,234,246,0.5)" }}>
                  {completedCount} of {totalSessions} sessions completed
                </p>
              </div>
              <div className="text-3xl font-black" style={{ color: "#FF5722" }}>
                {progressPct}%
              </div>
            </div>

            <div
              className="w-full rounded-full h-2.5 overflow-hidden"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${progressPct}%`,
                  background: "linear-gradient(90deg, #1A237E, #FF5722)",
                }}
              />
            </div>

            <div className="flex flex-wrap gap-4 mt-5">
              {(Object.keys(statusConfig) as Status[]).map((s) => (
                <div key={s} className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: statusConfig[s].dot }}
                  />
                  <span className="text-xs" style={{ color: "rgba(232,234,246,0.55)" }}>
                    {statusConfig[s].label}:{" "}
                    <strong className="text-white">
                      {quarters.flatMap((q) => q.items).filter((i) => i.status === s).length}
                    </strong>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ ROADMAP QUARTERS ════════════════════════════════════ */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-6">
          {quarters.map((quarter, qi) => (
            <div key={qi} className="mb-20">
              {/* Quarter header */}
              <div className="flex items-center gap-4 mb-8">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black"
                  style={{
                    background: "linear-gradient(135deg, #1A237E, #FF5722)",
                    color: "white",
                  }}
                >
                  Q{qi + 1}
                </div>
                <h2 className="text-2xl font-black text-white">{quarter.label}</h2>
                <div
                  className="flex-1 h-px"
                  style={{ background: "rgba(255,255,255,0.07)" }}
                />
              </div>

              {/* Session grid */}
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {quarter.items.map((item, ii) => {
                  const isCurrent = item.status === "current";
                  const isCompleted = item.status === "completed";
                  return (
                    <div
                      key={ii}
                      className="stat-card glass-card rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden"
                      style={{
                        border: isCurrent
                          ? "1px solid rgba(255,87,34,0.4)"
                          : "1px solid rgba(255,255,255,0.08)",
                        boxShadow: isCurrent
                          ? "0 0 30px rgba(255,87,34,0.12)"
                          : undefined,
                        opacity: item.status === "planned" ? 0.75 : 1,
                      }}
                    >
                      {/* Current glow */}
                      {isCurrent && (
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background:
                              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,87,34,0.08) 0%, transparent 70%)",
                          }}
                        />
                      )}

                      {/* Top row */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs font-mono font-bold"
                            style={{ color: "rgba(232,234,246,0.35)" }}
                          >
                            {item.session}
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: "rgba(232,234,246,0.4)" }}
                          >
                            ·
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: "rgba(232,234,246,0.5)" }}
                          >
                            {item.date}
                          </span>
                        </div>
                        <StatusBadge status={item.status} />
                      </div>

                      {/* Tag + theme */}
                      <div className="flex flex-wrap gap-2">
                        <TagPill tag={item.tag} />
                        <span
                          className="text-xs px-2.5 py-0.5 rounded-full"
                          style={{
                            background: "rgba(255,255,255,0.05)",
                            color: "rgba(232,234,246,0.45)",
                          }}
                        >
                          {item.theme}
                        </span>
                      </div>

                      {/* Title */}
                      <div className="flex-1">
                        <h3
                          className="text-sm font-bold text-white leading-snug mb-1"
                          style={{ textDecoration: isCompleted ? "none" : "none" }}
                        >
                          {item.title}
                        </h3>
                        <p
                          className="text-xs"
                          style={{ color: "rgba(232,234,246,0.45)" }}
                        >
                          {item.authors}
                        </p>
                      </div>

                      {/* Footer actions */}
                      <div className="flex items-center gap-3 pt-1">
                        {item.arxiv ? (
                          <a
                            href={item.arxiv}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold inline-flex items-center gap-1 transition-colors duration-200"
                            style={{ color: "#FF5722" }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.color = "#FF8A65")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.color = "#FF5722")
                            }
                          >
                            arXiv →
                          </a>
                        ) : (
                          <span
                            className="text-xs"
                            style={{ color: "rgba(232,234,246,0.25)" }}
                          >
                            Link TBD
                          </span>
                        )}
                        {item.notesAvailable && (
                          <>
                            <span
                              className="text-xs"
                              style={{ color: "rgba(232,234,246,0.2)" }}
                            >
                              ·
                            </span>
                            <a
                              href="#"
                              className="text-xs font-semibold"
                              style={{ color: "#42A5F5" }}
                            >
                              Notes &amp; Recording →
                            </a>
                          </>
                        )}
                        {isCurrent && (
                          <a
                            href="#"
                            className="btn-orange ml-auto text-white text-xs font-bold px-3 py-1.5 rounded-lg"
                          >
                            Join Session
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ NOMINATE SECTION ═════════════════════════════════ */}
      <section
        className="py-20"
        style={{ background: "rgba(10,15,46,0.7)", borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="text-4xl mb-6">🗳️</div>
          <h2 className="text-3xl font-black text-white mb-4">
            Nominate a Paper for Q4
          </h2>
          <p
            className="text-base mb-8"
            style={{ color: "rgba(232,234,246,0.6)" }}
          >
            Several Q4 slots are reserved for community picks. Submit your nomination
            — the top-voted papers get scheduled.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="#"
              className="btn-orange text-white font-bold px-8 py-3.5 rounded-full text-sm inline-flex items-center gap-2"
            >
              Nominate a Paper
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <Link
              href="/"
              className="btn-ghost text-white font-bold px-8 py-3.5 rounded-full text-sm"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
