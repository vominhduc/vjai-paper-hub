import cyclesData from "../../data/cycles.json";
import archiveData from "../../data/archive.json";
import seedsData from "../../data/seeds.json";

export type CycleStatus = "exploration" | "deep-dive";

export interface Nomination {
  id: string;
  title: string;
  proposer: string;
  arxiv: string;
  tags: string[];
  is_selected: boolean;
  votes: number;
}

export interface Session {
  date: string;
  presenter: string;
  presenter_role: string;
  agenda: string[];
}

export interface Cycle {
  id: string;
  quarter: string;
  cycle: number;
  status: CycleStatus;
  theme: string;
  nominations: Nomination[];
  session: Session;
}

export interface ArchivePaper {
  id: string;
  title: string;
  conference: string;
  year: number;
  status: string;
  presenter: string;
  tags: string[];
  date_read: string;
  vibeScore: number;
  resources: {
    arxiv: string;
    github: string;
    vjai_code: string;
    youtube: string;
    blog: string;
  };
  summary: string;
  tldr: string[];
}

export interface SeedPaper {
  id: string;
  title: string;
  conference: string;
  year: number;
  domain: string;
  tags: string[];
  arxiv: string;
  proposedBy: string;
  claimedBy: string | null;
  hackabilityScore: number;
  description: string;
}

export const cycles = cyclesData as Cycle[];
export const archive = archiveData as ArchivePaper[];
export const seeds = seedsData as SeedPaper[];

export function getActiveCycle(): Cycle | undefined {
  return cycles.find((c) => c.status === "exploration" || c.status === "deep-dive");
}

export function getDeepDiveCycle(): Cycle | undefined {
  return cycles.find((c) => c.status === "deep-dive");
}

/** Returns "Q1" | "Q2" | "Q3" | "Q4" for a given Date */
export function quarterOf(d: Date): string {
  const m = d.getMonth(); // 0-indexed
  if (m <= 2) return "Q1";
  if (m <= 5) return "Q2";
  if (m <= 8) return "Q3";
  return "Q4";
}

/** Returns archive papers whose date_read falls in a given quarter of a given year */
export function archiveForQuarter(q: string, year: number): ArchivePaper[] {
  const bounds: Record<string, [number, number]> = {
    Q1: [0, 2], Q2: [3, 5], Q3: [6, 8], Q4: [9, 11],
  };
  const [start, end] = bounds[q] ?? [0, 11];
  return archive.filter((p) => {
    const d = new Date(p.date_read);
    return d.getFullYear() === year && d.getMonth() >= start && d.getMonth() <= end;
  });
}

/** Quarter-level roadmap config — themes + target paper counts */
export interface QuarterMeta {
  q: string;       // "Q1" | "Q2" | "Q3" | "Q4"
  year: number;
  label: string;
  theme: string;
  conferences: string[];
  target: number;  // target number of papers per quarter
}

export const quarterMetas: QuarterMeta[] = [
  { q: "Q1", year: 2026, label: "Q1 2026", theme: "Foundation & Scale",         conferences: ["ICLR", "Preprint"],              target: 6 },
  { q: "Q2", year: 2026, label: "Q2 2026", theme: "Reasoning & Efficiency",      conferences: ["ICLR", "ICML"],                  target: 6 },
  { q: "Q3", year: 2026, label: "Q3 2026", theme: "Vision, Agents & Robotics",   conferences: ["CVPR", "ICML", "ACL"],           target: 6 },
  { q: "Q4", year: 2026, label: "Q4 2026", theme: "Frontiers & Research Picks",  conferences: ["NeurIPS", "EMNLP"],              target: 6 },
];
