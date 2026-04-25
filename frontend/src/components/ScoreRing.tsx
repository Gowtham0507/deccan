"use client";
import { motion } from "framer-motion";

interface Props {
  score: number;
  size?: number;
  color?: string;
  label?: string;
  strokeWidth?: number;
}

export default function ScoreRing({ score, size = 60, color = "var(--brand-purple)", label, strokeWidth = 4 }: Props) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="var(--black-3)" strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: size < 50 ? 11 : 13, fontWeight: 700, color: "var(--white)",
        }}>
          {Math.round(score)}
        </div>
      </div>
      {label && (
        <span style={{ fontSize: 10, fontWeight: 600, color: "var(--gray-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {label}
        </span>
      )}
    </div>
  );
}
