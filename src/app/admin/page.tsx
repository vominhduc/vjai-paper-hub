"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  ChevronRight,
  Settings,
  ExternalLink,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  FlameKindling,
  Zap,
} from "lucide-react";
import { cycles, getCyclePhase, cycleLabel } from "@/lib/data";
import type { CyclePhase } from "@/lib/data";

const REPO = "vominhduc/vjai-paper-hub";

/* ─── Phase chip ──────────────────────────────────────────── */
const PHASE_STYLE: Record<CyclePhase | "planned", { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  nominating: { label: "Nominating",   color: "#42A5F5", bg: "rgba(66,165,245,0.1)",  border: "rgba(66,165,245,0.25)", icon: <Clock size={11} /> },
  voting:     { label: "Voting",       color: "#FF9800", bg: "rgba(255,152,0,0.1)",   border: "rgba(255,152,0,0.3)",   icon: <FlameKindling size={11} /> },
  "deep-dive":{ label: "Deep Dive",    color: "#FF5722", bg: "rgba(255,87,34,0.1)",   border: "rgba(255,87,34,0.3)",   icon: <Zap size={11} /> },
  archived:   { label: "Archived",     color: "#4CAF50", bg: "rgba(76,175,80,0.1)",   border: "rgba(76,175,80,0.25)", icon: <CheckCircle2 size={11} /> },
  planned:    { label: "Planned",      color: "#90A4AE", bg: "rgba(144,164,174,0.08)",border: "rgba(144,164,174,0.2)", icon: <Calendar size={11} /> },
};

/* ─── Input field ─────────────────────────────────────────── */
function Field({
  label,
  hint,
  value,
  onChange,
  type = "date",
  required = true,
  placeholder,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-white flex items-center gap-1">
        {label}
        {required && <span style={{ color: "#FF5722" }}>*</span>}
      </label>
      {hint && <p className="text-xs" style={{ color: "rgba(232,234,246,0.4)" }}>{hint}</p>}
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl px-4 py-2.5 text-sm font-medium outline-none transition-all"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "#e8eaf6",
          colorScheme: "dark",
        }}
        onFocus={(e) => (e.currentTarget.style.border = "1px solid rgba(255,87,34,0.5)")}
        onBlur={(e) => (e.currentTarget.style.border = "1px solid rgba(255,255,255,0.12)")}
      />
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────── */
export default function AdminPage() {
  const [selectedCycleId, setSelectedCycleId] = useState<string>("");
  const [nominationEnd, setNominationEnd]     = useState("");
  const [explorationStart, setExplorationStart] = useState("");
  const [sessionDate, setSessionDate]         = useState("");
  const [presenter, setPresenter]             = useState("");
  const [presenterRole, setPresenterRole]     = useState("");
  const [notes, setNotes]                     = useState("");
  const [error, setError]                     = useState("");

  const selectedCycle = cycles.find((c) => c.id === selectedCycleId);

  function handleCycleSelect(id: string) {
    setSelectedCycleId(id);
    setError("");
    const c = cycles.find((cyc) => cyc.id === id);
    if (c) {
      setNominationEnd(c.nomination_end ?? "");
      setExplorationStart(c.exploration_start ?? "");
      setSessionDate(c.session_date ?? "");
      setPresenter(c.session.presenter ?? "");
      setPresenterRole(c.session.presenter_role ?? "");
      setNotes("");
    }
  }

  function validate(): boolean {
    if (!selectedCycleId) { setError("Please select a cycle."); return false; }
    if (!nominationEnd)   { setError("Nomination deadline is required."); return false; }
    if (!explorationStart){ setError("Exploration date is required."); return false; }
    if (!sessionDate)     { setError("Deep Dive date is required."); return false; }
    if (nominationEnd >= explorationStart) {
      setError("Nomination deadline must be before the Exploration date."); return false;
    }
    if (explorationStart >= sessionDate) {
      setError("Exploration date must be before the Deep Dive date."); return false;
    }
    setError("");
    return true;
  }

  function buildIssueUrl(): string {
    if (!validate()) return "";

    const title = `Set Dates: ${selectedCycleId}`;
    const body = [
      `### Cycle ID`,
      selectedCycleId,
      ``,
      `### Nomination Deadline (YYYY-MM-DD)`,
      nominationEnd,
      ``,
      `### Exploration Session Date (YYYY-MM-DD)`,
      explorationStart,
      ``,
      `### Deep Dive Session Date (YYYY-MM-DD)`,
      sessionDate,
      ``,
      `### Presenter (optional — leave blank to keep existing)`,
      presenter || "_No response_",
      ``,
      `### Presenter Role (optional)`,
      presenterRole || "_No response_",
      ``,
      `### Notes (optional)`,
      notes || "_No response_",
    ].join("\n");

    const params = new URLSearchParams({
      template: "05-set-cycle-dates.yml",
      title,
      labels: "set-dates,admin",
      body,
    });
    return `https://github.com/${REPO}/issues/new?${params.toString()}`;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const url = buildIssueUrl();
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(160deg, #070c26 0%, #0e1550 50%, #070c26 100%)",
        color: "#e8eaf6",
      }}
    >
      {/* ── Header ── */}
      <section className="relative pt-28 pb-12 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(26,35,126,0.5) 0%, transparent 70%)" }}
        />
        <div className="relative max-w-5xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-4 text-xs font-semibold" style={{ color: "rgba(232,234,246,0.4)" }}>
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={12} />
            <span style={{ color: "#FF5722" }}>Admin</span>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <Settings size={20} style={{ color: "#FF5722" }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#FF5722" }}>
              Admin Panel
            </span>
          </div>
          <h1 className="text-4xl font-black text-white mb-3">
            Set Cycle <span className="gradient-text">Dates</span>
          </h1>
          <p className="text-base max-w-xl" style={{ color: "rgba(232,234,246,0.6)" }}>
            Configure the Exploration and Deep Dive dates for any cycle. Submitting opens a GitHub issue — the bot updates the site automatically.
          </p>

          {/* How it works strip */}
          <div className="flex flex-wrap gap-4 mt-8">
            {[
              { n: "1", text: "Fill in the form" },
              { n: "2", text: "Opens a pre-filled GitHub issue" },
              { n: "3", text: "Bot updates cycles.json & redeploys" },
            ].map((s) => (
              <div key={s.n} className="flex items-center gap-2 text-sm" style={{ color: "rgba(232,234,246,0.55)" }}>
                <span
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                  style={{ background: "rgba(255,87,34,0.15)", color: "#FF5722" }}
                >
                  {s.n}
                </span>
                {s.text}
                {s.n !== "3" && <ChevronRight size={13} style={{ color: "rgba(255,87,34,0.4)" }} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main content ── */}
      <div className="max-w-5xl mx-auto px-6 pb-32 w-full grid lg:grid-cols-5 gap-8">

        {/* ── Left: Cycle picker ── */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "rgba(232,234,246,0.35)" }}>
            Select a Cycle
          </p>
          {cycles.map((c) => {
            const rawPhase = getCyclePhase(c);
            const phaseKey: keyof typeof PHASE_STYLE =
              c.status !== "active" ? "planned" : rawPhase;
            const style = PHASE_STYLE[phaseKey];
            const isSelected = selectedCycleId === c.id;

            return (
              <button
                key={c.id}
                onClick={() => handleCycleSelect(c.id)}
                className="w-full text-left rounded-2xl p-4 transition-all"
                style={{
                  background: isSelected ? "rgba(255,87,34,0.08)" : "rgba(255,255,255,0.03)",
                  border: isSelected ? "1px solid rgba(255,87,34,0.4)" : "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-sm font-bold text-white">{cycleLabel(c)}</span>
                  <span
                    className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
                    style={{ color: style.color, background: style.bg, border: `1px solid ${style.border}` }}
                  >
                    {style.icon} {style.label}
                  </span>
                </div>
                <p className="text-xs" style={{ color: "rgba(232,234,246,0.4)" }}>{c.theme}</p>
                {c.session_date && (
                  <p className="text-xs mt-1" style={{ color: "rgba(232,234,246,0.3)" }}>
                    Deep Dive: {new Date(c.session_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Right: Form ── */}
        <div className="lg:col-span-3">
          {!selectedCycleId ? (
            <div
              className="rounded-2xl p-10 text-center h-full flex flex-col items-center justify-center gap-3"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)" }}
            >
              <Calendar size={32} style={{ color: "rgba(232,234,246,0.2)" }} />
              <p className="text-sm" style={{ color: "rgba(232,234,246,0.35)" }}>
                Select a cycle on the left to edit its dates.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Cycle info header */}
              <div
                className="rounded-2xl p-5"
                style={{ background: "rgba(255,87,34,0.06)", border: "1px solid rgba(255,87,34,0.2)" }}
              >
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#FF5722" }}>
                  Editing
                </p>
                <p className="text-base font-black text-white">
                  {selectedCycle ? cycleLabel(selectedCycle) : selectedCycleId}
                </p>
                {selectedCycle && (
                  <p className="text-xs mt-0.5" style={{ color: "rgba(232,234,246,0.5)" }}>
                    {selectedCycle.theme}
                  </p>
                )}
              </div>

              {/* Date fields */}
              <div
                className="rounded-2xl p-6 flex flex-col gap-5"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(232,234,246,0.35)" }}>
                  Dates
                </p>

                <Field
                  label="Nomination Deadline"
                  hint="Last day members can submit nominations (inclusive)."
                  value={nominationEnd}
                  onChange={setNominationEnd}
                />
                <Field
                  label="Exploration Session Date"
                  hint="Date of the Exploration session — voting opens immediately after."
                  value={explorationStart}
                  onChange={setExplorationStart}
                />
                <Field
                  label="Deep Dive Session Date"
                  hint="Date of the full 90-min Deep Dive for the winning paper."
                  value={sessionDate}
                  onChange={setSessionDate}
                />

                {/* Visual timeline */}
                {nominationEnd && explorationStart && sessionDate && (
                  <div
                    className="rounded-xl p-4 flex flex-col gap-2 text-xs"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <p className="font-bold text-white mb-1">Timeline preview</p>
                    {[
                      { dot: "#42A5F5", label: "Nominations close", date: nominationEnd },
                      { dot: "#FF9800", label: "Exploration session + voting opens", date: explorationStart },
                      { dot: "#AB47BC", label: "Voting closes", date: (() => {
                        const d = new Date(explorationStart);
                        d.setDate(d.getDate() + 3);
                        return d.toISOString().split("T")[0];
                      })() },
                      { dot: "#FF5722", label: "Deep Dive session", date: sessionDate },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.dot }} />
                        <span style={{ color: "rgba(232,234,246,0.55)" }}>{item.label}</span>
                        <span className="ml-auto font-bold" style={{ color: "#e8eaf6" }}>{item.date}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Presenter fields */}
              <div
                className="rounded-2xl p-6 flex flex-col gap-5"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(232,234,246,0.35)" }}>
                  Presenter (optional)
                </p>
                <Field
                  label="Presenter Name"
                  hint="Leave blank to keep the existing value."
                  value={presenter}
                  onChange={setPresenter}
                  type="text"
                  required={false}
                  placeholder="e.g. Duc Vo"
                />
                <Field
                  label="Presenter Role"
                  value={presenterRole}
                  onChange={setPresenterRole}
                  type="text"
                  required={false}
                  placeholder="e.g. ML Engineer · VJAI Core"
                />
              </div>

              {/* Notes */}
              <div
                className="rounded-2xl p-6 flex flex-col gap-3"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(232,234,246,0.35)" }}>
                  Notes (optional)
                </p>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="e.g. Rescheduled due to public holiday."
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none resize-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#e8eaf6",
                  }}
                  onFocus={(e) => (e.currentTarget.style.border = "1px solid rgba(255,87,34,0.5)")}
                  onBlur={(e) => (e.currentTarget.style.border = "1px solid rgba(255,255,255,0.12)")}
                />
              </div>

              {/* Error */}
              {error && (
                <div
                  className="rounded-xl p-4 flex items-center gap-3 text-sm"
                  style={{ background: "rgba(244,67,54,0.08)", border: "1px solid rgba(244,67,54,0.25)", color: "#EF9A9A" }}
                >
                  <AlertCircle size={15} className="shrink-0" />
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="w-full btn-orange text-white font-bold py-4 rounded-2xl text-sm flex items-center justify-center gap-2"
              >
                Open GitHub Issue to Apply Dates
                <ExternalLink size={14} />
              </button>

              <p className="text-xs text-center" style={{ color: "rgba(232,234,246,0.35)" }}>
                This opens a pre-filled GitHub issue. Once submitted, the bot commits the changes and redeploys the site within ~2 minutes.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
