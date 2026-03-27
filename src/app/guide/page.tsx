import Link from "next/link";
import {
  ChevronRight,
  BookOpen,
  FileText,
  ThumbsUp,
  Zap,
  CheckCircle2,
  Sprout,
  ArrowRight,
  Calendar,
  Users,
  GitFork,
  HelpCircle,
  MapPin,
} from "lucide-react";

/* ─── Section header ──────────────────────────────────────── */
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

/* ─── Step card ───────────────────────────────────────────── */
function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div
      className="flex gap-5 p-5 rounded-2xl"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 mt-0.5"
        style={{ background: "rgba(255,87,34,0.15)", color: "#FF5722" }}
      >
        {n}
      </div>
      <div>
        <p className="text-sm font-bold text-white mb-1">{title}</p>
        <p className="text-sm leading-relaxed" style={{ color: "rgba(232,234,246,0.6)" }}>
          {children}
        </p>
      </div>
    </div>
  );
}

/* ─── Badge pill ──────────────────────────────────────────── */
function Badge({
  icon,
  label,
  desc,
  color,
  bg,
  border,
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
  color: string;
  bg: string;
  border: string;
}) {
  return (
    <div
      className="flex items-start gap-4 p-5 rounded-2xl"
      style={{ background: bg, border: `1px solid ${border}` }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: bg, border: `1px solid ${border}` }}
      >
        <span style={{ color }}>{icon}</span>
      </div>
      <div>
        <p className="text-sm font-bold mb-1" style={{ color }}>
          {label}
        </p>
        <p className="text-xs leading-relaxed" style={{ color: "rgba(232,234,246,0.55)" }}>
          {desc}
        </p>
      </div>
    </div>
  );
}

/* ─── FAQ item ────────────────────────────────────────────── */
function FAQ({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div
      className="p-5 rounded-2xl"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <p className="text-sm font-bold text-white mb-2 flex items-start gap-2">
        <HelpCircle size={15} className="shrink-0 mt-0.5" style={{ color: "#FF5722" }} />
        {q}
      </p>
      <p className="text-sm leading-relaxed pl-6" style={{ color: "rgba(232,234,246,0.6)" }}>
        {children}
      </p>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────── */
export default function GuidePage() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(160deg, #070c26 0%, #0e1550 50%, #070c26 100%)",
        color: "#e8eaf6",
      }}
    >
      {/* ── Hero ── */}
      <section className="relative pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(26,35,126,0.5) 0%, transparent 70%)",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-4 text-xs font-semibold" style={{ color: "rgba(232,234,246,0.4)" }}>
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={12} />
            <span style={{ color: "#FF5722" }}>Guide</span>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <BookOpen size={20} style={{ color: "#FF5722" }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#FF5722" }}>
              User Guide
            </span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-4">
            How to use{" "}
            <span className="gradient-text">VJAI Paper Hub</span>
          </h1>
          <p className="text-lg max-w-2xl leading-relaxed" style={{ color: "rgba(232,234,246,0.6)" }}>
            Everything you need to nominate papers, present at Exploration sessions,
            vote for the Deep Dive, and follow along with the community.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 pb-32 w-full flex flex-col gap-20">

        {/* ── The 4-phase cycle ── */}
        <section>
          <SectionLabel>How it works</SectionLabel>
          <h2 className="text-2xl font-black text-white mb-2">The Monthly Cycle</h2>
          <p className="text-sm mb-8" style={{ color: "rgba(232,234,246,0.55)" }}>
            Each month runs a 4-phase loop. Here&apos;s what happens in each phase:
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                icon: <FileText size={18} />,
                phase: "1 · Nominating",
                color: "#42A5F5",
                bg: "rgba(66,165,245,0.07)",
                border: "rgba(66,165,245,0.2)",
                desc: "Members nominate papers they commit to present at the Exploration session. Each nomination = one presenter slot. Nominations close on the date shown on the cycle card.",
              },
              {
                icon: <Users size={18} />,
                phase: "2 · Exploration Session",
                color: "#FF9800",
                bg: "rgba(255,152,0,0.07)",
                border: "rgba(255,152,0,0.2)",
                desc: "Every nominator gives a short presentation of their paper to the group. Attend live to hear all papers before voting.",
              },
              {
                icon: <ThumbsUp size={18} />,
                phase: "3 · Voting",
                color: "#AB47BC",
                bg: "rgba(171,71,188,0.07)",
                border: "rgba(171,71,188,0.2)",
                desc: "After all presentations, voting opens for 3 days. React with 👍 on a nomination's GitHub issue. The paper with the most 👍 reactions wins.",
              },
              {
                icon: <Zap size={18} />,
                phase: "4 · Deep Dive",
                color: "#FF5722",
                bg: "rgba(255,87,34,0.07)",
                border: "rgba(255,87,34,0.2)",
                desc: "The winning paper gets a full 90-minute session — reproduced code, deep technical discussion, and a community artifact published in the Archive.",
              },
            ].map((item) => (
              <div
                key={item.phase}
                className="p-5 rounded-2xl flex flex-col gap-3"
                style={{ background: item.bg, border: `1px solid ${item.border}` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: item.bg, border: `1px solid ${item.border}`, color: item.color }}
                  >
                    {item.icon}
                  </div>
                  <p className="text-sm font-black" style={{ color: item.color }}>
                    {item.phase}
                  </p>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(232,234,246,0.65)" }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
          <div
            className="mt-4 p-4 rounded-xl text-sm"
            style={{ background: "rgba(255,87,34,0.06)", border: "1px solid rgba(255,87,34,0.15)", color: "rgba(232,234,246,0.6)" }}
          >
            💡 <strong className="text-white">Key point:</strong> Nominating = committing to present. Voting happens <em>after</em> the Exploration session, once everyone has seen all the papers.
          </div>
        </section>

        {/* ── How to nominate ── */}
        <section>
          <SectionLabel>Nominating</SectionLabel>
          <h2 className="text-2xl font-black text-white mb-2">How to Nominate a Paper</h2>
          <p className="text-sm mb-8" style={{ color: "rgba(232,234,246,0.55)" }}>
            You can nominate any AI/ML paper during the <strong className="text-white">Nominating</strong> phase of an active cycle.
            There are two paths:
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Option A */}
            <div
              className="rounded-2xl p-6 flex flex-col gap-4"
              style={{ background: "rgba(76,175,80,0.05)", border: "1px solid rgba(76,175,80,0.18)" }}
            >
              <div className="flex items-center gap-2">
                <Sprout size={16} style={{ color: "#66BB6A" }} />
                <p className="text-sm font-black" style={{ color: "#66BB6A" }}>Option A — Nominate a Seed paper</p>
              </div>
              <div className="flex flex-col gap-3">
                <Step n={1} title="Go to Seeds page">Navigate to <Link href="/seeds" className="underline" style={{ color: "#FF5722" }}>/seeds</Link>.</Step>
                <Step n={2} title="Find a 🌱 Seed card">These are organizer suggestions not yet claimed by a presenter.</Step>
                <Step n={3} title="Click + Nominate">A GitHub issue opens pre-filled with the paper title, arXiv URL, and cycle ID.</Step>
                <Step n={4} title="Fill in your name & submit">Add your name/handle and a short pitch, then submit the issue.</Step>
              </div>
            </div>

            {/* Option B */}
            <div
              className="rounded-2xl p-6 flex flex-col gap-4"
              style={{ background: "rgba(66,165,245,0.05)", border: "1px solid rgba(66,165,245,0.18)" }}
            >
              <div className="flex items-center gap-2">
                <FileText size={16} style={{ color: "#42A5F5" }} />
                <p className="text-sm font-black" style={{ color: "#42A5F5" }}>Option B — Nominate your own paper</p>
              </div>
              <div className="flex flex-col gap-3">
                <Step n={1} title="Go to Seeds or Cycle page">Click the orange <strong className="text-white">+ Nominate</strong> button in the cycle header.</Step>
                <Step n={2} title="Fill the GitHub issue form">
                  Fields: <strong className="text-white">Your Name / Handle</strong>, <strong className="text-white">Cycle ID</strong> (pre-filled), <strong className="text-white">arXiv URL</strong>, <strong className="text-white">Tags</strong>, and a short pitch.
                </Step>
                <Step n={3} title="Submit — bot does the rest">The automation adds the paper to the cycle within minutes.</Step>
              </div>
            </div>
          </div>

          <div
            className="p-4 rounded-xl text-sm flex items-start gap-3"
            style={{ background: "rgba(255,152,0,0.07)", border: "1px solid rgba(255,152,0,0.2)", color: "rgba(232,234,246,0.6)" }}
          >
            <span className="text-base shrink-0">⚠️</span>
            <span>
              <strong className="text-white">Commitment:</strong> By nominating, you are agreeing to give a short presentation of that paper at the Exploration session. Only nominate if you can attend.
            </span>
          </div>
        </section>

        {/* ── How to vote ── */}
        <section>
          <SectionLabel>Voting</SectionLabel>
          <h2 className="text-2xl font-black text-white mb-2">How to Vote</h2>
          <p className="text-sm mb-8" style={{ color: "rgba(232,234,246,0.55)" }}>
            Voting opens after the Exploration session and stays open for <strong className="text-white">3 days</strong>.
          </p>
          <div className="flex flex-col gap-3 mb-6">
            <Step n={1} title="Go to Seeds or Cycle page">Wait until the cycle is in the Voting phase (after the Exploration session).</Step>
            <Step n={2} title='Click "Vote on GitHub"'>Each nomination card shows a Vote on GitHub button during the voting phase.</Step>
            <Step n={3} title="React with 👍 on the issue">The GitHub issue for that nomination opens — add a 👍 reaction to cast your vote.</Step>
            <Step n={4} title="Votes sync every 6 hours">The vote bars on the site update automatically. The paper with the most 👍 reactions wins.</Step>
          </div>
          <div
            className="p-4 rounded-xl text-sm"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(232,234,246,0.6)" }}
          >
            You can vote for as many papers as you like, and change your vote at any time before voting closes by removing/adding 👍 reactions.
          </div>
        </section>

        {/* ── Badges ── */}
        <section>
          <SectionLabel>Badges</SectionLabel>
          <h2 className="text-2xl font-black text-white mb-8">Card Badges Explained</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Badge
              icon={<Sprout size={18} />}
              label="🌱 Seed"
              desc="Organizer suggestion — not yet formally nominated. Click + Nominate to claim it."
              color="#66BB6A"
              bg="rgba(76,175,80,0.07)"
              border="rgba(76,175,80,0.2)"
            />
            <Badge
              icon={<FileText size={18} />}
              label="🗳 Nominated"
              desc="A member has committed to present this paper at the Exploration session."
              color="#42A5F5"
              bg="rgba(66,165,245,0.07)"
              border="rgba(66,165,245,0.2)"
            />
            <Badge
              icon={<Zap size={18} />}
              label="⚡ Selected"
              desc="Won the community vote — will be deep-dived at the next session."
              color="#FF5722"
              bg="rgba(255,87,34,0.07)"
              border="rgba(255,87,34,0.2)"
            />
            <Badge
              icon={<CheckCircle2 size={18} />}
              label="✓ Done"
              desc="Session completed — notes, recording, and reproduced code available in the Archive."
              color="#4CAF50"
              bg="rgba(76,175,80,0.07)"
              border="rgba(76,175,80,0.2)"
            />
          </div>
        </section>

        {/* ── Pages ── */}
        <section>
          <SectionLabel>Navigation</SectionLabel>
          <h2 className="text-2xl font-black text-white mb-8">Pages at a Glance</h2>
          <div className="flex flex-col gap-3">
            {[
              { href: "/", label: "Home", icon: <MapPin size={15} />, desc: "Overview, active cycle status, recent archive entries, and countdown to next session.", color: "#FF5722" },
              { href: "/seeds", label: "Seeds", icon: <Sprout size={15} />, desc: "Browse all nominations for active cycles. Nominate seeds, vote during voting phase.", color: "#66BB6A" },
              { href: "/cycle", label: "Cycle", icon: <GitFork size={15} />, desc: "Full detail of every cycle — nominations, vote bars, session agenda, and Deep Dive spotlight.", color: "#42A5F5" },
              { href: "/roadmap", label: "Roadmap", icon: <Calendar size={15} />, desc: "Year-at-a-glance view of all 8 cycles, their themes, and status.", color: "#FF9800" },
              { href: "/archive", label: "Archive", icon: <BookOpen size={15} />, desc: "All past sessions — recordings, notes, vibe scores, and reproduced code repos.", color: "#4CAF50" },
            ].map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className="flex items-center gap-4 p-4 rounded-2xl transition-all group"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `rgba(${page.color === "#FF5722" ? "255,87,34" : page.color === "#66BB6A" ? "76,175,80" : page.color === "#42A5F5" ? "66,165,245" : page.color === "#FF9800" ? "255,152,0" : "76,175,80"},0.12)`, color: page.color }}
                >
                  {page.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white group-hover:text-white">{page.label}</p>
                  <p className="text-xs mt-0.5 leading-snug" style={{ color: "rgba(232,234,246,0.5)" }}>{page.desc}</p>
                </div>
                <ArrowRight size={14} className="shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: page.color }} />
              </Link>
            ))}
          </div>
        </section>

        {/* ── Joining a session ── */}
        <section>
          <SectionLabel>Sessions</SectionLabel>
          <h2 className="text-2xl font-black text-white mb-2">Joining a Session</h2>
          <p className="text-sm mb-6" style={{ color: "rgba(232,234,246,0.55)" }}>
            Both session types are open to all community members.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div
              className="p-5 rounded-2xl"
              style={{ background: "rgba(66,165,245,0.07)", border: "1px solid rgba(66,165,245,0.2)" }}
            >
              <p className="text-sm font-black mb-2" style={{ color: "#42A5F5" }}>Exploration Session</p>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(232,234,246,0.6)" }}>
                Each nominator presents their paper (~10 min each). Attend to hear all papers before casting your vote.
                The date is shown as <strong className="text-white">Exploration</strong> on cycle cards.
              </p>
            </div>
            <div
              className="p-5 rounded-2xl"
              style={{ background: "rgba(255,87,34,0.07)", border: "1px solid rgba(255,87,34,0.2)" }}
            >
              <p className="text-sm font-black mb-2" style={{ color: "#FF5722" }}>Deep Dive Session</p>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(232,234,246,0.6)" }}>
                Full 90-minute session for the winning paper — code reproduction, deep Q&A, and a published artifact.
                Click <strong className="text-white">Join Session</strong> on the Cycle page for the meeting link.
              </p>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section>
          <SectionLabel>FAQ</SectionLabel>
          <h2 className="text-2xl font-black text-white mb-8">Frequently Asked Questions</h2>
          <div className="flex flex-col gap-4">
            <FAQ q="Can I nominate more than one paper per cycle?">
              Yes, but each nomination is a commitment to present — only nominate papers you can actually present at the Exploration session.
            </FAQ>
            <FAQ q="What makes a good nomination?">
              Recent papers (past 12 months) with available code or arXiv preprints, and a clear &quot;why now&quot; angle, tend to get the most votes after the Exploration session.
            </FAQ>
            <FAQ q="I submitted a GitHub issue but the paper didn't appear on the site?">
              Make sure the issue has the <strong className="text-white">nomination</strong> label applied. The automation fires on label events. If it&apos;s missing, add it manually or ask an organizer.
            </FAQ>
            <FAQ q="Votes haven't updated on the site?">
              Votes sync every 6 hours. If your 👍 was very recent, wait for the next sync window.
            </FAQ>
            <FAQ q="Can I change my vote?">
              Yes — remove your 👍 reaction from one issue and add it to another at any time before voting closes.
            </FAQ>
            <FAQ q="What are Planned cycles on the Roadmap?">
              Cycles more than one month out are marked Planned. Their dates are not fixed yet — check back as they become active to see the theme and start nominating.
            </FAQ>
          </div>
        </section>

        {/* ── CTA ── */}
        <section>
          <div
            className="rounded-3xl p-10 text-center relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(26,35,126,0.65) 0%, rgba(255,87,34,0.12) 100%)",
              border: "1px solid rgba(255,87,34,0.2)",
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse 60% 60% at 50% 100%, rgba(255,87,34,0.1) 0%, transparent 70%)" }}
            />
            <h2 className="text-2xl font-black text-white mb-3 relative">Ready to jump in?</h2>
            <p className="text-sm mb-8 relative max-w-md mx-auto" style={{ color: "rgba(232,234,246,0.6)" }}>
              Browse the current nominations on the Seeds page or check the Roadmap to see what&apos;s coming up.
            </p>
            <div className="flex flex-wrap gap-4 justify-center relative">
              <Link href="/seeds" className="btn-orange text-white font-bold px-8 py-3 rounded-full text-sm inline-flex items-center gap-2">
                Go to Seeds <ArrowRight size={14} />
              </Link>
              <Link href="/roadmap" className="btn-ghost text-white font-semibold px-8 py-3 rounded-full text-sm">
                View Roadmap
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
