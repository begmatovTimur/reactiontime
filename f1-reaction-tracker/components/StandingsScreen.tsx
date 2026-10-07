"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { JUMP_PENALTY_MS, formatTime, type Entry } from "@/lib/standings";
import { teamById } from "@/lib/teams";
import { TeamIcon } from "./Icons";

interface Props {
  standings: Entry[];
  freshId: string | null;
  onStart: () => void;
  onClear: () => void;
}

export default function StandingsScreen({ standings, freshId, onStart, onClear }: Props) {
  const [confirming, setConfirming] = useState(false);
  const freshRef = useRef<HTMLTableRowElement>(null);
  const sorted = [...standings].sort((a, b) => a.avg - b.avg);
  const leader = sorted[0];

  useEffect(() => {
    freshRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [freshId]);

  return (
    <section>
      <div className="page-head">
        <h1>2026 Reaction standings</h1>
        <button className="btn" onClick={onStart}>
          Start a game
        </button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Pos.</th>
                <th>Driver</th>
                <th>Team</th>
                <th className="num tries">Starts</th>
                <th className="num">Gap</th>
                <th className="num">Avg (s)</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, i) => {
                const team = teamById(r.team);
                const fresh = r.id === freshId;
                return (
                  <tr key={r.id} ref={fresh ? freshRef : undefined} className={fresh ? "fresh" : undefined}>
                    <td className="pos">{i + 1}</td>
                    <td className="drv">
                      {r.name}
                    </td>
                    <td className="team-col">
                      <div className="cell" title={team.name}>
                        <TeamIcon team={team} />
                        <span className="tname">{team.name}</span>
                      </div>
                    </td>
                    <td className="num tries">
                      {r.times.map((t, j) => (
                        <Fragment key={j}>
                          {j > 0 && " · "}
                          {t === 0 ? (
                            <span className="jump">JUMP</span>
                          ) : r.penalties?.[j] ? (
                            <span className="jump" title={`includes +${formatTime(r.penalties[j])} s jump-start penalty`}>
                              {formatTime(t)}*
                            </span>
                          ) : (
                            formatTime(t)
                          )}
                        </Fragment>
                      ))}
                    </td>
                    <td className="num gap">{i === 0 ? "Leader" : `+${formatTime(r.avg - leader.avg)}`}</td>
                    <td className="num avg">{formatTime(r.avg)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {sorted.length === 0 && (
          <div className="empty-state">
            No times yet. Press <b>Start a game</b> to set the first one.
          </div>
        )}
      </div>

      <div className="foot">
        <span>
          Ranked by the average of three starts. A jump start adds {formatTime(JUMP_PENALTY_MS)} s to that start
          and it is re-run. Times with * include a penalty.
        </span>
        {sorted.length > 0 &&
          (confirming ? (
            <span className="confirm">
              Remove every time?
              <button className="linkish" onClick={() => { setConfirming(false); onClear(); }}>
                Yes, clear
              </button>
              <button className="linkish" onClick={() => setConfirming(false)}>
                Keep
              </button>
            </span>
          ) : (
            <button className="linkish" onClick={() => setConfirming(true)}>
              Clear standings
            </button>
          ))}
      </div>
    </section>
  );
}
