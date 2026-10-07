export type TeamId =
  | "mclaren"
  | "ferrari"
  | "redbull"
  | "mercedes"
  | "aston"
  | "alpine"
  | "williams"
  | "rb"
  | "audi"
  | "haas"
  | "cadillac";

export interface Team {
  id: TeamId;
  name: string;
  /** Short mark shown in the fallback icon when no logo file exists yet. */
  mark: string;
  color: string;
  text: string;
  /**
   * Logo file names that match this team, compared after lowercasing and removing
   * spaces, dashes and other symbols. "Red Bull Racing.png" → "redbullracing".
   */
  logoNames: string[];
}

/** The 11 teams on the 2026 Formula 1 grid. */
export const TEAMS: Team[] = [
  { id: "mclaren", name: "McLaren", mark: "M", color: "#FF8000", text: "#000", logoNames: ["mclaren"] },
  { id: "ferrari", name: "Ferrari", mark: "F", color: "#E8002D", text: "#FFE600", logoNames: ["ferrari", "scuderiaferrari"] },
  { id: "redbull", name: "Red Bull Racing", mark: "RB", color: "#3671C6", text: "#FFD100", logoNames: ["redbullracing", "redbull"] },
  { id: "mercedes", name: "Mercedes", mark: "M", color: "#27F4D2", text: "#000", logoNames: ["mercedes", "mercedesamg"] },
  { id: "aston", name: "Aston Martin", mark: "AM", color: "#229971", text: "#CEDC00", logoNames: ["astonmartin", "aston"] },
  { id: "alpine", name: "Alpine", mark: "A", color: "#00A1E8", text: "#fff", logoNames: ["alpine"] },
  { id: "williams", name: "Williams", mark: "W", color: "#1868DB", text: "#fff", logoNames: ["williams"] },
  { id: "rb", name: "Racing Bulls", mark: "VR", color: "#6692FF", text: "#fff", logoNames: ["racingbulls", "rb", "vcarb", "visacashapprb"] },
  { id: "audi", name: "Audi", mark: "A", color: "#C9CCD1", text: "#E10600", logoNames: ["audi"] },
  { id: "haas", name: "Haas", mark: "H", color: "#B6BABD", text: "#E10600", logoNames: ["haas"] },
  { id: "cadillac", name: "Cadillac", mark: "C", color: "#E6E6E6", text: "#000", logoNames: ["cadillac"] },
];

export const teamById = (id: string): Team => TEAMS.find((t) => t.id === id) ?? TEAMS[0];
