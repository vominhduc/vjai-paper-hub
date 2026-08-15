"use client";

import { useState } from "react";
import Link from "next/link";
import { Trophy, Star, BookOpen, Layers, Medal, Users, Calendar } from "lucide-react";
import { getLeaderboard, getAttendanceLeaderboard } from "@/lib/data";

const RANK_STYLES: Record<number, { badge: string; border: string; glow: string; icon: React.ReactNode }> = {
  1: {
    badge: "linear-gradient(135deg, #FFD700, #FFA000)",
    border: "rgba(255,215,0,0.4)",
    glow: "0 0 24px rgba(255,215,0,0.15)",
    icon: <Trophy size={18} style={{ color: "#FFD700" }} />,
  },
  2: {
    badge: "linear-gradient(135deg, #C0C0C0, #9E9E9E)",
    border: "rgba(192,192,192,0.35)",
    glow: "0 0 20px rgba(192,192,192,0.10)",
    icon: <Medal size={18} style={{ color: "#C0C0C0" }} />,
  },
  3: {
    badge: "linear-gradient(135deg, #CD7F32, #A0522D)",
    border: "rgba(205,127,50,0.35)",
    glow: "0 0 20px rgba(205,127,50,0.10)",
    icon: <Medal size={18} style={{ color: "#CD7F32" }} />,
  },
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="h-px w-8" style={{ background: "rgba(255,87,34,0.5)" }} />
      <span className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: "#FF5722" }}>
        {children}
      </span>
    </div>
  );
}

function Avatar({ name, color = "#FF8A65", bg = "rgba(255,87,34,0.12)" }: { name: string; color?: string; bg?: string }) {
  return (
    <div className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0"
      style={{ background: bg, color, border: `1px solid ${color}33` }}>
      {name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
    </div>
  );
}

/* ─── Tab: Presenters Leaderboard ─────────────────────────── */
function NominationTab() {
  const board = getLeaderboard();
  return board.length === 0 ? (
    <div className="rounded-2xl p-12 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <p style={{ color: "rgba(232,234,246,0.4)" }}>No nomination data yet.</p>
      <Link href="/cycle" className="text-sm mt-2 inline-block" style={{ color: "#FF5722" }}>Be the first to nominate →</Link>
    </div>
  ) : (
    <>
      {/* Scoring note */}
      <div className="rounded-xl px-5 py-3.5 mb-8 text-sm flex flex-wrap gap-x-6 gap-y-1"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(232,234,246,0.5)" }}>
        <span> +1 pt per paper nominated</span>
        <span>🏆 +3 pts when your nominated paper is selected for deep dive</span>
      </div>

      <SectionLabel>Top Presenters</SectionLabel>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {board.slice(0, 3).map((entry, idx) => {
          const rank = idx + 1;
          const style = RANK_STYLES[rank];
          return (
            <div key={entry.name} className="rounded-2xl p-6 flex flex-col items-center text-center gap-3"
              style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${style.border}`, boxShadow: style.glow }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-base text-black" style={{ background: style.badge }}>{rank}</div>
              <Avatar name={entry.name} />
              <div>
                <div className="font-semibold text-white text-base">{entry.name}</div>
                <div className="text-xs mt-0.5" style={{ color: "rgba(232,234,246,0.45)" }}>{entry.cyclesParticipated} cycle{entry.cyclesParticipated !== 1 ? "s" : ""}</div>
              </div>
              <div className="text-2xl font-bold" style={{ color: "#FF5722" }}>{entry.score} pts</div>
              <div className="flex gap-4 text-xs" style={{ color: "rgba(232,234,246,0.5)" }}>
                <span className="flex items-center gap-1"><BookOpen size={12} /> {entry.nominations} papers</span>
                {entry.wins > 0 && <span className="flex items-center gap-1" style={{ color: "#FFD700" }}><Star size={12} /> {entry.wins}✓</span>}
              </div>
            </div>
          );
        })}
      </div>
      {board.length > 3 && (
        <>
          <SectionLabel>Full Rankings</SectionLabel>
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
            {board.map((entry, idx) => {
              const rank = idx + 1;
              const topStyle = RANK_STYLES[rank];
              return (
                <div key={entry.name} className="flex items-center gap-4 px-6 py-4"
                  style={{ background: idx % 2 === 0 ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.035)", borderBottom: idx < board.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                    style={topStyle ? { background: topStyle.badge, color: "#000" } : { background: "rgba(255,255,255,0.07)", color: "rgba(232,234,246,0.5)" }}>
                    {topStyle ? topStyle.icon : rank}
                  </div>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
                    style={{ background: "rgba(255,87,34,0.1)", color: "#FF8A65" }}>
                    {entry.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white text-sm">{entry.name}</div>
                    {entry.topNominations[0] && (
                      <div className="text-xs truncate mt-0.5" style={{ color: "rgba(232,234,246,0.4)" }}>
                        Top: {entry.topNominations[0].title}
                        {entry.topNominations[0].isSelected && <span className="ml-1" style={{ color: "#FFD700" }}>★</span>}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-5 text-xs flex-shrink-0">
                    <span className="flex flex-col items-center" style={{ color: "rgba(232,234,246,0.5)" }}>
                      <span className="flex items-center gap-1"><Layers size={11} /> {entry.nominations}</span>
                      <span className="text-[10px] mt-0.5">papers</span>
                    </span>
                    {entry.wins > 0 && (
                      <span className="flex flex-col items-center" style={{ color: "#FFD700" }}>
                        <span className="flex items-center gap-1"><Star size={11} /> {entry.wins}</span>
                        <span className="text-[10px] mt-0.5">wins</span>
                      </span>
                    )}
                    <span className="font-bold text-sm w-16 text-right" style={{ color: "#FF5722" }}>{entry.score} pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
      <div className="mt-10 text-center">
        <p className="text-sm mb-3" style={{ color: "rgba(232,234,246,0.4)" }}>Want to climb the leaderboard?</p>
        <Link href="/cycle" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-80"
          style={{ background: "linear-gradient(135deg, #FF5722, #FF8A65)" }}>
          Nominate a paper →
        </Link>
      </div>
    </>
  );
}

/* ─── Tab: Attendance Leaderboard ─────────────────────────── */
function AttendanceTab() {
  const board = getAttendanceLeaderboard();
  return board.length === 0 ? (
    <div className="rounded-2xl p-12 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <p style={{ color: "rgba(232,234,246,0.4)" }}>No attendance data yet.</p>
    </div>
  ) : (
    <>
      <SectionLabel>Most Sessions Attended</SectionLabel>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {board.slice(0, 3).map((entry, idx) => {
          const rank = idx + 1;
          const style = RANK_STYLES[rank];
          return (
            <div key={entry.name} className="rounded-2xl p-6 flex flex-col items-center text-center gap-3"
              style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${style.border}`, boxShadow: style.glow }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-base text-black" style={{ background: style.badge }}>{rank}</div>
              <Avatar name={entry.name} color="#42A5F5" bg="rgba(66,165,245,0.12)" />
              <div className="font-semibold text-white text-base">{entry.name}</div>
              <div className="text-2xl font-bold" style={{ color: "#42A5F5" }}>
                {entry.sessionsAttended}
                <span className="text-sm font-normal ml-1" style={{ color: "rgba(232,234,246,0.45)" }}>sessions</span>
              </div>
              <div className="flex flex-wrap justify-center gap-1.5">
                {entry.sessionIds.map((id) => (
                  <span key={id} className="text-[10px] px-2 py-0.5 rounded-full font-mono"
                    style={{ background: "rgba(66,165,245,0.1)", color: "#42A5F5", border: "1px solid rgba(66,165,245,0.2)" }}>{id}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {board.length > 3 && (
        <>
          <SectionLabel>All Members</SectionLabel>
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
            {board.map((entry, idx) => {
              const rank = idx + 1;
              const topStyle = RANK_STYLES[rank];
              const maxSessions = board[0].sessionsAttended;
              return (
                <div key={entry.name} className="flex items-center gap-4 px-6 py-4"
                  style={{ background: idx % 2 === 0 ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.035)", borderBottom: idx < board.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                    style={topStyle ? { background: topStyle.badge, color: "#000" } : { background: "rgba(255,255,255,0.07)", color: "rgba(232,234,246,0.5)" }}>
                    {topStyle ? topStyle.icon : rank}
                  </div>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
                    style={{ background: "rgba(66,165,245,0.1)", color: "#42A5F5" }}>
                    {entry.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white text-sm">{entry.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)", width: 100 }}>
                        <div className="h-full rounded-full" style={{ width: `${(entry.sessionsAttended / maxSessions) * 100}%`, background: "linear-gradient(90deg, #1A237E, #42A5F5)" }} />
                      </div>
                      <span className="text-xs" style={{ color: "rgba(232,234,246,0.4)" }}>
                        Last: <span className="text-white">{entry.lastSeen}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Calendar size={12} style={{ color: "#42A5F5" }} />
                    <span className="font-bold text-sm" style={{ color: "#42A5F5" }}>{entry.sessionsAttended}</span>
                    <span className="text-xs" style={{ color: "rgba(232,234,246,0.4)" }}>sessions</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
      <div className="mt-10 text-center">
        <p className="text-sm mb-3" style={{ color: "rgba(232,234,246,0.4)" }}>Coming to the next session?</p>
        <Link href="/cycle" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-80"
          style={{ background: "linear-gradient(135deg, #42A5F5, #1565C0)" }}>
          View upcoming session →
        </Link>
      </div>
    </>
  );
}

/* ─── Page ─────────────────────────────────────────────────── */
export default function LeaderboardPage() {
  const [tab, setTab] = useState<"nominations" | "attendance">("nominations");

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #070c26 0%, #0e1550 50%, #070c26 100%)", color: "#e8eaf6" }}>
      <div className="max-w-4xl mx-auto px-6 pt-28 pb-24">
        <div className="mb-10 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #FF5722, #FF8A65)" }}>
              <Trophy size={28} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Leaderboard</h1>
          <p style={{ color: "rgba(232,234,246,0.55)" }} className="text-base max-w-xl mx-auto">
            Community rankings across paper nominations and session attendance.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-10 p-1 rounded-2xl w-fit mx-auto" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <button onClick={() => setTab("nominations")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={tab === "nominations"
              ? { background: "rgba(255,87,34,0.2)", color: "#FF5722", border: "1px solid rgba(255,87,34,0.4)" }
              : { color: "rgba(232,234,246,0.5)", border: "1px solid transparent" }}>
            <BookOpen size={14} /> Presenters
          </button>
          <button onClick={() => setTab("attendance")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={tab === "attendance"
              ? { background: "rgba(66,165,245,0.15)", color: "#42A5F5", border: "1px solid rgba(66,165,245,0.4)" }
              : { color: "rgba(232,234,246,0.5)", border: "1px solid transparent" }}>
            <Users size={14} /> Attendance
          </button>
        </div>

        {tab === "nominations" ? <NominationTab /> : <AttendanceTab />}
      </div>
    </div>
  );
}
