"use client";

import { useState } from "react";
import { Search, Filter, X } from "lucide-react";

interface Props {
  conferences: string[];
  domains: string[];
  onFilter: (filters: { query: string; conference: string; domain: string }) => void;
}

export default function FilterBar({ conferences, domains, onFilter }: Props) {
  const [query, setQuery] = useState("");
  const [conference, setConference] = useState("");
  const [domain, setDomain] = useState("");

  function update(patch: { query?: string; conference?: string; domain?: string }) {
    const next = {
      query: patch.query ?? query,
      conference: patch.conference ?? conference,
      domain: patch.domain ?? domain,
    };
    setQuery(next.query);
    setConference(next.conference);
    setDomain(next.domain);
    onFilter(next);
  }

  function clear() {
    setQuery("");
    setConference("");
    setDomain("");
    onFilter({ query: "", conference: "", domain: "" });
  }

  const hasFilters = query || conference || domain;

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: "rgba(232,234,246,0.35)" }}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => update({ query: e.target.value })}
          placeholder="Search papers…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#e8eaf6",
          }}
        />
      </div>

      {/* Conference filter */}
      <div className="relative">
        <Filter
          size={13}
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "rgba(232,234,246,0.35)" }}
        />
        <select
          value={conference}
          onChange={(e) => update({ conference: e.target.value })}
          className="pl-8 pr-4 py-2.5 rounded-xl text-sm outline-none appearance-none cursor-pointer"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: conference ? "#e8eaf6" : "rgba(232,234,246,0.45)",
          }}
        >
          <option value="">All Conferences</option>
          {conferences.map((c) => (
            <option key={c} value={c} style={{ background: "#0d1340" }}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Domain filter */}
      <div className="relative">
        <select
          value={domain}
          onChange={(e) => update({ domain: e.target.value })}
          className="px-4 py-2.5 rounded-xl text-sm outline-none appearance-none cursor-pointer"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: domain ? "#e8eaf6" : "rgba(232,234,246,0.45)",
          }}
        >
          <option value="">All Domains</option>
          {domains.map((d) => (
            <option key={d} value={d} style={{ background: "#0d1340" }}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={clear}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2.5 rounded-xl transition-colors"
          style={{
            background: "rgba(255,87,34,0.1)",
            border: "1px solid rgba(255,87,34,0.3)",
            color: "#FF5722",
          }}
        >
          <X size={12} />
          Clear
        </button>
      )}
    </div>
  );
}
