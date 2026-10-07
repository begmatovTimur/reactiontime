import type { TeamId } from "./teams";

export const ATTEMPTS = 3;
/** Added to a start's time for every jump start before it. The driver re-runs that start. */
export const JUMP_PENALTY_MS = 150;
const STORE_KEY = "f1-reaction-standings-v1";

export interface Entry {
  id: string;
  name: string;
  team: TeamId;
  /** Final time of each start in ms: reaction time plus any jump-start penalty. */
  times: number[];
  /** Penalty in ms included in each start's time (0 when clean). */
  penalties?: number[];
  /** Sum of all starts divided by ATTEMPTS. */
  avg: number;
}

export const average = (times: number[]) => times.reduce((a, b) => a + b, 0) / ATTEMPTS;

export const formatTime = (ms: number) => (ms / 1000).toFixed(3);

export const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export function loadStandings(): Entry[] {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(STORE_KEY) ?? "[]");
    return Array.isArray(v) ? (v as Entry[]) : [];
  } catch {
    return [];
  }
}

export function saveStandings(entries: Entry[]) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(entries));
  } catch {
    // storage unavailable (private mode etc.) — standings stay in memory only
  }
}
