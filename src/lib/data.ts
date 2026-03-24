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
