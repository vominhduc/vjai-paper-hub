"use client";

export default function Footer() {
  return (
    <footer
      className="mt-auto"
      style={{
        background: "rgba(10,15,46,0.95)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
                style={{ background: "linear-gradient(135deg, #FF5722, #FF8A65)" }}
              >
                VJ
              </div>
              <span className="font-semibold text-white tracking-wide">
                VJAI <span style={{ color: "#FF5722" }}>Paper Hub</span>
              </span>
            </div>
            <p className="text-sm" style={{ color: "rgba(232,234,246,0.5)", lineHeight: 1.7 }}>
              A high-tech community reading the papers that matter in AI &amp; ML — every two weeks in 2026.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-widest">
              Quick Links
            </h4>
            <ul className="flex flex-col gap-2">
              {[
                { label: "Home", href: "/" },
                { label: "Roadmap", href: "/roadmap" },
                { label: "Papers Archive", href: "#papers" },
                { label: "Join Session", href: "#schedule" },
              ].map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-sm transition-colors duration-200"
                    style={{ color: "rgba(232,234,246,0.5)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#FF5722")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(232,234,246,0.5)")}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-widest">
              Community
            </h4>
            <ul className="flex flex-col gap-2">
              {[
                { label: "GitHub", href: "https://github.com" },
                { label: "Discord", href: "#" },
                { label: "LinkedIn", href: "#" },
                { label: "Nominate a Paper", href: "#" },
              ].map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target={l.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="text-sm transition-colors duration-200"
                    style={{ color: "rgba(232,234,246,0.5)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#FF5722")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(232,234,246,0.5)")}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="glow-line mb-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs" style={{ color: "rgba(232,234,246,0.35)" }}>
            © 2026 VJAI Paper Reading Hub. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: "rgba(232,234,246,0.35)" }}>
            Built with Next.js · Hosted on GitHub Pages
          </p>
        </div>
      </div>
    </footer>
  );
}
