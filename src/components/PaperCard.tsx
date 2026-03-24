import { ExternalLink, GitFork, Play, BookOpen, Code2 } from "lucide-react";
import type { ArchivePaper } from "@/lib/data";

const statusColor: Record<string, { bg: string; text: string; border: string }> = {
  Reproduced: { bg: "rgba(76,175,80,0.12)", text: "#4CAF50", border: "rgba(76,175,80,0.35)" },
  "In Review": { bg: "rgba(66,165,245,0.12)", text: "#42A5F5", border: "rgba(66,165,245,0.35)" },
  Reading: { bg: "rgba(255,87,34,0.12)", text: "#FF5722", border: "rgba(255,87,34,0.4)" },
  Archived: { bg: "rgba(255,255,255,0.06)", text: "rgba(232,234,246,0.5)", border: "rgba(255,255,255,0.1)" },
};

export default function PaperCard({ paper }: { paper: ArchivePaper }) {
  const st = statusColor[paper.status] ?? statusColor.Archived;

  return (
    <div className="stat-card glass-card rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden">
      {/* Subtle glow on reproduced */}
      {paper.status === "Reproduced" && (
        <div
          className="absolute -top-6 -right-6 w-24 h-24 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(76,175,80,0.12) 0%, transparent 70%)" }}
        />
      )}

      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {paper.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="text-xs font-semibold px-2.5 py-0.5 rounded-full paper-tag"
            >
              {t}
            </span>
          ))}
        </div>
        <span
          className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ background: st.bg, color: st.text, border: `1px solid ${st.border}` }}
        >
          {paper.status}
        </span>
      </div>

      {/* Title */}
      <div className="flex-1">
        <p className="text-xs mb-1" style={{ color: "rgba(232,234,246,0.4)" }}>
          {paper.conference} {paper.year} · {paper.presenter}
        </p>
        <h3 className="text-sm font-bold text-white leading-snug">{paper.title}</h3>
      </div>

      {/* TL;DR */}
      <ul className="flex flex-col gap-1.5">
        {paper.tldr.map((point, i) => (
          <li key={i} className="flex gap-2 text-xs" style={{ color: "rgba(232,234,246,0.6)" }}>
            <span style={{ color: "#FF5722", flexShrink: 0 }}>›</span>
            {point}
          </li>
        ))}
      </ul>

      {/* Vibe score */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${paper.vibeScore}%`,
              background: "linear-gradient(90deg, #1A237E, #FF5722)",
            }}
          />
        </div>
        <span className="text-xs font-bold shrink-0" style={{ color: "#FF5722" }}>
          ⚡ {paper.vibeScore}% hackable
        </span>
      </div>

      {/* Links */}
      <div className="flex gap-2 flex-wrap">
        {paper.resources.arxiv && (
          <a
            href={paper.resources.arxiv}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            style={{ background: "rgba(255,87,34,0.1)", color: "#FF5722", border: "1px solid rgba(255,87,34,0.25)" }}
          >
            <BookOpen size={11} /> arXiv
          </a>
        )}
        {paper.resources.vjai_code && (
          <a
            href={paper.resources.vjai_code}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
            style={{ background: "rgba(76,175,80,0.1)", color: "#4CAF50", border: "1px solid rgba(76,175,80,0.25)" }}
          >
            <Code2 size={11} /> VJAI Repo
          </a>
        )}
        {paper.resources.youtube && (
          <a
            href={paper.resources.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(232,234,246,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <Play size={11} /> Recording
          </a>
        )}
        {paper.resources.github && (
          <a
            href={paper.resources.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(232,234,246,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <GitFork size={11} /> Paper Code
          </a>
        )}
      </div>
    </div>
  );
}
