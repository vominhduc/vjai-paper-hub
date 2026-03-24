"use client";

import { useEffect, useState } from "react";
import { differenceInSeconds } from "date-fns";
import { Clock } from "lucide-react";

interface Props {
  targetDate: string; // ISO string e.g. "2026-04-12"
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(target: Date): TimeLeft {
  const diff = Math.max(0, differenceInSeconds(target, new Date()));
  return {
    days: Math.floor(diff / 86400),
    hours: Math.floor((diff % 86400) / 3600),
    minutes: Math.floor((diff % 3600) / 60),
    seconds: diff % 60,
  };
}

function Digit({ value, label }: { value: number; label: string }) {
  const display = String(value).padStart(2, "0");
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="glass-card rounded-xl w-16 h-16 flex items-center justify-center text-2xl font-black tabular-nums"
        style={{ color: "#FF5722", fontFamily: "var(--font-geist-mono)" }}
      >
        {display}
      </div>
      <span className="text-xs uppercase tracking-widest" style={{ color: "rgba(232,234,246,0.4)" }}>
        {label}
      </span>
    </div>
  );
}

export default function Countdown({ targetDate }: Props) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    calcTimeLeft(new Date(targetDate))
  );

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(calcTimeLeft(new Date(targetDate)));
    }, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const isPast = Object.values(timeLeft).every((v) => v === 0);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest"
        style={{ color: "rgba(232,234,246,0.5)" }}>
        <Clock size={12} />
        {isPast ? "Session is live!" : "Next session in"}
      </div>
      {isPast ? (
        <div
          className="text-lg font-bold animate-pulse"
          style={{ color: "#FF5722" }}
        >
          🔴 Join Now
        </div>
      ) : (
        <div className="flex items-end gap-3">
          <Digit value={timeLeft.days} label="days" />
          <span className="text-2xl font-black mb-4" style={{ color: "#FF5722" }}>:</span>
          <Digit value={timeLeft.hours} label="hrs" />
          <span className="text-2xl font-black mb-4" style={{ color: "#FF5722" }}>:</span>
          <Digit value={timeLeft.minutes} label="min" />
          <span className="text-2xl font-black mb-4" style={{ color: "#FF5722" }}>:</span>
          <Digit value={timeLeft.seconds} label="sec" />
        </div>
      )}
    </div>
  );
}
