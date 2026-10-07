import type { TeamId } from "./teams";

export const ATTEMPTS = 3;
const STORE_KEY = "f1-reaction-standings-v1";

export interface Entry {
  id: string;
  name: string;
  team: TeamId;
  /** Reaction times in ms. 0 means a jump start. */
  times: number[];
  /** Sum of all starts divided by ATTEMPTS (jump starts count as 0). */
  avg: number;
}

export const average = (times: number[]) => times.reduce((a, b) => a + b, 0) / ATTEMPTS;

export const formatTime = (ms: number) => (ms / 1000).toFixed(3);

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
