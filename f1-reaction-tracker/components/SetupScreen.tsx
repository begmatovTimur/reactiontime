"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { TEAMS, type TeamId } from "@/lib/teams";
import { TeamIcon } from "./Icons";

interface Props {
  canViewStandings: boolean;
  onSubmit: (name: string, team: TeamId) => void;
  onViewStandings: () => void;
}

export default function SetupScreen({ canViewStandings, onSubmit, onViewStandings }: Props) {
  const [name, setName] = useState("");
  const [team, setTeam] = useState<TeamId | null>(null);
  const [error, setError] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => nameRef.current?.focus(), []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const clean = name.trim().replace(/\s+/g, " ");
    if (clean.length < 2) {
      setError("Enter your telegram username to register.");
      nameRef.current?.focus();
      return;
    }
    if (!team) {
      setError("Pick the team you're driving for.");
      return;
    }
    onSubmit(clean, team);
  }

  return (
    <section>
      <div className="page-head">
        <h1>Driver registration</h1>
      </div>
      <div className="card">
        <form onSubmit={handleSubmit} noValidate>
          <div>
            <label className="label" htmlFor="fullName">
              Telegram Username
            </label>
            <input
              ref={nameRef}
              type="text"
              id="fullName"
              autoComplete="off"
              maxLength={40}
              placeholder="@helloWorld"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <fieldset>
            <legend className="label">Team</legend>
            <div className="teams">
              {TEAMS.map((t) => (
                <div className="team-opt" key={t.id}>
                  <input
                    type="radio"
                    name="team"
                    id={`team-${t.id}`}
                    value={t.id}
                    checked={team === t.id}
                    onChange={() => setTeam(t.id)}
                  />
                  <label htmlFor={`team-${t.id}`}>
                    <TeamIcon team={t} />
                    <span>{t.name}</span>
                  </label>
                </div>
              ))}
            </div>
          </fieldset>

          <p className="err" role="alert">
            {error}
          </p>

          <div className="actions">
            <button className="btn" type="submit">
              Go to the grid
            </button>
            {canViewStandings && (
              <button className="btn ghost" type="button" onClick={onViewStandings}>
                View standings
              </button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
