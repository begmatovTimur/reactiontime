"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { ATTEMPTS, average, formatTime } from "@/lib/standings";
import type { Team } from "@/lib/teams";
import { TeamLogo } from "./Icons";

type Phase = "idle" | "sequence" | "hold" | "go" | "result" | "done";

interface Props {
  name: string;
  team: Team;
  onFinish: (times: number[]) => void;
}

const Kbd = () => <kbd>Space</kbd>;

export default function RaceScreen({ name, team, onFinish }: Props) {
  const [lit, setLit] = useState(0);
  const [times, setTimes] = useState<number[]>([]);
  const [big, setBig] = useState<{ text: string; jump: boolean }>({ text: "0.000", jump: false });
  const [hint, setHint] = useState<ReactNode>(
    <>
      Press <Kbd /> when you&apos;re ready, then again when the lights go out.
    </>,
  );

  const phase = useRef<Phase>("idle");
  const timesRef = useRef<number[]>([]);
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

  const afterAttempt = useCallback((next: number[], prefix: string) => {
    timesRef.current = next;
    setTimes(next);
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
        clearTimers();
        setLit(0);
        setBig({ text: "Jump start", jump: true });
        afterAttempt([...timesRef.current, 0], "Jump start, recorded as 0.000 s.");
        break;
      case "go": {
        const ms = performance.now() - goAt.current;
        setBig({ text: formatTime(ms), jump: false });
        afterAttempt([...timesRef.current, ms], "");
        break;
      }
      case "done":
        phase.current = "idle";
        onFinish(timesRef.current);
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
            <TeamLogo team={team} size="lg" />
            <span>{name}</span>
            <span className="soft">·</span>
            <span className="soft">{team.name}</span>
          </div>
          <div className="pips">
            <small>Starts</small>
            {Array.from({ length: ATTEMPTS }, (_, i) => (
              <i
                key={i}
                className={
                  "pip" +
                  (i < n ? (times[i] === 0 ? " jumped" : " done") : i === n ? " now" : "")
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
                      <span className="muted">—</span>
                    ) : times[i] === 0 ? (
                      <span className="jump">JUMP</span>
                    ) : (
                      formatTime(times[i])
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
