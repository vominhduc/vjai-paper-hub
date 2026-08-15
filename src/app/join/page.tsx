"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Loader2, Users, Calendar, Mail, User, Briefcase } from "lucide-react";
import { cycles, cycleLabel } from "@/lib/data";

// Set this to your deployed Google Apps Script Web App URL
// See GUIDE: src/app/join/SETUP.md
const APPS_SCRIPT_URL = process.env.NEXT_PUBLIC_JOIN_WEBHOOK_URL ?? "";

const upcomingCycles = cycles.filter(
  (c) => c.status === "active" || c.status === "planned"
);

type Status = "idle" | "submitting" | "success" | "error";

function JoinForm() {
  const searchParams = useSearchParams();
  const preselectedCycle = searchParams.get("cycle") ?? upcomingCycles[0]?.id ?? "";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [affiliation, setAffiliation] = useState("");
  const [attendance, setAttendance] = useState<"onsite" | "online" | "">("");
  const [cycleId, setCycleId] = useState(preselectedCycle);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Sync if URL param changes after mount
  useEffect(() => {
    if (preselectedCycle) setCycleId(preselectedCycle);
  }, [preselectedCycle]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!APPS_SCRIPT_URL) {
      setErrorMsg("Registration is not configured yet. Please contact the organizer.");
      setStatus("error");
      return;
    }
    setStatus("submitting");
    setErrorMsg("");

    if (!attendance) {
      setErrorMsg("Please select your attendance mode (Onsite or Online).");
      setStatus("error");
      return;
    }

    try {
      const cycle = cycles.find((c) => c.id === cycleId);
      const payload = {
        name: name.trim(),
        email: email.trim(),
        role: role.trim(),
        affiliation: affiliation.trim(),
        attendance,
        cycle_id: cycleId,
        cycle_label: cycle ? cycleLabel(cycle) : cycleId,
        registered_at: new Date().toISOString(),
      };

      // Google Apps Script requires no-cors when called from a static page
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // no-cors means we can't read the response — assume success if no throw
      setStatus("success");
    } catch {
      setErrorMsg("Something went wrong. Please try again or email the organizer directly.");
      setStatus("error");
    }
  }

  const selectedCycle = cycles.find((c) => c.id === cycleId);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-28"
      style={{
        background: "linear-gradient(160deg, #070c26 0%, #0e1550 50%, #070c26 100%)",
        color: "#e8eaf6",
      }}
    >
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #FF5722, #FF8A65)" }}
            >
              <Users size={28} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Join a Session</h1>
          <p style={{ color: "rgba(232,234,246,0.5)" }} className="text-sm">
            Register for an upcoming VJAI paper reading session.
            <br />Your information is private and only shared with the organizers.
          </p>
        </div>

        {status === "success" ? (
          /* ── Success state ── */
          <div
            className="rounded-2xl p-10 flex flex-col items-center text-center gap-4"
            style={{ background: "rgba(76,175,80,0.07)", border: "1px solid rgba(76,175,80,0.3)" }}
          >
            <CheckCircle size={48} style={{ color: "#4CAF50" }} />
            <h2 className="text-xl font-bold text-white">You&apos;re registered! 🎉</h2>
            <p style={{ color: "rgba(232,234,246,0.6)" }} className="text-sm">
              We&apos;ll send venue and joining details to <strong className="text-white">{email}</strong> before the session.
            </p>
            {selectedCycle && (
              <div
                className="rounded-xl px-5 py-3 text-sm"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <span style={{ color: "rgba(232,234,246,0.5)" }}>Registered for: </span>
                <span className="font-semibold text-white">{cycleLabel(selectedCycle)}</span>
                {selectedCycle.theme && (
                  <span style={{ color: "#FF8A65" }}> · {selectedCycle.theme}</span>
                )}
              </div>
            )}
            <div className="flex gap-3 mt-2">
              <Link
                href="/cycle"
                className="text-sm font-semibold px-5 py-2.5 rounded-xl text-white"
                style={{ background: "linear-gradient(135deg, #FF5722, #FF8A65)" }}
              >
                View Current Cycle →
              </Link>
              <button
                onClick={() => { setStatus("idle"); setEmail(""); setName(""); setRole(""); setAffiliation(""); setAttendance(""); }}
                className="text-sm font-semibold px-5 py-2.5 rounded-xl"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(232,234,246,0.7)" }}
              >
                Register another
              </button>
            </div>
          </div>
        ) : (
          /* ── Form ── */
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl p-8 flex flex-col gap-5"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {/* Cycle selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(232,234,246,0.5)" }}>
                <Calendar size={11} className="inline mr-1.5" />Session / Cycle
              </label>
              {upcomingCycles.length === 0 ? (
                <p className="text-sm" style={{ color: "rgba(232,234,246,0.4)" }}>
                  No upcoming sessions scheduled yet.{" "}
                  <Link href="/cycle" style={{ color: "#FF5722" }}>Check back soon →</Link>
                </p>
              ) : (
                <select
                  value={cycleId}
                  onChange={(e) => setCycleId(e.target.value)}
                  required
                  className="rounded-xl px-4 py-3 text-sm outline-none"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#e8eaf6",
                  }}
                >
                  {upcomingCycles.map((c) => (
                    <option key={c.id} value={c.id} style={{ background: "#0e1550" }}>
                      {cycleLabel(c)}{c.theme ? ` · ${c.theme}` : ""}
                      {c.session_date ? ` (${c.session_date})` : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(232,234,246,0.5)" }}>
                <User size={11} className="inline mr-1.5" />Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nguyen Van A"
                required
                className="rounded-xl px-4 py-3 text-sm outline-none placeholder:opacity-30"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#e8eaf6",
                }}
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(232,234,246,0.5)" }}>
                <Mail size={11} className="inline mr-1.5" />Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="rounded-xl px-4 py-3 text-sm outline-none placeholder:opacity-30"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#e8eaf6",
                }}
              />
            </div>

            {/* Role */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(232,234,246,0.5)" }}>
                <Briefcase size={11} className="inline mr-1.5" />Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="rounded-xl px-4 py-3 text-sm outline-none"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: role ? "#e8eaf6" : "rgba(232,234,246,0.3)",
                }}
              >
                <option value="" disabled style={{ background: "#0e1550" }}>Select your role…</option>
                <option value="ML Engineer" style={{ background: "#0e1550" }}>ML Engineer</option>
                <option value="AI Researcher" style={{ background: "#0e1550" }}>AI Researcher</option>
                <option value="Software Engineer" style={{ background: "#0e1550" }}>Software Engineer</option>
                <option value="Data Scientist" style={{ background: "#0e1550" }}>Data Scientist</option>
                <option value="Student" style={{ background: "#0e1550" }}>Student</option>
                <option value="Other" style={{ background: "#0e1550" }}>Other</option>
              </select>
            </div>

            {/* Attendance */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(232,234,246,0.5)" }}>
                Attendance
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(["onsite", "online"] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setAttendance(opt)}
                    className="py-3 rounded-xl text-sm font-semibold capitalize transition-all"
                    style={
                      attendance === opt
                        ? { background: "rgba(255,87,34,0.15)", color: "#FF5722", border: "1px solid rgba(255,87,34,0.5)" }
                        : { background: "rgba(255,255,255,0.05)", color: "rgba(232,234,246,0.5)", border: "1px solid rgba(255,255,255,0.1)" }
                    }
                  >
                    {opt === "onsite" ? "🏢 Onsite" : "💻 Online"}
                  </button>
                ))}
              </div>
              {!attendance && (
                <p className="text-xs" style={{ color: "rgba(232,234,246,0.3)" }}>Please select how you will attend.</p>
              )}
            </div>

            {/* Affiliation */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(232,234,246,0.5)" }}>
                Affiliation
                <span className="ml-2 normal-case font-normal" style={{ color: "rgba(232,234,246,0.3)" }}>— optional</span>
              </label>
              <input
                type="text"
                value={affiliation}
                onChange={(e) => setAffiliation(e.target.value)}
                placeholder="Company / University"
                className="rounded-xl px-4 py-3 text-sm outline-none placeholder:opacity-30"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#e8eaf6",
                }}
              />
            </div>

            {/* Error */}
            {status === "error" && (
              <p className="text-sm px-4 py-3 rounded-xl" style={{ background: "rgba(244,67,54,0.1)", color: "#ef5350", border: "1px solid rgba(244,67,54,0.2)" }}>
                {errorMsg}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={status === "submitting" || upcomingCycles.length === 0}
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white transition-opacity disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #FF5722, #FF8A65)" }}
            >
              {status === "submitting" ? (
                <><Loader2 size={16} className="animate-spin" /> Registering…</>
              ) : (
                "Register for Session →"
              )}
            </button>

            <p className="text-center text-xs" style={{ color: "rgba(232,234,246,0.3)" }}>
              Fields marked as required must be filled in to submit.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense>
      <JoinForm />
    </Suspense>
  );
}
