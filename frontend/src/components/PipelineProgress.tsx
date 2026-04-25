"use client";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { Brain, Database, Search, CheckCircle2, Loader2 } from "lucide-react";

const STAGES = [
  { id: "parsing", label: "Parsing Job Description", desc: "Groq Llama-3.3 70B extracting skills, domain & requirements", icon: Brain },
  { id: "seeding", label: "Loading Talent Pool", desc: "Embedding 2000+ highly unique candidate profiles into vector store", icon: Database },
  { id: "matching", label: "Matching & Scoring", desc: "Semantic search + LLM explainability scoring", icon: Search },
  { id: "done", label: "Shortlist Ready", desc: "Candidates ranked by match & interest potential", icon: CheckCircle2 },
];

const stageOrder = ["parsing", "seeding", "matching", "done"];

export default function PipelineProgress() {
  const { pipelineStage } = useAppStore();
  const currentIndex = stageOrder.indexOf(pipelineStage);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      style={{
        background: "var(--black-2)",
        border: "1px solid var(--black-4)",
        borderRadius: "var(--radius-xl)",
        padding: "32px 36px",
        marginBottom: 8,
      }}
    >
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, marginBottom: 28, color: "var(--white)" }}>
        Agent Pipeline Running...
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {STAGES.map((stage, i) => {
          const Icon = stage.icon;
          const isDone = i < currentIndex;
          const isActive = i === currentIndex;
          const isPending = i > currentIndex;

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{
                display: "flex", alignItems: "center", gap: 16,
                padding: "14px 18px",
                borderRadius: "var(--radius-md)",
                background: isActive ? "rgba(124,58,237,0.08)" : "transparent",
                border: isActive ? "1px solid rgba(124,58,237,0.2)" : "1px solid transparent",
                transition: "all var(--transition-base)",
              }}
            >
              {/* Icon */}
              <div style={{
                width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: isDone ? "rgba(16,185,129,0.15)" : isActive ? "rgba(124,58,237,0.2)" : "var(--black-3)",
                border: `1px solid ${isDone ? "rgba(16,185,129,0.3)" : isActive ? "rgba(124,58,237,0.4)" : "var(--black-4)"}`,
              }}>
                {isActive ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}>
                    <Loader2 size={18} color="var(--brand-purple-light)" />
                  </motion.div>
                ) : (
                  <Icon size={18} color={isDone ? "var(--success)" : "var(--gray-2)"} />
                )}
              </div>

              {/* Text */}
              <div style={{ flex: 1 }}>
                <div style={{
                  fontWeight: 600, fontSize: 14,
                  color: isDone ? "var(--success)" : isActive ? "var(--white)" : "var(--gray-2)",
                }}>
                  {stage.label}
                </div>
                {(isActive || isDone) && (
                  <div style={{ fontSize: 12, color: "var(--gray-3)", marginTop: 2 }}>{stage.desc}</div>
                )}
              </div>

              {/* Status badge */}
              {isDone && (
                <div style={{
                  fontSize: 11, fontWeight: 600, padding: "3px 10px",
                  borderRadius: 99, background: "rgba(16,185,129,0.12)",
                  border: "1px solid rgba(16,185,129,0.25)", color: "var(--success)",
                }}>DONE</div>
              )}
              {isActive && (
                <div style={{
                  fontSize: 11, fontWeight: 600, padding: "3px 10px",
                  borderRadius: 99, background: "rgba(124,58,237,0.12)",
                  border: "1px solid rgba(124,58,237,0.25)", color: "var(--brand-purple-light)",
                }}>RUNNING</div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
