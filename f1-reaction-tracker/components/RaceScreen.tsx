"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { ATTEMPTS, JUMP_PENALTY_MS, average, formatTime } from "@/lib/standings";
import type { Team } from "@/lib/teams";
import { TeamIcon } from "./Icons";

type Phase = "idle" | "sequence" | "hold" | "go" | "result" | "done";

interface Props {
  name: string;
  team: Team;
  onFinish: (times: number[], penalties: number[]) => void;
}

const Kbd = () => <kbd>Space</kbd>;

export default function RaceScreen({ name, team, onFinish }: Props) {
  const [lit, setLit] = useState(0);
  const [times, setTimes] = useState<number[]>([]);
  const [penalties, setPenalties] = useState<number[]>([]);
  const [pending, setPending] = useState(0);
  const [big, setBig] = useState<{ text: string; jump: boolean }>({ text: "0.000", jump: false });
  const [hint, setHint] = useState<ReactNode>(
    <>
      Press <Kbd /> when you&apos;re ready, then again when the lights go out.
    </>,
  );

  const phase = useRef<Phase>("idle");
  const timesRef = useRef<number[]>([]);
  const penaltiesRef = useRef<number[]>([]);
  /** Penalty built up by jump starts on the start currently being run. */
  const pendingPenalty = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const goAt = useRef(0);
  const stageRef = useRef<HTMLDivElement>(null);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => {
    stageRef.current?.focus({ preventScroll: true });
    return clearTimers;
  }, []);

  const afterAttempt = useCallback((next: number[], nextPenalties: number[], prefix: ReactNode) => {
    timesRef.current = next;
    penaltiesRef.current = nextPenalties;
    setTimes(next);
    setPenalties(nextPenalties);
    if (next.length >= ATTEMPTS) {
      phase.current = "done";
      setHint(
        <>
          {prefix} Average <b>{formatTime(average(next))} s</b>. Press <Kbd /> to see the standings.
        </>,
      );
    } else {
      phase.current = "result";
      setHint(
        <>
          {prefix} Press <Kbd /> for start {next.length + 1} of {ATTEMPTS}.
        </>,
      );
    }
  }, []);

  const beginSequence = useCallback(() => {
    phase.current = "sequence";
    setLit(0);
    setBig({ text: "0.000", jump: false });
    setHint("Hold it… wait for lights out.");
    for (let i = 1; i <= 5; i++) {
      timers.current.push(setTimeout(() => setLit(i), 1000 * i));
    }
    // After the fifth light, hold for a random 0.2–3.0 s, like the real start procedure.
    const hold = 200 + Math.random() * 2800;
    timers.current.push(setTimeout(() => (phase.current = "hold"), 5000));
    timers.current.push(
      setTimeout(() => {
        flushSync(() => setLit(0)); // lights are off in the DOM before the clock starts
        goAt.current = performance.now();
        phase.current = "go";
        setHint(<b>GO!</b>);
      }, 5000 + hold),
    );
  }, []);

  const press = useCallback(() => {
    switch (phase.current) {
      case "idle":
      case "result":
        beginSequence();
        break;
      case "sequence":
      case "hold":
        // Jump start: the start doesn't count, a penalty is added and the driver re-runs it.
        clearTimers();
        setLit(0);
        pendingPenalty.current += JUMP_PENALTY_MS;
        setPending(pendingPenalty.current);
        phase.current = "result";
        setBig({ text: "Jump start", jump: true });
        setHint(
          <>
            +{formatTime(JUMP_PENALTY_MS)} s penalty on this start. Press <Kbd /> to run start{" "}
            {timesRef.current.length + 1} again.
          </>,
        );
        break;
      case "go": {
        const reaction = performance.now() - goAt.current;
        const penalty = pendingPenalty.current;
        const total = reaction + penalty;
        pendingPenalty.current = 0;
        setPending(0);
        setBig({ text: formatTime(total), jump: false });
        afterAttempt(
          [...timesRef.current, total],
          [...penaltiesRef.current, penalty],
          penalty > 0 ? (
            <>
              {formatTime(reaction)} + <span className="jump">{formatTime(penalty)} penalty</span>.
            </>
          ) : (
            ""
          ),
        );
        break;
      }
      case "done":
        phase.current = "idle";
        onFinish(timesRef.current, penaltiesRef.current);
        break;
    }
  }, [afterAttempt, beginSequence, onFinish]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space" && e.key !== " ") return;
      e.preventDefault();
      if (!e.repeat) press();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [press]);

  const n = times.length;

  return (
    <section>
      <div className="page-head">
        <h1>{n >= ATTEMPTS ? "All starts complete" : `Start ${n + 1} of ${ATTEMPTS}`}</h1>
      </div>
      <div className="card">
        <div className="race-top">
          <div className="driver">
            <span>{name}</span>
            <span className="soft">·</span>
            <TeamIcon team={team} />
            <span className="soft">{team.name}</span>
          </div>
          <div className="pips">
            <small>Starts</small>
            {Array.from({ length: ATTEMPTS }, (_, i) => (
              <i
                key={i}
                className={
                  "pip" +
                  (i < n ? (penalties[i] > 0 ? " jumped" : " done") : i === n ? (pending > 0 ? " now jumped" : " now") : "")
                }
              />
            ))}
          </div>
        </div>

        <div
          ref={stageRef}
          className="stage"
          role="button"
          tabIndex={0}
          aria-label="Start lights. Press Space or tap here."
          onPointerDown={(e) => {
            e.preventDefault();
            press();
          }}
        >
          <div className="gantry">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className={`pod${i < lit ? " on" : ""}`}>
                <i className="lamp" />
                <i className="lamp" />
                <i className="lamp red" />
                <i className="lamp red" />
              </div>
            ))}
          </div>
          <div className="status" aria-live="polite">
            <div className={`big${big.jump ? " jump" : ""}`}>{big.text}</div>
            <div className="hint">{hint}</div>
          </div>
        </div>

        <div className="splits">
          <table>
            <thead>
              <tr>
                <th>Start</th>
                <th className="num">Time</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: ATTEMPTS }, (_, i) => (
                <tr key={i}>
                  <td>Start {i + 1}</td>
                  <td className="num">
                    {times[i] == null ? (
                      i === n && pending > 0 ? (
                        <span className="jump">+{formatTime(pending)} penalty</span>
                      ) : (
                        <span className="muted">—</span>
                      )
                    ) : (
                      <>
                        {penalties[i] > 0 && <span className="jump">(+{formatTime(penalties[i])}) </span>}
                        {formatTime(times[i])}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
