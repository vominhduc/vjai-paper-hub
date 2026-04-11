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
type ManageAction = "status" | "edit" | "delete" | null;

function TabManageCycles() {
  const [selectedId, setSelectedId] = useState("");
  const [action, setAction]         = useState<ManageAction>(null);
  const [newStatus, setNewStatus]   = useState("planned");
  const [newTheme, setNewTheme]     = useState("");
  const [newMonth, setNewMonth]     = useState("");
  const [newYear, setNewYear]       = useState("");
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
      setNotes("");
    }
  }

  function buildIssueUrl() {
    if (!selectedId || !action) { setError("No cycle or action selected."); return ""; }

    const actionLabel =
      action === "status" ? "status — change the cycle status" :
      action === "edit"   ? "edit — update theme / month / year" :
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
                { a: "status" as const, icon: <RefreshCw size={15} />, label: "Change Status", color: "#FF9800", bg: "rgba(255,152,0,0.08)", border: "rgba(255,152,0,0.2)" },
                { a: "edit"   as const, icon: <Edit3 size={15} />,     label: "Edit Details",  color: "#42A5F5", bg: "rgba(66,165,245,0.08)", border: "rgba(66,165,245,0.2)" },
                { a: "delete" as const, icon: <Trash2 size={15} />,    label: "Delete Cycle",  color: "#EF5350", bg: "rgba(239,83,80,0.08)",  border: "rgba(239,83,80,0.2)" },
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

function TabCrawlPapers() {
  const [conf, setConf]         = useState<Conf>("ICLR");
  const [year, setYear]         = useState(String(new Date().getFullYear() - 1));
  const [limit, setLimit]       = useState("20");
  const [minCites, setMinCites] = useState("50");
  const [error, setError]       = useState("");

  function validate() {
    const y = parseInt(year, 10);
    if (isNaN(y) || y < 2015 || y > new Date().getFullYear()) {
      setError(`Year must be between 2015 and ${new Date().getFullYear()}.`); return false;
    }
    const l = parseInt(limit, 10);
    if (isNaN(l) || l < 1 || l > 100) { setError("Limit must be 1–100."); return false; }
    const m = parseInt(minCites, 10);
    if (isNaN(m) || m < 0) { setError("Min citations must be ≥ 0."); return false; }
    setError(""); return true;
  }

  function handleLaunch(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    window.open(`https://github.com/${REPO}/actions/workflows/crawl-papers.yml`, "_blank", "noopener");
  }

  return (
    <div className="grid lg:grid-cols-5 gap-8">
      <div className="lg:col-span-2 flex flex-col gap-3">
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "rgba(232,234,246,0.35)" }}>Target Conference</p>
        {CONFERENCES.map((c) => {
          const isSelected = conf === c;
          return (
            <button key={c} onClick={() => setConf(c)}
              className="w-full text-left rounded-2xl p-4 transition-all"
              style={{ background: isSelected ? "rgba(171,71,188,0.08)" : "rgba(255,255,255,0.03)", border: isSelected ? "1px solid rgba(171,71,188,0.4)" : "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-sm font-bold text-white">{c}</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(232,234,246,0.4)" }}>{CONF_DESC[c]}</p>
            </button>
          );
        })}
      </div>

      <div className="lg:col-span-3 flex flex-col gap-5">
        <div className="rounded-2xl p-5 flex flex-col gap-3"
          style={{ background: "rgba(171,71,188,0.06)", border: "1px solid rgba(171,71,188,0.2)" }}>
          <div className="flex items-center gap-2">
            <Database size={16} style={{ color: "#AB47BC" }} />
            <p className="text-sm font-bold text-white">How the crawler works</p>
          </div>
          <ul className="flex flex-col gap-1.5 text-xs" style={{ color: "rgba(232,234,246,0.55)" }}>
            <li className="flex items-start gap-2"><span style={{ color: "#AB47BC" }}>→</span> Queries <strong style={{ color: "#e8eaf6" }}>Semantic Scholar</strong> for papers from the selected conference &amp; year</li>
            <li className="flex items-start gap-2"><span style={{ color: "#AB47BC" }}>→</span> Filters by citation count, venue match, and arXiv availability</li>
            <li className="flex items-start gap-2"><span style={{ color: "#AB47BC" }}>→</span> Auto-deduplicates against existing <code style={{ color: "#AB47BC" }}>seeds.json</code></li>
            <li className="flex items-start gap-2"><span style={{ color: "#AB47BC" }}>→</span> Infers domain, tags &amp; hackability score automatically</li>
            <li className="flex items-start gap-2"><span style={{ color: "#AB47BC" }}>→</span> Commits to repo &amp; redeploys the site</li>
          </ul>
        </div>

        <form onSubmit={handleLaunch} className="flex flex-col gap-5">
          <div className="rounded-2xl p-6 flex flex-col gap-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(232,234,246,0.35)" }}>Parameters</p>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold" style={{ color: "rgba(232,234,246,0.5)" }}>Conference:</span>
              <span className="inline-flex items-center gap-1.5 text-sm font-black px-3 py-1 rounded-full"
                style={{ color: "#AB47BC", background: "rgba(171,71,188,0.12)", border: "1px solid rgba(171,71,188,0.3)" }}>
                <Search size={12} />{conf}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Year" value={year} onChange={setYear} type="text" placeholder={String(new Date().getFullYear() - 1)} />
              <Field label="Max Papers" hint="1–100" value={limit} onChange={setLimit} type="text" required={false} placeholder="20" />
              <Field label="Min Citations" hint="Quality filter" value={minCites} onChange={setMinCites} type="text" required={false} placeholder="50" />
            </div>
            <div className="rounded-xl p-3 flex items-start gap-2.5 text-xs"
              style={{ background: "rgba(255,152,0,0.06)", border: "1px solid rgba(255,152,0,0.2)", color: "rgba(232,234,246,0.55)" }}>
              <Info size={13} className="shrink-0 mt-0.5" style={{ color: "#FF9800" }} />
              <span>
                <strong style={{ color: "#e8eaf6" }}>Manual step required:</strong> The button below opens the GitHub Actions page.
                Click <strong style={{ color: "#e8eaf6" }}>&ldquo;Run workflow&rdquo;</strong>, fill in {conf}, {year}, {limit}, {minCites} and trigger it.
                The bot handles the rest automatically.
              </span>
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
            Runs on GitHub&apos;s servers. Papers are added to <code>data/seeds.json</code> and the site redeploys automatically.
          </p>
        </form>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   ROOT PAGE
════════════════════════════════════════════════════════════ */
type Tab = "dates" | "cycles" | "crawl";

const TABS: { id: Tab; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: "dates",  label: "Set Dates",     icon: <Calendar size={16} />,   desc: "Exploration & Deep Dive dates for a cycle" },
  { id: "cycles", label: "Manage Cycles", icon: <LayoutGrid size={16} />, desc: "Change status, edit theme, or delete" },
  { id: "crawl",  label: "Crawl Papers",  icon: <Search size={16} />,     desc: "Auto-fetch top papers from a conference" },
];

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("dates");

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
        <div className="grid grid-cols-3 gap-3">
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
        {tab === "crawl"  && <TabCrawlPapers />}
      </div>
    </div>
  );
}
