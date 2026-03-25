"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Archive, Search, X, SortAsc } from "lucide-react";
import { archive } from "@/lib/data";
import FilterBar from "@/components/FilterBar";
import PaperCard from "@/components/PaperCard";

type SortKey = "vibeScore" | "year" | "title";

/* ─── Page ────────────────────────────────────────────────── */
export default function ArchivePage() {
  const [filters, setFilters] = useState<{
    query: string;
    conference: string;
    domain: string;
  }>({ query: "", conference: "all", domain: "all" });
  const [sort, setSort] = useState<SortKey>("vibeScore");

  /* Derive unique values for FilterBar */
  const conferences = useMemo(
    () => Array.from(new Set(archive.map((p) => p.conference))).sort(),
    []
  );
  const domains = useMemo(
    () => Array.from(new Set(archive.flatMap((p) => p.tags))).sort(),
    []
  );

  /* Filter + sort */
  const filtered = useMemo(() => {
    const { query, conference, domain } = filters;
    const q = query.toLowerCase();
    return [...archive]
      .filter((p) => {
        const matchQ =
          !q ||
          p.title.toLowerCase().includes(q) ||
          p.summary?.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q));
        const matchConf = conference === "all" || p.conference === conference;
        const matchDomain = domain === "all" || p.tags.includes(domain);
        return matchQ && matchConf && matchDomain;
      })
      .sort((a, b) => {
        if (sort === "vibeScore") return b.vibeScore - a.vibeScore;
        if (sort === "year") return b.year - a.year;
        return a.title.localeCompare(b.title);
      });
  }, [filters, sort]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(160deg, #070c26 0%, #0e1550 50%, #070c26 100%)",
        color: "#e8eaf6",
      }}
    >
      {/* Header */}
      <section className="relative pt-28 pb-14 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(26,35,126,0.5) 0%, transparent 70%)",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6">
          <div
            className="flex items-center gap-2 mb-4 text-xs font-semibold"
            style={{ color: "rgba(232,234,246,0.4)" }}
          >
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight size={12} />
            <span style={{ color: "#FF5722" }}>Archive</span>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <Archive size={20} style={{ color: "#FF5722" }} />
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: "#FF5722" }}
            >
              Knowledge Hub
            </span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-3">
            Paper <span className="gradient-text">Archive</span>
          </h1>
          <p className="text-base max-w-xl" style={{ color: "rgba(232,234,246,0.6)" }}>
            Papers the group has <strong style={{ color: "#e8eaf6" }}>read, presented, and reproduced</strong> —
            independent of the nomination cycle. Each entry includes session notes, reproduction
            code, and a vibe score from the group.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-8 mt-8">
            {[
              { value: archive.length, label: "Papers" },
              {
                value: archive.filter((p) => p.status === "Reproduced").length,
                label: "Reproduced",
              },
              { value: conferences.length, label: "Venues" },
              {
                value:
                  Math.round(
                    archive.reduce((a, p) => a + p.vibeScore, 0) / archive.length
                  ) + "%",
                label: "Avg Vibe",
              },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-black" style={{ color: "#FF5722" }}>
                  {s.value}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "rgba(232,234,246,0.4)" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filter bar */}
      <section
        className="sticky top-16 z-30 py-4"
        style={{
          background: "rgba(7,12,38,0.9)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-0">
            <FilterBar
              conferences={conferences}
              domains={domains}
              onFilter={(f) =>
                setFilters({ query: f.query, conference: f.conference, domain: f.domain })
              }
            />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 shrink-0">
            <SortAsc size={14} style={{ color: "rgba(232,234,246,0.4)" }} />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(232,234,246,0.8)",
              }}
            >
              <option value="vibeScore" style={{ background: "#0e1550" }}>
                Sort: Vibe Score
              </option>
              <option value="year" style={{ background: "#0e1550" }}>
                Sort: Newest
              </option>
              <option value="title" style={{ background: "#0e1550" }}>
                Sort: A–Z
              </option>
            </select>
          </div>

          <span className="text-xs shrink-0" style={{ color: "rgba(232,234,246,0.35)" }}>
            {filtered.length} of {archive.length}
          </span>
        </div>
      </section>

      {/* Grid */}
      <section className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-6">
          {filtered.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-5xl mb-5">📭</div>
              <p className="text-lg font-bold text-white mb-2">No papers found</p>
              <p className="text-sm" style={{ color: "rgba(232,234,246,0.45)" }}>
                Try a different search or clear the filters
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((paper) => (
                <PaperCard key={paper.id} paper={paper} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
