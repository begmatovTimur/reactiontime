"use client";

import { useEffect, useState } from "react";

interface Props {
  onStandings: boolean;
  sessionNo: number;
  classified: number;
  onGrid: () => void;
  onShowStandings: () => void;
  onStart: () => void;
}

export default function Header({ onStandings, sessionNo, classified, onGrid, onShowStandings, onStart }: Props) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(id);
  }, []);

  const time = now ? now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }) : "--:--";
  const date = now ? now.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }).toUpperCase() : "";

  return (
    <>
      <header className="nav">
        <div className="nav-inner">
          <div className="logo" aria-label="Reaction Tracker">
            <span className="logo-mark" aria-hidden="true" />
            <b>Reaction Tracker</b>
          </div>
          <nav className="tabs" aria-label="Sections">
            <button className={`tab${onStandings ? "" : " active"}`} onClick={onGrid}>
              Grid
            </button>
            <button className={`tab${onStandings ? " active" : ""}`} onClick={onShowStandings}>
              Standings
            </button>
          </nav>
          <span className="nav-spacer" />
          <button className="btn nav-cta" onClick={onStart}>
            Start a game
          </button>
        </div>
      </header>

      <div className="subbar">
        <div className="subbar-inner">
          <div>
            <div className="sess-top">
              <span>S{String(sessionNo).padStart(2, "0")}</span>
              <i />
              <span>{date}</span>
            </div>
            <div className="sess-name">
              <span className="dot" aria-hidden="true" />
              <span>Lights Out Challenge</span>
            </div>
          </div>
          <div className="clock">
            <span className="live">My time</span>
            <span>{time}</span>
            <span className="soft">Drivers classified</span>
            <span>{classified}</span>
          </div>
        </div>
      </div>
    </>
  );
}
