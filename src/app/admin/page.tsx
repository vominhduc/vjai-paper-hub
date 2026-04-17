"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  ChevronRight,
  Settings,
  ExternalLink,
  AlertCircle,
  Clock,
  FlameKindling,
  Zap,
  CheckCircle2,
  Edit3,
  Trash2,
  RefreshCw,
  Search,
  Database,
  LayoutGrid,
  ArrowRight,
  Info,
  Trophy,
  ListOrdered,
  PlayCircle,
  Users,
} from "lucide-react";
import { cycles, getCyclePhase, cycleLabel } from "@/lib/data";
import type { CyclePhase } from "@/lib/data";

const REPO = "vominhduc/vjai-paper-hub";

/* ─── Phase/status chip styles ───────────────────────────── */
type PhaseKey = CyclePhase | "planned";
const PHASE_STYLE: Record<PhaseKey, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  nominating: { label: "Nominating",  color: "#42A5F5", bg: "rgba(66,165,245,0.1)",  border: "rgba(66,165,245,0.25)", icon: <Clock size={11} /> },
  voting:     { label: "Voting",      color: "#FF9800", bg: "rgba(255,152,0,0.1)",   border: "rgba(255,152,0,0.3)",   icon: <FlameKindling size={11} /> },
  "deep-dive":{ label: "Deep Dive",   color: "#FF5722", bg: "rgba(255,87,34,0.1)",   border: "rgba(255,87,34,0.3)",   icon: <Zap size={11} /> },
  archived:   { label: "Archived",    color: "#4CAF50", bg: "rgba(76,175,80,0.1)",   border: "rgba(76,175,80,0.25)", icon: <CheckCircle2 size={11} /> },
  planned:    { label: "Planned",     color: "#90A4AE", bg: "rgba(144,164,174,0.08)",border: "rgba(144,164,174,0.2)", icon: <Calendar size={11} /> },
};

function getPhaseKey(c: (typeof cycles)[0]): PhaseKey {
  if (!c.status || c.status === "planned") return "planned";
  if (c.status === "archived") return "archived";
  return getCyclePhase(c);
}

/* ─── Reusable text input ────────────────────────────────── */
function Field({
  label, hint, value, onChange, type = "date", required = true, placeholder,
}: {
  label: string; hint?: string; value: string; onChange: (v: string) => void;
  type?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-white flex items-center gap-1">
        {label}{required && <span style={{ color: "#FF5722" }}>*</span>}
      </label>
      {hint && <p className="text-xs" style={{ color: "rgba(232,234,246,0.4)" }}>{hint}</p>}
      <input
        type={type} value={value} required={required} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl px-4 py-2.5 text-sm font-medium outline-none transition-all"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "#e8eaf6", colorScheme: "dark" }}
        onFocus={(e) => (e.currentTarget.style.border = "1px solid rgba(255,87,34,0.5)")}
        onBlur={(e)  => (e.currentTarget.style.border = "1px solid rgba(255,255,255,0.12)")}
      />
    </div>
  );
}

/* ─── Error banner ───────────────────────────────────────── */
function ErrorBanner({ msg }: { msg: string }) {
  return (
    <div className="rounded-xl p-4 flex items-center gap-3 text-sm"
      style={{ background: "rgba(244,67,54,0.08)", border: "1px solid rgba(244,67,54,0.25)", color: "#EF9A9A" }}>
      <AlertCircle size={15} className="shrink-0" />{msg}
    </div>
  );
}

/* ─── Submit button ──────────────────────────────────────── */
function SubmitBtn({ children }: { children: React.ReactNode }) {
  return (
    <button type="submit"
      className="w-full btn-orange text-white font-bold py-4 rounded-2xl text-sm flex items-center justify-center gap-2">
      {children}<ExternalLink size={14} />
    </button>
  );
}

/* ─── Phase chip ─────────────────────────────────────────── */
function PhaseBadge({ phaseKey }: { phaseKey: PhaseKey }) {
  const s = PHASE_STYLE[phaseKey];
  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>
      {s.icon}{s.label}
    </span>
  );
}

/* ════════════════════════════════════════════════════════════
   TAB 1 — SET DATES
════════════════════════════════════════════════════════════ */
function TabSetDates() {
  const [selectedId, setSelectedId] = useState("");
  const [nominationEnd, setNominationEnd]       = useState("");
  const [explorationStart, setExplorationStart] = useState("");
  const [sessionDate, setSessionDate]           = useState("");
  const [presenter, setPresenter]               = useState("");
  const [presenterRole, setPresenterRole]       = useState("");
  const [location, setLocation]                 = useState("");
  const [notes, setNotes]                       = useState("");
  const [error, setError]                       = useState("");

  const selected = cycles.find((c) => c.id === selectedId);

  function pick(id: string) {
    setSelectedId(id); setError("");
    const c = cycles.find((x) => x.id === id);
    if (c) {
      setNominationEnd(c.nomination_end ?? "");
      setExplorationStart(c.exploration_start ?? "");
      setSessionDate(c.session_date ?? "");
      setPresenter(c.session.presenter ?? "");
      setPresenterRole(c.session.presenter_role ?? "");
      setLocation(c.session.location ?? "");
      setNotes("");
    }
  }

  function validate() {
    if (!selectedId)       { setError("Please select a cycle."); return false; }
    if (!nominationEnd)    { setError("Nomination deadline is required."); return false; }
    if (!explorationStart) { setError("Exploration date is required."); return false; }
    if (!sessionDate)      { setError("Deep Dive date is required."); return false; }
    if (nominationEnd >= explorationStart) { setError("Nomination deadline must be before Exploration date."); return false; }
    if (explorationStart >= sessionDate)   { setError("Exploration date must be before Deep Dive date."); return false; }
    setError(""); return true;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const title = `Set Dates: ${selectedId}`;
    const body = [
      `### Cycle ID`, selectedId, ``,
      `### Nomination Deadline (YYYY-MM-DD)`, nominationEnd, ``,
      `### Exploration Session Date (YYYY-MM-DD)`, explorationStart, ``,
      `### Deep Dive Session Date (YYYY-MM-DD)`, sessionDate, ``,
      `### Presenter (optional — leave blank to keep existing)`, presenter || "_No response_", ``,
      `### Presenter Role (optional)`, presenterRole || "_No response_", ``,
      `### Location (optional)`, location || "_No response_", ``,
      `### Notes (optional)`, notes || "_No response_",
    ].join("\n");
    const params = new URLSearchParams({ template: "05-set-cycle-dates.yml", title, labels: "set-dates,admin", body });
    window.open(`https://github.com/${REPO}/issues/new?${params}`, "_blank", "noopener");
  }

  return (
    <div className="grid lg:grid-cols-5 gap-8">
      <div className="lg:col-span-2 flex flex-col gap-3">
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "rgba(232,234,246,0.35)" }}>Select a Cycle</p>
        {cycles.map((c) => {
          const pk = getPhaseKey(c);
          const isSelected = selectedId === c.id;
          return (
            <button key={c.id} onClick={() => pick(c.id)}
              className="w-full text-left rounded-2xl p-4 transition-all"
              style={{ background: isSelected ? "rgba(255,87,34,0.08)" : "rgba(255,255,255,0.03)", border: isSelected ? "1px solid rgba(255,87,34,0.4)" : "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-sm font-bold text-white">{cycleLabel(c)}</span>
                <PhaseBadge phaseKey={pk} />
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

      <div className="lg:col-span-3">
        {!selectedId ? (
          <div className="rounded-2xl p-10 text-center h-full flex flex-col items-center justify-center gap-3"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)" }}>
            <Calendar size={32} style={{ color: "rgba(232,234,246,0.2)" }} />
            <p className="text-sm" style={{ color: "rgba(232,234,246,0.35)" }}>Select a cycle on the left to edit its dates.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="rounded-2xl p-5" style={{ background: "rgba(255,87,34,0.06)", border: "1px solid rgba(255,87,34,0.2)" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#FF5722" }}>Editing</p>
              <p className="text-base font-black text-white">{selected ? cycleLabel(selected) : selectedId}</p>
              {selected && <p className="text-xs mt-0.5" style={{ color: "rgba(232,234,246,0.5)" }}>{selected.theme}</p>}
            </div>

            <div className="rounded-2xl p-6 flex flex-col gap-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(232,234,246,0.35)" }}>Dates</p>
              <Field label="Nomination Deadline" hint="Last day members can submit nominations (inclusive)." value={nominationEnd} onChange={setNominationEnd} />
              <Field label="Exploration Session Date" hint="Date of the Exploration session — voting opens immediately after." value={explorationStart} onChange={setExplorationStart} />
              <Field label="Deep Dive Session Date" hint="Date of the full 90-min Deep Dive for the winning paper." value={sessionDate} onChange={setSessionDate} />
              {nominationEnd && explorationStart && sessionDate && (
                <div className="rounded-xl p-4 flex flex-col gap-2 text-xs" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <p className="font-bold text-white mb-1">Timeline preview</p>
                  {[
                    { dot: "#42A5F5", label: "Nominations close", date: nominationEnd },
                    { dot: "#FF9800", label: "Exploration session + voting opens", date: explorationStart },
                    { dot: "#AB47BC", label: "Voting closes", date: (() => { const d = new Date(explorationStart); d.setDate(d.getDate() + 3); return d.toISOString().split("T")[0]; })() },
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

            <div className="rounded-2xl p-6 flex flex-col gap-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(232,234,246,0.35)" }}>Presenter (optional)</p>
              <Field label="Presenter Name" hint="Leave blank to keep existing." value={presenter} onChange={setPresenter} type="text" required={false} placeholder="e.g. Duc Vo" />
              <Field label="Presenter Role" value={presenterRole} onChange={setPresenterRole} type="text" required={false} placeholder="e.g. ML Engineer · VJAI Core" />
              <Field label="Location" hint="e.g. Google Meet, Zoom, HCMC Office" value={location} onChange={setLocation} type="text" required={false} placeholder="e.g. Google Meet" />
            </div>

            <div className="rounded-2xl p-6 flex flex-col gap-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(232,234,246,0.35)" }}>Notes (optional)</p>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="e.g. Rescheduled due to public holiday."
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none resize-none transition-all"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "#e8eaf6" }}
                onFocus={(e) => (e.currentTarget.style.border = "1px solid rgba(255,87,34,0.5)")}
                onBlur={(e)  => (e.currentTarget.style.border = "1px solid rgba(255,255,255,0.12)")} />
            </div>

            {error && <ErrorBanner msg={error} />}
            <SubmitBtn>Open GitHub Issue to Apply Dates</SubmitBtn>
            <p className="text-xs text-center" style={{ color: "rgba(232,234,246,0.35)" }}>
              Opens a pre-filled GitHub issue. Bot commits &amp; redeploys in ~2 min.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   TAB 2 — MANAGE CYCLES
════════════════════════════════════════════════════════════ */
type ManageAction = "status" | "edit" | "delete" | "select" | "agenda" | null;

function TabManageCycles() {
  const [selectedId, setSelectedId] = useState("");
  const [action, setAction]         = useState<ManageAction>(null);
  const [newStatus, setNewStatus]   = useState("planned");
  const [newTheme, setNewTheme]     = useState("");
  const [newMonth, setNewMonth]     = useState("");
  const [newYear, setNewYear]       = useState("");
  const [selectNomId, setSelectNomId] = useState("");
  const [agendaText, setAgendaText]   = useState("");
  const [notes, setNotes]           = useState("");
  const [error, setError]           = useState("");

  const selected = cycles.find((c) => c.id === selectedId);

  function pick(id: string) {
    setSelectedId(id); setAction(null); setError("");
    const c = cycles.find((x) => x.id === id);
    if (c) {
      setNewStatus(c.status || "planned");
      setNewTheme(c.theme || "");
      setNewMonth(c.month || "");
      setNewYear(c.year ? String(c.year) : "");
      setSelectNomId("");
      setAgendaText((c.session?.agenda ?? []).join("\n"));
      setNotes("");
    }
  }

  function buildIssueUrl() {
    if (!selectedId || !action) { setError("No cycle or action selected."); return ""; }

    const actionLabel =
      action === "status" ? "status — change the cycle status" :
      action === "edit"   ? "edit — update theme / month / year" :
      action === "select" ? "select — mark the winning nomination" :
      action === "agenda" ? "agenda — set the session agenda items" :
                            "delete — remove a planned cycle with no nominations";
    const statusLabel = action === "status" ? newStatus : "no change";

    const title = `Manage Cycle [${action}]: ${selectedId}`;
    const body = [
      `### Cycle ID`, selectedId, ``,
      `### Action`, actionLabel, ``,
      `### New Status (for status action)`, statusLabel, ``,
      `### New Theme (for edit action)`, action === "edit" && newTheme ? newTheme : "_No response_", ``,
      `### New Month (for edit action)`, action === "edit" && newMonth ? newMonth : "_No response_", ``,
      `### New Year (for edit action)`, action === "edit" && newYear ? newYear : "_No response_", ``,
      `### Nomination ID (for select action)`, action === "select" && selectNomId ? selectNomId : "_No response_", ``,
      `### Agenda Items (for agenda action, one per line)`, action === "agenda" && agendaText ? agendaText : "_No response_", ``,
      `### Notes (optional)`, notes || "_No response_",
    ].join("\n");

    const params = new URLSearchParams({ template: "06-manage-cycle.yml", title, labels: "manage-cycle,admin", body });
    return `https://github.com/${REPO}/issues/new?${params}`;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (action === "delete" && selected?.status !== "planned") {
      setError("Only planned cycles can be deleted."); return;
    }
    if (action === "select" && !selectNomId.trim()) {
      setError("Please enter a nomination ID."); return;
    }
    if (action === "agenda" && !agendaText.trim()) {
      setError("Please enter at least one agenda item."); return;
    }
    const url = buildIssueUrl();
    if (url) window.open(url, "_blank", "noopener");
  }

  const deleteBlocked = action === "delete" && (selected?.status !== "planned" || (selected?.nominations?.length ?? 0) > 0);

  return (
    <div className="grid lg:grid-cols-5 gap-8">
      <div className="lg:col-span-2 flex flex-col gap-3">
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "rgba(232,234,246,0.35)" }}>All Cycles</p>
        {cycles.map((c) => {
          const pk = getPhaseKey(c);
          const isSelected = selectedId === c.id;
          return (
            <button key={c.id} onClick={() => pick(c.id)}
              className="w-full text-left rounded-2xl p-4 transition-all"
              style={{ background: isSelected ? "rgba(66,165,245,0.07)" : "rgba(255,255,255,0.03)", border: isSelected ? "1px solid rgba(66,165,245,0.4)" : "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-sm font-bold text-white">{cycleLabel(c)}</span>
                <PhaseBadge phaseKey={pk} />
              </div>
              <p className="text-xs" style={{ color: "rgba(232,234,246,0.4)" }}>{c.theme}</p>
              <p className="text-xs mt-1" style={{ color: "rgba(232,234,246,0.25)" }}>
                {c.nominations?.length ?? 0} nomination{(c.nominations?.length ?? 0) !== 1 ? "s" : ""}
              </p>
            </button>
          );
        })}
      </div>

      <div className="lg:col-span-3">
        {!selectedId ? (
          <div className="rounded-2xl p-10 text-center h-full flex flex-col items-center justify-center gap-3"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)" }}>
            <LayoutGrid size={32} style={{ color: "rgba(232,234,246,0.2)" }} />
            <p className="text-sm" style={{ color: "rgba(232,234,246,0.35)" }}>Select a cycle on the left to manage it.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="rounded-2xl p-5" style={{ background: "rgba(66,165,245,0.06)", border: "1px solid rgba(66,165,245,0.2)" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#42A5F5" }}>Selected</p>
              <p className="text-base font-black text-white">{selected ? cycleLabel(selected) : selectedId}</p>
              <div className="flex items-center gap-2 mt-1">
                {selected && <PhaseBadge phaseKey={getPhaseKey(selected)} />}
                {selected && <p className="text-xs" style={{ color: "rgba(232,234,246,0.5)" }}>{selected.theme}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { a: "status" as const, icon: <RefreshCw size={15} />,    label: "Change Status",  color: "#FF9800", bg: "rgba(255,152,0,0.08)",   border: "rgba(255,152,0,0.2)" },
                { a: "edit"   as const, icon: <Edit3 size={15} />,         label: "Edit Details",   color: "#42A5F5", bg: "rgba(66,165,245,0.08)",   border: "rgba(66,165,245,0.2)" },
                { a: "select" as const, icon: <Trophy size={15} />,        label: "Select Winner",  color: "#FFD700", bg: "rgba(255,215,0,0.07)",    border: "rgba(255,215,0,0.2)" },
                { a: "agenda" as const, icon: <ListOrdered size={15} />,   label: "Set Agenda",     color: "#66BB6A", bg: "rgba(102,187,106,0.08)",  border: "rgba(102,187,106,0.2)" },
                { a: "delete" as const, icon: <Trash2 size={15} />,        label: "Delete Cycle",   color: "#EF5350", bg: "rgba(239,83,80,0.08)",    border: "rgba(239,83,80,0.2)" },
              ].map(({ a, icon, label, color, bg, border }) => (
                <button key={a} onClick={() => setAction(a)}
                  className="rounded-xl p-4 flex flex-col items-center gap-2 text-xs font-bold transition-all"
                  style={{ color, background: action === a ? bg : "rgba(255,255,255,0.03)", border: `1px solid ${action === a ? border : "rgba(255,255,255,0.07)"}` }}>
                  {icon}{label}
                </button>
              ))}
            </div>

            {action && (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {action === "status" && (
                  <div className="rounded-2xl p-6 flex flex-col gap-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(232,234,246,0.35)" }}>Change Status</p>
                    <div className="grid grid-cols-3 gap-2">
                      {(["planned", "active", "archived"] as const).map((s) => {
                        const pk: PhaseKey = s === "active" ? "nominating" : s;
                        const style = PHASE_STYLE[pk];
                        return (
                          <button key={s} type="button" onClick={() => setNewStatus(s)}
                            className="rounded-xl p-3 text-xs font-bold transition-all flex flex-col items-center gap-1.5"
                            style={{ color: style.color, background: newStatus === s ? style.bg : "rgba(255,255,255,0.02)", border: `1px solid ${newStatus === s ? style.border : "rgba(255,255,255,0.07)"}` }}>
                            {style.icon}{s.charAt(0).toUpperCase() + s.slice(1)}
                          </button>
                        );
                      })}
                    </div>
                    {selected?.status && (
                      <p className="text-xs" style={{ color: "rgba(232,234,246,0.4)" }}>
                        Current: <strong style={{ color: "#e8eaf6" }}>{selected.status}</strong>
                        {newStatus !== selected.status && <> → <strong style={{ color: "#FF9800" }}>{newStatus}</strong></>}
                      </p>
                    )}
                  </div>
                )}

                {action === "edit" && (
                  <div className="rounded-2xl p-6 flex flex-col gap-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(232,234,246,0.35)" }}>Edit Details</p>
                    <Field label="Theme" hint="Leave blank to keep existing." value={newTheme} onChange={setNewTheme} type="text" required={false} placeholder="e.g. Efficient Training & LoRA Methods" />
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Month" value={newMonth} onChange={setNewMonth} type="text" required={false} placeholder="e.g. September" />
                      <Field label="Year"  value={newYear}  onChange={setNewYear}  type="text" required={false} placeholder="e.g. 2026" />
                    </div>
                  </div>
                )}

                {action === "delete" && (
                  <div className="rounded-2xl p-6 flex flex-col gap-3" style={{ background: "rgba(239,83,80,0.06)", border: "1px solid rgba(239,83,80,0.25)" }}>
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#EF5350" }}>⚠️ Delete Cycle</p>
                    {selected?.status !== "planned" ? (
                      <p className="text-sm" style={{ color: "#EF9A9A" }}>
                        Cannot delete: this cycle&apos;s status is <strong>{selected?.status}</strong>. Only <strong>planned</strong> cycles with no nominations can be deleted. Use &ldquo;Change Status&rdquo; → <strong>archived</strong> instead.
                      </p>
                    ) : (selected?.nominations?.length ?? 0) > 0 ? (
                      <p className="text-sm" style={{ color: "#EF9A9A" }}>
                        Cannot delete: this cycle has <strong>{selected?.nominations?.length} nomination(s)</strong>. Archive it instead.
                      </p>
                    ) : (
                      <p className="text-sm" style={{ color: "rgba(232,234,246,0.6)" }}>
                        This will permanently remove <strong style={{ color: "#e8eaf6" }}>{selectedId}</strong> from the site.
                        Only allowed for <strong style={{ color: "#e8eaf6" }}>planned</strong> cycles with no nominations.
                      </p>
                    )}
                  </div>
                )}

                {action === "select" && (
                  <div className="rounded-2xl p-6 flex flex-col gap-4" style={{ background: "rgba(255,215,0,0.04)", border: "1px solid rgba(255,215,0,0.2)" }}>
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#FFD700" }}>🏆 Select Winning Paper</p>
                    {!selected?.nominations?.length ? (
                      <p className="text-sm" style={{ color: "rgba(232,234,246,0.5)" }}>
                        This cycle has no nominations yet.
                      </p>
                    ) : (
                      <>
                        <p className="text-xs" style={{ color: "rgba(232,234,246,0.5)" }}>
                          Click a nomination below or type its ID. All others will be deselected.
                        </p>
                        <div className="flex flex-col gap-2">
                          {selected.nominations.map((nom) => {
                            const isActive = selectNomId === nom.id;
                            return (
                              <button key={nom.id} type="button" onClick={() => setSelectNomId(nom.id)}
                                className="w-full text-left rounded-xl p-3 transition-all flex items-start gap-3"
                                style={{
                                  background: isActive ? "rgba(255,215,0,0.08)" : "rgba(255,255,255,0.03)",
                                  border: `1px solid ${isActive ? "rgba(255,215,0,0.5)" : "rgba(255,255,255,0.07)"}`,
                                }}>
                                <Trophy size={13} className="mt-0.5 shrink-0" style={{ color: isActive ? "#FFD700" : "rgba(232,234,246,0.25)" }} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-white truncate">{nom.title}</p>
                                  <p className="text-xs mt-0.5" style={{ color: "rgba(232,234,246,0.4)" }}>
                                    <span className="font-mono" style={{ color: "#FFD700" }}>{nom.id}</span>
                                    {" · "}{nom.proposer}
                                    {nom.votes != null && <> · <strong>{nom.votes}</strong> votes</>}
                                    {nom.is_selected && <span className="ml-1.5 text-xs font-bold" style={{ color: "#4CAF50" }}>✓ current</span>}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        <Field
                          label="Nomination ID"
                          hint="Confirm or override the selection above."
                          value={selectNomId}
                          onChange={setSelectNomId}
                          type="text"
                          placeholder="e.g. p1"
                        />
                      </>
                    )}
                  </div>
                )}

                {action === "agenda" && (
                  <div className="rounded-2xl p-6 flex flex-col gap-4" style={{ background: "rgba(102,187,106,0.04)", border: "1px solid rgba(102,187,106,0.2)" }}>
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#66BB6A" }}>📋 Set Session Agenda</p>
                    {selected?.session?.agenda?.length ? (
                      <div className="rounded-xl p-3 flex flex-col gap-1 text-xs" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                        <p className="font-bold mb-1" style={{ color: "rgba(232,234,246,0.5)" }}>Current agenda:</p>
                        {selected.session.agenda.map((item, i) => (
                          <p key={i} style={{ color: "rgba(232,234,246,0.6)" }}><span style={{ color: "#66BB6A" }}>{i + 1}.</span> {item}</p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs" style={{ color: "rgba(232,234,246,0.4)" }}>No agenda set yet for this cycle.</p>
                    )}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-white flex items-center gap-1">
                        Agenda Items<span style={{ color: "#FF5722" }}>*</span>
                      </label>
                      <p className="text-xs" style={{ color: "rgba(232,234,246,0.4)" }}>One item per line. Leading -, *, or • are stripped automatically.</p>
                      <textarea
                        value={agendaText}
                        onChange={(e) => setAgendaText(e.target.value)}
                        rows={6}
                        placeholder={"- Paper motivation and background\n- Methodology deep-dive\n- Live demo / code walkthrough\n- Benchmark analysis\n- Open Q&A"}
                        className="w-full rounded-xl px-4 py-2.5 text-sm outline-none resize-none transition-all font-mono"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "#e8eaf6" }}
                        onFocus={(e) => (e.currentTarget.style.border = "1px solid rgba(102,187,106,0.5)")}
                        onBlur={(e)  => (e.currentTarget.style.border = "1px solid rgba(255,255,255,0.12)")}
                      />
                      {agendaText && (
                        <p className="text-xs mt-0.5" style={{ color: "rgba(232,234,246,0.35)" }}>
                          {agendaText.split("\n").filter(Boolean).length} item(s) detected
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(232,234,246,0.35)" }}>Notes (optional)</p>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Reason for change..."
                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none resize-none transition-all"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "#e8eaf6" }}
                    onFocus={(e) => (e.currentTarget.style.border = "1px solid rgba(66,165,245,0.5)")}
                    onBlur={(e)  => (e.currentTarget.style.border = "1px solid rgba(255,255,255,0.12)")} />
                </div>

                {error && <ErrorBanner msg={error} />}

                {!deleteBlocked && (
                  <>
                    <SubmitBtn>
                      {action === "delete" ? "Open Issue to Delete Cycle" :
                       action === "status" ? "Open Issue to Change Status" :
                       action === "select" ? "Open Issue to Select Winner" :
                       action === "agenda" ? "Open Issue to Set Agenda" :
                       "Open Issue to Save Edits"}
                    </SubmitBtn>
                    <p className="text-xs text-center" style={{ color: "rgba(232,234,246,0.35)" }}>
                      Opens a pre-filled GitHub issue. Bot applies the change &amp; redeploys in ~2 min.
                    </p>
                  </>
                )}
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   TAB 3 — CRAWL PAPERS
════════════════════════════════════════════════════════════ */
const CONFERENCES = ["ICLR", "NeurIPS", "ICML", "CVPR", "EMNLP", "ACL", "ECCV", "ICCV", "NAACL"] as const;
type Conf = (typeof CONFERENCES)[number];

const CONF_DESC: Record<Conf, string> = {
  ICLR:    "Representation learning, deep learning theory",
  NeurIPS: "Machine learning + computational neuroscience",
  ICML:    "Broad ML theory and applications",
  CVPR:    "Computer vision and pattern recognition",
  EMNLP:   "Empirical NLP methods",
  ACL:     "Computational linguistics",
  ECCV:    "European computer vision",
  ICCV:    "International computer vision",
  NAACL:   "North American NLP",
};

type CrawlMode = "topic" | "conference" | "arxiv" | "author";

function TabCrawlPapers() {
  // Target cycle
  const [targetCycleId, setTargetCycleId] = useState("");
  // Mode
  const [mode, setMode] = useState<CrawlMode>("topic");
  // Conference mode params
  const [conf, setConf]         = useState<Conf>("ICLR");
  const [year, setYear]         = useState(String(new Date().getFullYear() - 1));
  const [minCites, setMinCites] = useState("30");
  // Topic mode params
  const [topic, setTopic]       = useState("");
  // ArXiv mode params
  const [arxivId, setArxivId]   = useState("");
  // Author mode params
  const [author, setAuthor]     = useState("");
  // Shared
  const [limit, setLimit]       = useState("15");
  const [error, setError]       = useState("");

  const targetCycle = cycles.find((c) => c.id === targetCycleId);

  function validate() {
    if (mode === "conference") {
      const y = parseInt(year, 10);
      if (isNaN(y) || y < 2015 || y > new Date().getFullYear()) {
        setError(`Year must be between 2015 and ${new Date().getFullYear()}.`); return false;
      }
      const m = parseInt(minCites, 10);
      if (isNaN(m) || m < 0) { setError("Min citations must be ≥ 0."); return false; }
    } else if (mode === "topic") {
      if (!topic.trim()) { setError("Please enter a topic or keywords."); return false; }
    } else if (mode === "arxiv") {
      const cleaned = arxivId.replace(/.*abs\//, "").replace(/v\d+$/, "").trim();
      if (!cleaned || !/^\d{4}\.\d{4,5}$/.test(cleaned)) {
        setError("Enter a valid arXiv ID (e.g. 2106.09685) or full arXiv URL."); return false;
      }
    } else if (mode === "author") {
      if (!author.trim()) { setError("Please enter an author name or Semantic Scholar author ID."); return false; }
    }
    const l = parseInt(limit, 10);
    if (isNaN(l) || l < 1 || l > 100) { setError("Limit must be 1–100."); return false; }
    setError(""); return true;
  }

  function handleLaunch(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    window.open(`https://github.com/${REPO}/actions/workflows/crawl-papers.yml`, "_blank", "noopener");
  }

  const cleanArxivId = arxivId.replace(/.*abs\//, "").replace(/v\d+$/, "").trim();

  // Build the params summary shown to the user for the manual step
  const paramSummary =
    mode === "conference" ? `mode=conference, conference=${conf}, year=${year}, cycle_id=${targetCycleId || "(seeds)"}, limit=${limit}, min_citations=${minCites}` :
    mode === "topic"      ? `mode=topic, topic="${topic}", cycle_id=${targetCycleId || "(seeds)"}, limit=${limit}` :
    mode === "arxiv"      ? `mode=arxiv, arxiv_id=${cleanArxivId}, cycle_id=${targetCycleId || "(seeds)"}` :
                            `mode=author, author="${author}", cycle_id=${targetCycleId || "(seeds)"}, limit=${limit}`;

  return (
    <div className="grid lg:grid-cols-5 gap-8">

      {/* ── Left: Target cycle picker ── */}
      <div className="lg:col-span-2 flex flex-col gap-3">
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "rgba(232,234,246,0.35)" }}>
          Target Cycle
          <span className="ml-1.5 font-normal normal-case" style={{ color: "rgba(232,234,246,0.3)" }}>(optional)</span>
        </p>
        <p className="text-xs mb-1" style={{ color: "rgba(232,234,246,0.35)" }}>
          Papers become organizer suggestions for the chosen cycle. Leave unselected to add to the global seed pool.
        </p>

        {/* No cycle option */}
        <button onClick={() => setTargetCycleId("")}
          className="w-full text-left rounded-2xl p-3 transition-all"
          style={{ background: targetCycleId === "" ? "rgba(171,71,188,0.08)" : "rgba(255,255,255,0.02)", border: targetCycleId === "" ? "1px solid rgba(171,71,188,0.4)" : "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2">
            <Database size={13} style={{ color: targetCycleId === "" ? "#AB47BC" : "rgba(232,234,246,0.35)" }} />
            <span className="text-xs font-bold" style={{ color: targetCycleId === "" ? "#e8eaf6" : "rgba(232,234,246,0.5)" }}>
              Global seed pool (seeds.json)
            </span>
          </div>
        </button>

        {cycles.map((c) => {
          const pk = getPhaseKey(c);
          const isSelected = targetCycleId === c.id;
          return (
            <button key={c.id} onClick={() => setTargetCycleId(c.id)}
              className="w-full text-left rounded-2xl p-4 transition-all"
              style={{ background: isSelected ? "rgba(171,71,188,0.08)" : "rgba(255,255,255,0.03)", border: isSelected ? "1px solid rgba(171,71,188,0.4)" : "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-sm font-bold text-white">{cycleLabel(c)}</span>
                <PhaseBadge phaseKey={pk} />
              </div>
              <p className="text-xs" style={{ color: "rgba(232,234,246,0.4)" }}>{c.theme}</p>
              <p className="text-xs mt-1" style={{ color: "rgba(232,234,246,0.25)" }}>
                {c.nominations?.length ?? 0} nomination{(c.nominations?.length ?? 0) !== 1 ? "s" : ""} so far
              </p>
            </button>
          );
        })}
      </div>

      {/* ── Right: Mode + params ── */}
      <div className="lg:col-span-3 flex flex-col gap-5">

        {/* Target summary */}
        <div className="rounded-2xl p-4 flex items-center gap-3"
          style={{ background: "rgba(171,71,188,0.06)", border: "1px solid rgba(171,71,188,0.2)" }}>
          <Database size={16} style={{ color: "#AB47BC" }} />
          <div>
            <p className="text-xs font-bold text-white">
              {targetCycle ? `Suggestions → ${cycleLabel(targetCycle)} nominations` : "Suggestions → global seed pool"}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(232,234,246,0.4)" }}>
              {targetCycle ? targetCycle.theme : "Papers go to seeds.json for any future cycle to pick up"}
            </p>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="grid grid-cols-2 gap-3">
          {([
            {
              m: "topic" as const,
              icon: <Search size={15} />,
              label: "Topic / Keyword",
              desc: "Search arXiv by topic or keywords — best for recent preprints",
              color: "#42A5F5",
              bg: "rgba(66,165,245,0.08)",
              border: "rgba(66,165,245,0.3)",
            },
            {
              m: "conference" as const,
              icon: <Database size={15} />,
              label: "Conference Venue",
              desc: "Filter by venue + year — best after proceedings are published",
              color: "#AB47BC",
              bg: "rgba(171,71,188,0.08)",
              border: "rgba(171,71,188,0.3)",
            },
            {
              m: "arxiv" as const,
              icon: <ExternalLink size={15} />,
              label: "arXiv ID / URL",
              desc: "Paste a specific arXiv ID or URL to add exactly one paper",
              color: "#FF7043",
              bg: "rgba(255,112,67,0.08)",
              border: "rgba(255,112,67,0.3)",
            },
            {
              m: "author" as const,
              icon: <Users size={15} />,
              label: "Author",
              desc: "Fetch recent papers by a researcher (name or S2 author ID)",
              color: "#4CAF50",
              bg: "rgba(76,175,80,0.08)",
              border: "rgba(76,175,80,0.3)",
            },
          ] as const).map(({ m, icon, label, desc, color, bg, border }) => (
            <button key={m} type="button" onClick={() => { setMode(m); setError(""); }}
              className="rounded-2xl p-4 text-left transition-all flex flex-col gap-1.5"
              style={{ color, background: mode === m ? bg : "rgba(255,255,255,0.03)", border: `1px solid ${mode === m ? border : "rgba(255,255,255,0.07)"}` }}>
              <div className="flex items-center gap-2">
                {icon}
                <span className="text-xs font-bold" style={{ color: mode === m ? "#e8eaf6" : "rgba(232,234,246,0.6)" }}>{label}</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(232,234,246,0.4)" }}>{desc}</p>
            </button>
          ))}
        </div>

        {/* Params form */}
        <form onSubmit={handleLaunch} className="flex flex-col gap-5">
          <div className="rounded-2xl p-6 flex flex-col gap-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(232,234,246,0.35)" }}>
              {mode === "topic" ? "Topic Search Parameters" : "Conference Parameters"}
            </p>

            {mode === "topic" ? (
              <>
                <Field
                  label="Keywords / Topic"
                  hint="What to search on Semantic Scholar + arXiv. Be specific."
                  value={topic}
                  onChange={setTopic}
                  type="text"
                  placeholder='e.g. "reasoning LLM 2025" or "vision language models efficient"'
                />
                <Field label="Max Papers" hint="1–100" value={limit} onChange={setLimit} type="text" required={false} placeholder="15" />
              </>
            ) : mode === "arxiv" ? (
              <>
                <Field
                  label="arXiv ID or URL"
                  hint='Paste a bare ID like "2106.09685" or the full URL https://arxiv.org/abs/2106.09685'
                  value={arxivId}
                  onChange={setArxivId}
                  type="text"
                  required={true}
                  placeholder="e.g. 2106.09685"
                />
                <div className="rounded-xl p-3 text-xs flex items-start gap-2"
                  style={{ background: "rgba(255,112,67,0.06)", border: "1px solid rgba(255,112,67,0.2)", color: "rgba(232,234,246,0.55)" }}>
                  <Info size={12} className="shrink-0 mt-0.5" style={{ color: "#FF7043" }} />
                  Fetches exactly one paper. No limit needed — ideal for adding a specific paper you found independently.
                </div>
              </>
            ) : mode === "author" ? (
              <>
                <Field
                  label="Author Name or S2 Author ID"
                  hint='Full name (e.g. "Andrej Karpathy") or numeric Semantic Scholar author ID from their profile URL.'
                  value={author}
                  onChange={setAuthor}
                  type="text"
                  required={true}
                  placeholder='e.g. "Ilya Sutskever" or "1741101"'
                />
                <Field label="Max Papers" hint="1–50 — sorted by most recent" value={limit} onChange={setLimit} type="text" required={false} placeholder="15" />
                <div className="rounded-xl p-3 text-xs flex items-start gap-2"
                  style={{ background: "rgba(76,175,80,0.06)", border: "1px solid rgba(76,175,80,0.2)", color: "rgba(232,234,246,0.55)" }}>
                  <Info size={12} className="shrink-0 mt-0.5" style={{ color: "#4CAF50" }} />
                  Only arXiv papers are added. The bot resolves the name to a Semantic Scholar profile and picks the most-cited match.
                </div>
              </>
            ) : (
              <>
                {/* Conference picker */}
                <div>
                  <p className="text-xs font-bold text-white mb-2 flex items-center gap-1">
                    Conference<span style={{ color: "#FF5722" }}>*</span>
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {CONFERENCES.map((c) => (
                      <button key={c} type="button" onClick={() => setConf(c)}
                        className="rounded-xl px-3 py-2 text-xs font-bold transition-all"
                        style={{
                          color: conf === c ? "#AB47BC" : "rgba(232,234,246,0.5)",
                          background: conf === c ? "rgba(171,71,188,0.12)" : "rgba(255,255,255,0.02)",
                          border: `1px solid ${conf === c ? "rgba(171,71,188,0.4)" : "rgba(255,255,255,0.07)"}`,
                        }}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Field label="Year" value={year} onChange={setYear} type="text" placeholder="2025" />
                  <Field label="Max Papers" hint="1–100" value={limit} onChange={setLimit} type="text" required={false} placeholder="15" />
                  <Field label="Min Citations" hint="Quality filter" value={minCites} onChange={setMinCites} type="text" required={false} placeholder="30" />
                </div>
              </>
            )}

            {/* Manual step callout */}
            <div className="rounded-xl p-3 flex items-start gap-2.5 text-xs"
              style={{ background: "rgba(255,152,0,0.06)", border: "1px solid rgba(255,152,0,0.2)", color: "rgba(232,234,246,0.55)" }}>
              <Info size={13} className="shrink-0 mt-0.5" style={{ color: "#FF9800" }} />
              <div className="flex flex-col gap-1">
                <span>
                  <strong style={{ color: "#e8eaf6" }}>Manual step required:</strong> Click below to open GitHub Actions, then click <strong style={{ color: "#e8eaf6" }}>&ldquo;Run workflow&rdquo;</strong> and paste these parameters:
                </span>
                <code className="mt-1 block rounded-lg px-3 py-2 text-xs leading-relaxed break-all"
                  style={{ background: "rgba(0,0,0,0.3)", color: "#CE93D8", border: "1px solid rgba(171,71,188,0.2)" }}>
                  {paramSummary}
                </code>
              </div>
            </div>
          </div>

          {error && <ErrorBanner msg={error} />}

          <button type="submit"
            className="w-full font-bold py-4 rounded-2xl text-sm flex items-center justify-center gap-2 transition-all"
            style={{ background: "rgba(171,71,188,0.15)", border: "1px solid rgba(171,71,188,0.4)", color: "#CE93D8" }}>
            <ArrowRight size={14} />
            Open GitHub Actions — Run Workflow
            <ExternalLink size={14} />
          </button>
          <p className="text-xs text-center" style={{ color: "rgba(232,234,246,0.35)" }}>
            Runs on GitHub&apos;s servers. Papers are injected as organizer suggestions into the target cycle (or seeds.json), then the site redeploys.
          </p>
        </form>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   TAB 4 — SYNC VOTES
════════════════════════════════════════════════════════════ */
function TabSyncVotes() {
  const activeCycles = cycles.filter((c) => c.status === "active");

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">

      {/* Explainer */}
      <div className="rounded-2xl p-6 flex flex-col gap-3"
        style={{ background: "rgba(255,152,0,0.06)", border: "1px solid rgba(255,152,0,0.2)" }}>
        <div className="flex items-center gap-2">
          <RefreshCw size={16} style={{ color: "#FF9800" }} />
          <p className="text-sm font-bold text-white">How vote sync works</p>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: "rgba(232,234,246,0.6)" }}>
          The bot counts <strong style={{ color: "#e8eaf6" }}>👍 reactions</strong> on each nomination&apos;s GitHub issue and
          updates <code style={{ color: "#FF9800" }}>cycles.json</code> with the latest counts.
          It runs automatically <strong style={{ color: "#e8eaf6" }}>every 6 hours</strong> via cron. Use this to trigger
          an immediate sync — useful during active voting windows.
        </p>
        <div className="rounded-xl p-3 flex items-center gap-2 text-xs"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(232,234,246,0.5)" }}>
          <Info size={12} className="shrink-0" style={{ color: "#FF9800" }} />
          Only nominations with an <strong style={{ color: "#e8eaf6" }}>issue_number</strong> field are synced. Bot-crawled
          suggestions without a linked issue are counted separately.
        </div>
      </div>

      {/* Active cycles with vote summary */}
      <div className="rounded-2xl p-6 flex flex-col gap-4"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(232,234,246,0.35)" }}>
          Active Cycle Vote Status
        </p>
        {activeCycles.length === 0 ? (
          <p className="text-sm" style={{ color: "rgba(232,234,246,0.4)" }}>No active cycles at the moment.</p>
        ) : activeCycles.map((c) => {
          const noms = c.nominations ?? [];
          const synced = noms.filter((n) => (n as { issue_number?: number }).issue_number).length;
          const totalVotes = noms.reduce((sum, n) => sum + (n.votes ?? 0), 0);
          const winner = noms.length > 0
            ? [...noms].sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0))[0]
            : null;
          return (
            <div key={c.id} className="rounded-xl p-4 flex flex-col gap-3"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-white">{cycleLabel(c)}</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(232,234,246,0.4)" }}>{c.theme}</p>
                </div>
                <PhaseBadge phaseKey={getPhaseKey(c)} />
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { label: "Nominations", value: noms.length },
                  { label: "Synced via issue", value: `${synced} / ${noms.length}` },
                  { label: "Total votes", value: totalVotes },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg p-2 text-center"
                    style={{ background: "rgba(255,152,0,0.05)", border: "1px solid rgba(255,152,0,0.12)" }}>
                    <p className="font-bold text-white">{value}</p>
                    <p style={{ color: "rgba(232,234,246,0.4)" }}>{label}</p>
                  </div>
                ))}
              </div>
              {winner && (
                <div className="flex items-center gap-2 text-xs"
                  style={{ color: "rgba(232,234,246,0.5)" }}>
                  <Trophy size={11} style={{ color: "#FFD700" }} />
                  <span>Leading: <strong style={{ color: "#e8eaf6" }}>{winner.title.slice(0, 55)}{winner.title.length > 55 ? "…" : ""}</strong></span>
                  <span className="ml-auto font-bold" style={{ color: "#FF9800" }}>{winner.votes ?? 0} votes</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Trigger button */}
      <div className="flex flex-col gap-3">
        <a
          href={`https://github.com/${REPO}/actions/workflows/sync-votes.yml`}
          target="_blank" rel="noopener noreferrer"
          className="w-full font-bold py-4 rounded-2xl text-sm flex items-center justify-center gap-2 transition-all"
          style={{ background: "rgba(255,152,0,0.12)", border: "1px solid rgba(255,152,0,0.4)", color: "#FFCC80", textDecoration: "none" }}>
          <PlayCircle size={16} />
          Open GitHub Actions — Trigger Vote Sync
          <ExternalLink size={14} />
        </a>
        <p className="text-xs text-center" style={{ color: "rgba(232,234,246,0.35)" }}>
          Click <strong style={{ color: "#e8eaf6" }}>&ldquo;Run workflow&rdquo;</strong> on the page that opens. The bot syncs all active cycles, commits updated vote counts, and redeploys the site in ~2 min.
        </p>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   TAB 5 — OPEN CYCLE
════════════════════════════════════════════════════════════ */
function TabOpenCycle() {
  const [cycleId, setCycleId]         = useState("");
  const [month, setMonth]             = useState("");
  const [year, setYear]               = useState(new Date().getFullYear().toString());
  const [theme, setTheme]             = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [presenter, setPresenter]     = useState("");
  const [presenterRole, setPresenterRole] = useState("");
  const [error, setError]             = useState("");

  // Auto-suggest cycle ID from month+year
  const suggestedId = month && year
    ? `${year}-${month.toLowerCase().slice(0, 3)}`
    : "";

  function validate() {
    if (!cycleId.trim())  { setError("Cycle ID is required (e.g. 2026-jan)."); return false; }
    if (!/^\d{4}-[a-z]{3}$/.test(cycleId.trim())) { setError("Cycle ID must be in the format YYYY-mmm (e.g. 2026-jan)."); return false; }
    if (!theme.trim())    { setError("Theme is required."); return false; }
    if (cycles.some((c) => c.id === cycleId.trim())) { setError(`Cycle "${cycleId}" already exists.`); return false; }
    setError(""); return true;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const title = `Open Cycle: ${cycleId.trim()}`;
    const body = [
      `### Cycle ID`, cycleId.trim(), ``,
      `### Month`, month || "_No response_", ``,
      `### Year`, year || "_No response_", ``,
      `### Theme`, theme.trim(), ``,
      `### Session Date (YYYY-MM-DD, optional)`, sessionDate || "_No response_", ``,
      `### Presenter (optional)`, presenter || "_No response_", ``,
      `### Presenter Role (optional)`, presenterRole || "_No response_",
    ].join("\n");
    const params = new URLSearchParams({ template: "04-new-cycle.yml", title, labels: "new-cycle,cycle", body });
    window.open(`https://github.com/${REPO}/issues/new?${params}`, "_blank", "noopener");
  }

  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      {/* Info banner */}
      <div className="rounded-2xl p-5 flex flex-col gap-3"
        style={{ background: "rgba(66,165,245,0.06)", border: "1px solid rgba(66,165,245,0.2)" }}>
        <div className="flex items-center gap-2">
          <Info size={15} style={{ color: "#42A5F5" }} />
          <p className="text-sm font-bold text-white">How this works</p>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: "rgba(232,234,246,0.6)" }}>
          Opening a GitHub issue with the <code style={{ color: "#42A5F5" }}>new-cycle</code> label triggers the bot to
          add a new entry to <code style={{ color: "#42A5F5" }}>cycles.json</code> and redeploy the site in ~2 min.
          Dates can be set later via the <strong style={{ color: "#e8eaf6" }}>Set Dates</strong> tab.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Cycle ID */}
        <div className="rounded-2xl p-6 flex flex-col gap-5"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(232,234,246,0.35)" }}>
            Identity
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-white flex items-center gap-1">
                Month<span style={{ color: "#FF5722" }}>*</span>
              </label>
              <select
                value={month}
                onChange={(e) => {
                  setMonth(e.target.value);
                  const abbr = e.target.value.toLowerCase().slice(0, 3);
                  if (year) setCycleId(`${year}-${abbr}`);
                }}
                className="w-full rounded-xl px-4 py-2.5 text-sm font-medium outline-none transition-all"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "#e8eaf6", colorScheme: "dark" }}
                onFocus={(e) => (e.currentTarget.style.border = "1px solid rgba(255,87,34,0.5)")}
                onBlur={(e)  => (e.currentTarget.style.border = "1px solid rgba(255,255,255,0.12)")}
              >
                <option value="">Select month…</option>
                {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <Field label="Year" value={year} onChange={(v) => {
              setYear(v);
              if (month) setCycleId(`${v}-${month.toLowerCase().slice(0, 3)}`);
            }} type="number" placeholder="e.g. 2026" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-white flex items-center gap-1">
              Cycle ID<span style={{ color: "#FF5722" }}>*</span>
            </label>
            <p className="text-xs" style={{ color: "rgba(232,234,246,0.4)" }}>
              Auto-filled from month + year. Format: YYYY-mmm (e.g. 2026-jan)
            </p>
            <input
              type="text" value={cycleId} placeholder="e.g. 2026-jan"
              onChange={(e) => setCycleId(e.target.value.toLowerCase())}
              className="w-full rounded-xl px-4 py-2.5 text-sm font-medium outline-none transition-all font-mono"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "#e8eaf6" }}
              onFocus={(e) => (e.currentTarget.style.border = "1px solid rgba(255,87,34,0.5)")}
              onBlur={(e)  => (e.currentTarget.style.border = "1px solid rgba(255,255,255,0.12)")}
            />
            {suggestedId && suggestedId !== cycleId && (
              <button type="button" onClick={() => setCycleId(suggestedId)}
                className="text-xs self-start font-semibold" style={{ color: "#FF5722" }}>
                Use suggested: {suggestedId}
              </button>
            )}
          </div>
          <Field label="Theme" hint="A short label for this cycle's focus area." value={theme} onChange={setTheme} type="text" placeholder="e.g. Efficient Transformers" />
        </div>

        {/* Optional dates & presenter */}
        <div className="rounded-2xl p-6 flex flex-col gap-5"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(232,234,246,0.35)" }}>
            Dates & Presenter <span className="normal-case font-normal" style={{ color: "rgba(232,234,246,0.35)" }}>(optional — can be set later)</span>
          </p>
          <Field label="Deep Dive Session Date" value={sessionDate} onChange={setSessionDate} required={false} />
          <Field label="Presenter Name" value={presenter} onChange={setPresenter} type="text" required={false} placeholder="e.g. Duc Vo" />
          <Field label="Presenter Role" value={presenterRole} onChange={setPresenterRole} type="text" required={false} placeholder="e.g. ML Engineer · VJAI Core" />
        </div>

        {error && <ErrorBanner msg={error} />}
        <SubmitBtn>Open GitHub Issue to Create Cycle</SubmitBtn>
        <p className="text-xs text-center" style={{ color: "rgba(232,234,246,0.35)" }}>
          Opens a pre-filled GitHub issue with the <code>new-cycle</code> label. The bot adds the cycle and redeploys in ~2 min.
        </p>
      </form>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   ROOT PAGE
════════════════════════════════════════════════════════════ */
type Tab = "cycles" | "dates" | "crawl" | "sync" | "open";

const TABS: { id: Tab; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: "cycles", label: "Manage Cycles", icon: <LayoutGrid size={16} />,   desc: "Status, edit, select winner, set agenda" },
  { id: "dates",  label: "Set Dates",     icon: <Calendar size={16} />,     desc: "Exploration & Deep Dive dates" },
  { id: "open",   label: "Open Cycle",    icon: <PlayCircle size={16} />,   desc: "Create a new cycle on the roadmap" },
  { id: "crawl",  label: "Crawl Papers",  icon: <Search size={16} />,       desc: "Fetch suggestions for a cycle or seed pool" },
  { id: "sync",   label: "Sync Votes",    icon: <RefreshCw size={16} />,    desc: "Trigger vote count update from GitHub reactions" },
];

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("cycles");

  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(160deg, #070c26 0%, #0e1550 50%, #070c26 100%)", color: "#e8eaf6" }}>

      <section className="relative pt-28 pb-12 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(26,35,126,0.5) 0%, transparent 70%)" }} />
        <div className="relative max-w-5xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-4 text-xs font-semibold" style={{ color: "rgba(232,234,246,0.4)" }}>
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={12} />
            <span style={{ color: "#FF5722" }}>Admin</span>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <Settings size={20} style={{ color: "#FF5722" }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#FF5722" }}>Admin Panel</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-3">
            Site <span className="gradient-text">Controls</span>
          </h1>
          <p className="text-base max-w-xl" style={{ color: "rgba(232,234,246,0.6)" }}>
            Manage cycles, set dates, and automatically crawl highly-cited papers from top conferences.
            All changes go through GitHub — the bot handles commits and redeploys.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 w-full mb-8">
        <div className="grid grid-cols-5 gap-3">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="rounded-2xl p-5 text-left transition-all"
              style={{
                background: tab === t.id ? "rgba(255,87,34,0.08)" : "rgba(255,255,255,0.03)",
                border:     tab === t.id ? "1px solid rgba(255,87,34,0.35)" : "1px solid rgba(255,255,255,0.07)",
              }}>
              <div className="flex items-center gap-2 mb-1.5"
                style={{ color: tab === t.id ? "#FF5722" : "rgba(232,234,246,0.5)" }}>
                {t.icon}
                <span className="text-sm font-bold" style={{ color: tab === t.id ? "#e8eaf6" : "rgba(232,234,246,0.7)" }}>
                  {t.label}
                </span>
              </div>
              <p className="text-xs" style={{ color: "rgba(232,234,246,0.35)" }}>{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-32 w-full">
        {tab === "dates"  && <TabSetDates />}
        {tab === "cycles" && <TabManageCycles />}
        {tab === "open"   && <TabOpenCycle />}
        {tab === "crawl"  && <TabCrawlPapers />}
        {tab === "sync"   && <TabSyncVotes />}
      </div>
    </div>
  );
}
