"use client";

import { useState, type CSSProperties } from "react";
import type { Team } from "@/lib/teams";

/**
 * The team's logo from the team-logos folder. Until a file for this team exists,
 * a round icon in the team colour is shown instead.
 */
export function TeamLogo({ team, size = "sm" }: { team: Team; size?: "sm" | "lg" }) {
  const [missing, setMissing] = useState(false);

  if (missing) {
    return (
      <span
        className={`ic ${size}`}
        style={{ "--tc": team.color, "--tx": team.text } as CSSProperties}
        aria-hidden="true"
      >
        {team.mark}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- served at runtime from the team-logos folder
    <img
      className={`logo-img ${size}`}
      width={size === "lg" ? 32 : 26}
      height={size === "lg" ? 32 : 26}
      style={{ objectFit: "contain", flex: "none" }}
      src={`/api/team-logo/${team.id}`}
      alt={`${team.name} logo`}
      onError={() => setMissing(true)}
    />
  );
}

/** Older names, kept so screens that still import them render the team logo too. */
export const TeamIcon = ({ team }: { team: Team }) => <TeamLogo team={team} />;
export const DriverAvatar = ({ team }: { team: Team; name?: string }) => <TeamLogo team={team} />;
