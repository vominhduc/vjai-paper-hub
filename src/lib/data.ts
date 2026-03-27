import cyclesData from "../../data/cycles.json";
import archiveData from "../../data/archive.json";
import seedsData from "../../data/seeds.json";
import siteData from "../../data/site.json";

export interface SiteStats {
  papersDigested: number;
  activeMembers: number;
  ossRepos: number;
}

export const siteStats: SiteStats = siteData.stats;

export interface Nomination {
  id: string;
  title: string;
  proposer: string;
  arxiv: string;
  tags: string[];
  is_selected: boolean;
  votes: number;
  issue_number?: number;
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
  month?: string;
  year?: number;
  theme: string;
  /** Last day nominations are accepted (inclusive) */
  nomination_end?: string;
  /** Voting opens on this date */
  exploration_start?: string;
  /** Voting closes exploration_start + 3 days; session on this date; archived after */
  session_date?: string;
  nominations: Nomination[];
  session: Session;
  status?: string; // Add status field for type safety
}

/**
 * Date-derived phase for a cycle (all comparisons are date-only, no time):
 *
 *  nominating  today <= nomination_end          nominations open, no voting
 *  voting      exploration_start <= today <= exploration_start+3d
 *  deep-dive   voting closed, session not yet done
 *  archived    today > session_date
 */
export type CyclePhase = "nominating" | "voting" | "deep-dive" | "archived";

function dateOnly(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function getCyclePhase(cycle: Cycle, now: Date = new Date()): CyclePhase {
  // Planned cycles with no dates set yet stay in "nominating" (no phase can be derived)
  if (!cycle.nomination_end || !cycle.exploration_start) return "nominating";

  const today      = dateOnly(now);
  const nomEnd     = dateOnly(new Date(cycle.nomination_end));
  const expStart   = dateOnly(new Date(cycle.exploration_start));
  const votingEnd  = dateOnly(new Date(cycle.exploration_start));
  votingEnd.setDate(votingEnd.getDate() + 3);

  if (!cycle.session_date) {
    if (today >= expStart) return "voting";
    return "nominating";
  }

  const sessDate = dateOnly(new Date(cycle.session_date));
  if (today > sessDate)  return "archived";
  if (today > votingEnd) return "deep-dive";
  if (today >= expStart) return "voting";
  return "nominating";
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
export const seeds   = seedsData as SeedPaper[];



export function cycleLabel(cycle: Cycle): string {
  // Prefer explicit month if present, else fallback to session_date
  if (cycle.month && cycle.year) return `${cycle.month} ${cycle.year}`;
  if (cycle.session_date) {
    const d = new Date(cycle.session_date);
    return `${d.toLocaleString("en-US", { month: "long" })} ${d.getFullYear()}`;
  }
  return cycle.id;
}
