import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  GitBranch,
  Video,
  BookOpen,
  Code2,
  CheckCircle2,
  Clock,
  Zap,
  Tag,
  CalendarDays,
  User,
} from "lucide-react";
import { archive } from "@/lib/data";

/* ── Static params for export ─────────────────────────────── */
export function generateStaticParams() {
  return archive.map((p) => ({ id: p.id }));
}

/* ── Vibe score bar ───────────────────────────────────────── */
function VibeBar({ score }: { score: number }) {
  const color =
    score >= 80 ? "#4CAF50" : score >= 50 ? "#FF9800" : "#EF5350";
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex-1 h-2 rounded-full overflow-hidden"
        style={{ background: "rgba(255,255,255,0.08)" }}
        title="Hackability score: how feasible it is to reproduce or extend this paper in a weekend hackathon (0–100)"
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
      <span className="text-sm font-black w-9 text-right" style={{ color }}>
        {score}
      </span>
    </div>
  );
}

/* ── Status badge ─────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
    Reproduced: { color: "#4CAF50", bg: "rgba(76,175,80,0.1)",  border: "rgba(76,175,80,0.3)",  icon: <CheckCircle2 size={12} /> },
    "In Review":{ color: "#FF9800", bg: "rgba(255,152,0,0.1)", border: "rgba(255,152,0,0.3)",  icon: <Clock size={12} /> },
    Archived:   { color: "#90A4AE", bg: "rgba(144,164,174,0.08)", border: "rgba(144,164,174,0.2)", icon: <Zap size={12} /> },
  };
  const s = styles[status] ?? styles["Archived"];
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full"
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
    >
      {s.icon} {status}
    </span>
  );
}

/* ── Resource link ────────────────────────────────────────── */
function ResourceLink({
  href,
  icon,
  label,
  accent = "#FF5722",
  accentBg = "rgba(255,87,34,0.08)",
  accentBorder = "rgba(255,87,34,0.25)",
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  accent?: string;
  accentBg?: string;
  accentBorder?: string;
}) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
      style={{ color: accent, background: accentBg, border: `1px solid ${accentBorder}` }}
    >
      {icon} {label} <ExternalLink size={11} />
    </a>
  );
}

/* ── Page ─────────────────────────────────────────────────── */
export default function ArchivePaperPage({ params }: { params: { id: string } }) {
  const paper = archive.find((p) => p.id === params.id);
  if (!paper) notFound();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(160deg, #070c26 0%, #0e1550 50%, #070c26 100%)",
        color: "#e8eaf6",
      }}
    >
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(26,35,126,0.5) 0%, transparent 70%)",
          }}
        />

        <div className="relative max-w-4xl mx-auto px-6">
          {/* Breadcrumb */}
          <div
            className="flex items-center gap-2 mb-6 text-xs font-semibold"
            style={{ color: "rgba(232,234,246,0.4)" }}
          >
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/archive" className="hover:text-white transition-colors">
              Archive
            </Link>
            <span>/</span>
            <span style={{ color: "#FF5722" }}>{paper.title.split(":")[0]}</span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {paper.tags.map((t) => (
              <span key={t} className="paper-tag text-xs px-3 py-1 rounded-full font-bold">
                <Tag size={9} className="inline mr-1" />{t}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-3xl lg:text-4xl font-black text-white leading-tight mb-5">
            {paper.title}
          </h1>

          {/* Meta strip */}
          <div className="flex flex-wrap items-center gap-4 text-sm mb-6">
            <StatusBadge status={paper.status} />
            <span
              className="inline-flex items-center gap-1.5 font-semibold px-3 py-1 rounded-full text-xs"
              style={{ background: "rgba(255,87,34,0.08)", color: "#FF9800", border: "1px solid rgba(255,152,0,0.25)" }}
            >
              {paper.conference} {paper.year}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: "rgba(232,234,246,0.5)" }}>
              <User size={11} /> Presented by <strong className="text-white ml-1">{paper.presenter}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: "rgba(232,234,246,0.5)" }}>
              <CalendarDays size={11} />{" "}
              {new Date(paper.date_read).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          {/* Summary */}
          <p className="text-base leading-relaxed max-w-2xl" style={{ color: "rgba(232,234,246,0.7)" }}>
            {paper.summary}
          </p>
        </div>
      </section>

      {/* ── Main content ─────────────────────────────────── */}
      <section className="flex-1 pb-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: TL;DR + back */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* TL;DR */}
              {paper.tldr.length > 0 && (
                <div
                  className="glass-card rounded-2xl p-7"
                  style={{ border: "1px solid rgba(255,87,34,0.2)" }}
                >
                  <p
                    className="text-xs font-bold uppercase tracking-widest mb-5"
                    style={{ color: "#FF5722" }}
                  >
                    TL;DR · Key Takeaways
                  </p>
                  <ul className="flex flex-col gap-4">
                    {paper.tldr.map((point, i) => (
                      <li key={i} className="flex gap-3 items-start">
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5"
                          style={{ background: "rgba(255,87,34,0.15)", color: "#FF5722" }}
                        >
                          {i + 1}
                        </span>
                        <span className="text-sm leading-relaxed" style={{ color: "rgba(232,234,246,0.75)" }}>
                          {point}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Resources */}
              <div
                className="glass-card rounded-2xl p-7"
                style={{ border: "1px solid rgba(255,255,255,0.09)" }}
              >
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-5"
                  style={{ color: "rgba(232,234,246,0.35)" }}
                >
                  Resources
                </p>
                <div className="flex flex-wrap gap-3">
                  <ResourceLink
                    href={paper.resources.arxiv}
                    icon={<BookOpen size={13} />}
                    label="arXiv Paper"
                    accent="#FF5722"
                    accentBg="rgba(255,87,34,0.08)"
                    accentBorder="rgba(255,87,34,0.25)"
                  />
                  <ResourceLink
                    href={paper.resources.github}
                    icon={<GitBranch size={13} />}
                    label="Official Code"
                    accent="#e8eaf6"
                    accentBg="rgba(232,234,246,0.05)"
                    accentBorder="rgba(232,234,246,0.15)"
                  />
                  {paper.resources.vjai_code && (
                    <ResourceLink
                      href={paper.resources.vjai_code}
                      icon={<Code2 size={13} />}
                      label="VJAI Repro"
                      accent="#42A5F5"
                      accentBg="rgba(66,165,245,0.07)"
                      accentBorder="rgba(66,165,245,0.25)"
                    />
                  )}
                  {paper.resources.youtube && (
                    <ResourceLink
                      href={paper.resources.youtube}
                      icon={<Video size={13} />}
                      label="Session Recording"
                      accent="#EF5350"
                      accentBg="rgba(239,83,80,0.07)"
                      accentBorder="rgba(239,83,80,0.25)"
                    />
                  )}
                  {paper.resources.blog && (
                    <ResourceLink
                      href={paper.resources.blog}
                      icon={<BookOpen size={13} />}
                      label="Blog Post"
                      accent="#AB47BC"
                      accentBg="rgba(171,71,188,0.07)"
                      accentBorder="rgba(171,71,188,0.25)"
                    />
                  )}
                </div>
              </div>

              {/* Back link */}
              <Link
                href="/archive"
                className="inline-flex items-center gap-2 text-sm font-semibold self-start"
                style={{ color: "rgba(232,234,246,0.45)" }}
              >
                <ArrowLeft size={14} /> Back to Archive
              </Link>
            </div>

            {/* Right: sidebar */}
            <div className="flex flex-col gap-4">
              {/* Hackability score */}
              <div
                className="glass-card rounded-2xl p-5"
                style={{ border: "1px solid rgba(255,255,255,0.09)" }}
              >
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-4"
                  style={{ color: "rgba(232,234,246,0.35)" }}
                >
                  Hackability Score
                </p>
                <VibeBar score={paper.vibeScore} />
                <p className="text-xs mt-3" style={{ color: "rgba(232,234,246,0.4)" }}>
                  How feasible it is to reproduce or build on this paper in a weekend hackathon.
                </p>
              </div>

              {/* Quick facts */}
              <div
                className="glass-card rounded-2xl p-5"
                style={{ border: "1px solid rgba(255,255,255,0.09)" }}
              >
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-4"
                  style={{ color: "rgba(232,234,246,0.35)" }}
                >
                  Quick Facts
                </p>
                <div className="flex flex-col gap-3 text-xs">
                  {[
                    { label: "Conference", value: `${paper.conference} ${paper.year}` },
                    { label: "Status", value: paper.status },
                    { label: "Presenter", value: paper.presenter },
                    {
                      label: "Date Read",
                      value: new Date(paper.date_read).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }),
                    },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between gap-2">
                      <span style={{ color: "rgba(232,234,246,0.45)" }}>{label}</span>
                      <span className="font-semibold text-white text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Other papers in archive */}
              <div
                className="glass-card rounded-2xl p-5"
                style={{ border: "1px solid rgba(255,255,255,0.09)" }}
              >
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-4"
                  style={{ color: "rgba(232,234,246,0.35)" }}
                >
                  More from Archive
                </p>
                <div className="flex flex-col gap-2">
                  {archive
                    .filter((p) => p.id !== paper.id)
                    .slice(0, 4)
                    .map((p) => (
                      <Link
                        key={p.id}
                        href={`/archive/${p.id}`}
                        className="text-xs leading-snug hover:text-white transition-colors line-clamp-1"
                        style={{ color: "rgba(232,234,246,0.5)" }}
                      >
                        → {p.title}
                      </Link>
                    ))}
                </div>
                <Link
                  href="/archive"
                  className="mt-3 text-xs font-bold inline-flex items-center gap-1"
                  style={{ color: "#FF5722" }}
                >
                  View all <ArrowLeft size={10} className="rotate-180" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
