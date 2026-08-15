import cyclesData from "../../data/cycles.json";
import archiveData from "../../data/archive.json";
import seedsData from "../../data/seeds.json";
import siteData from "../../data/site.json";
import membersData from "../../data/members.json";

export interface SiteStats {
  papersDigested: number;
  activeMembers: number;
  ossRepos: number;
}

// Declared below after archiveData is used — keeps papersDigested in sync automatically.

export interface Nomination {
  id: string;
  title: string;
  proposer: string;
  arxiv?: string;
  paper_url?: string;
  tags: string[];
  is_selected: boolean;
  votes: number;
  issue_number?: number;
}

export interface Session {
  location?: string;
  date: string;
  presenter: string;
  presenter_role: string;
  agenda: string[];
}

export interface Cycle {
  id: string;
  quarter?: string;
  cycle?: number;
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

export interface MemberEntry {
  name: string;
  sessions: string[]; // cycle IDs they attended
}

export const members = membersData as MemberEntry[];

export interface AttendanceEntry {
  name: string;
  sessionsAttended: number;
  sessionIds: string[];
  lastSeen: string; // most recent cycle ID
}

export function getAttendanceLeaderboard(): AttendanceEntry[] {
  return [...members]
    .map((m) => ({
      name: m.name,
      sessionsAttended: m.sessions.length,
      sessionIds: m.sessions,
      lastSeen: m.sessions[m.sessions.length - 1] ?? "",
    }))
    .sort((a, b) => b.sessionsAttended - a.sessionsAttended)
    .slice(0, 10);
}

// Auto-compute papersDigested and activeMembers from live data
export const siteStats: SiteStats = {
  ...siteData.stats,
  papersDigested: archiveData.length,
  activeMembers: Math.max(siteData.stats.activeMembers, membersData.length),
};



export interface LeaderboardEntry {
  name: string;
  nominations: number;      // total papers nominated
  votes: number;            // total 👍 votes received across all nominations
  wins: number;             // times a nominated paper was selected (is_selected)
  score: number;            // composite: votes + wins*3
  cyclesParticipated: number;
  topNominations: { title: string; votes: number; isSelected: boolean; cycleId: string }[];
}

export function getLeaderboard(): LeaderboardEntry[] {
  const map = new Map<string, LeaderboardEntry>();

  for (const cycle of cycles) {
    const participants = new Set<string>();
    for (const nom of cycle.nominations) {
      const name = (nom.proposer || "").trim();
      if (!name) continue;
      if (!map.has(name)) {
        map.set(name, {
          name,
          nominations: 0,
          votes: 0,
          wins: 0,
          score: 0,
          cyclesParticipated: 0,
          topNominations: [],
        });
      }
      const entry = map.get(name)!;
      entry.nominations += 1;
      entry.votes += nom.votes ?? 0;
      if (nom.is_selected) entry.wins += 1;
      entry.topNominations.push({
        title: nom.title,
        votes: nom.votes ?? 0,
        isSelected: nom.is_selected,
        cycleId: cycle.id,
      });
      participants.add(name);
    }
    for (const name of participants) {
      map.get(name)!.cyclesParticipated += 1;
    }
  }

  // Compute score and sort topNominations
  for (const entry of map.values()) {
    entry.score = entry.nominations * 1 + entry.wins * 3;
    entry.topNominations.sort((a, b) => b.votes - a.votes);
    entry.topNominations = entry.topNominations.slice(0, 3);
  }

  return [...map.values()]
    .sort((a, b) => b.score - a.score || b.nominations - a.nominations)
    .slice(0, 10);
}

export function cycleLabel(cycle: Cycle): string {
  // Prefer explicit month if present, else fallback to session_date
  if (cycle.month && cycle.year) return `${cycle.month} ${cycle.year}`;
  if (cycle.session_date) {
    const d = new Date(cycle.session_date);
    return `${d.toLocaleString("en-US", { month: "long" })} ${d.getFullYear()}`;
  }
  return cycle.id;
}
