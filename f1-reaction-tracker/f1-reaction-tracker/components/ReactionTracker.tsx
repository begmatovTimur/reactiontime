"use client";

import { useCallback, useEffect, useState } from "react";
import { average, loadStandings, saveStandings, type Entry } from "@/lib/standings";
import { teamById, type TeamId } from "@/lib/teams";
import Header from "./Header";
import SetupScreen from "./SetupScreen";
import RaceScreen from "./RaceScreen";
import StandingsScreen from "./StandingsScreen";

type Screen =
  | { kind: "loading" }
  | { kind: "setup" }
  | { kind: "race"; name: string; team: TeamId; key: number }
  | { kind: "standings"; freshId: string | null };

export default function ReactionTracker() {
  const [standings, setStandings] = useState<Entry[]>([]);
  const [screen, setScreen] = useState<Screen>({ kind: "loading" });

  // localStorage only exists in the browser, so read it after mount.
  useEffect(() => {
    const saved = loadStandings();
    setStandings(saved);
    setScreen(saved.length ? { kind: "standings", freshId: null } : { kind: "setup" });
  }, []);

  const update = (next: Entry[]) => {
    setStandings(next);
    saveStandings(next);
  };

  const openSetup = () => setScreen({ kind: "setup" });
  const openStandings = () => setScreen({ kind: "standings", freshId: null });

  const finishRun = useCallback(
    (name: string, team: TeamId, times: number[]) => {
      const entry: Entry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name,
        team,
        times: times.map(Math.round),
        avg: average(times),
      };
      setStandings((prev) => {
        const next = [...prev, entry];
        saveStandings(next);
        return next;
      });
      setScreen({ kind: "standings", freshId: entry.id });
    },
    [],
  );

  const onStandings = screen.kind === "standings";

  return (
    <>
      <Header
        onStandings={onStandings}
        sessionNo={standings.length + (onStandings ? 0 : 1)}
        classified={standings.length}
        onGrid={() => screen.kind !== "race" && openSetup()}
        onShowStandings={openStandings}
        onStart={openSetup}
      />
      <main>
        {screen.kind === "setup" && (
          <SetupScreen
            canViewStandings={standings.length > 0}
            onViewStandings={openStandings}
            onSubmit={(name, team) => setScreen({ kind: "race", name, team, key: Date.now() })}
          />
        )}
        {screen.kind === "race" && (
          <RaceScreen
            key={screen.key}
            name={screen.name}
            team={teamById(screen.team)}
            onFinish={(times) => finishRun(screen.name, screen.team, times)}
          />
        )}
        {screen.kind === "standings" && (
          <StandingsScreen
            standings={standings}
            freshId={screen.freshId}
            onStart={openSetup}
            onClear={() => update([])}
          />
        )}
      </main>
    </>
  );
}
