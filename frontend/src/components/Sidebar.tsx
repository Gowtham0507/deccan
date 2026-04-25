"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, LayoutDashboard, MessageSquare, CheckCircle2, BarChart2, GitBranch, History, ChevronRight } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useState } from "react";

interface SidebarProps {
  currentView: string;
  onNavigate: (v: any) => void;
}

const navItems = [
  { id: "ingest",    label: "Scout",     icon: Zap,           description: "New JD" },
  { id: "shortlist", label: "Shortlist", icon: LayoutDashboard, description: "Candidates" },
  { id: "engagement",label: "Engage",   icon: MessageSquare,  description: "Chat" },
  { id: "pipeline",  label: "Pipeline", icon: CheckCircle2,   description: "Shortlisted" },
  { id: "analytics", label: "Analytics",icon: BarChart2,      description: "Insights" },
];

export default function Sidebar({ currentView, onNavigate }: SidebarProps) {
  const { matchWeight, interestWeight, setMatchWeight, jdHistory, loadFromHistory, shortlisted, candidates } = useAppStore();
  const [showHistory, setShowHistory] = useState(false);

  return (
    <aside style={{
      width: 200,
      background: "var(--black-1)",
      borderRight: "1px solid var(--black-3)",
      display: "flex",
      flexDirection: "column",
      padding: "20px 0",
      position: "sticky",
      top: 0,
      height: "100vh",
      zIndex: 50,
      overflowY: "auto",
    }}>
      {/* Logo */}
      <div style={{ padding: "0 16px 20px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 36, height: 36,
          background: "linear-gradient(135deg, var(--brand-purple), var(--brand-orange))",
          borderRadius: 10, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "#fff",
        }}>C</div>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--white)" }}>Catalyst</div>
          <div style={{ fontSize: 10, color: "var(--gray-2)", fontWeight: 500 }}>AI Talent Agent</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 8px" }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = currentView === item.id;
          return (
            <div key={item.id} style={{ position: "relative" }}>
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  style={{
                    position: "absolute", inset: 0,
                    background: "rgba(124,58,237,0.15)",
                    borderRadius: 8,
                    border: "1px solid rgba(124,58,237,0.3)",
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <button
                onClick={() => onNavigate(item.id)}
                style={{
                  position: "relative", zIndex: 1,
                  width: "100%", padding: "9px 12px",
                  display: "flex", alignItems: "center", gap: 10,
                  background: "transparent", border: "none", cursor: "pointer",
                  color: active ? "var(--brand-purple-light)" : "var(--gray-3)",
                  borderRadius: 8,
                  transition: "color var(--transition-fast)",
                  textAlign: "left",
                }}
              >
                <Icon size={17} strokeWidth={active ? 2.5 : 1.75} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: active ? 700 : 500 }}>{item.label}</div>
                  <div style={{ fontSize: 10, color: active ? "var(--brand-purple-light)" : "var(--gray-2)", opacity: 0.7 }}>{item.description}</div>
                </div>
                {/* Badge */}
                {item.id === "pipeline" && shortlisted.length > 0 && (
                  <span style={{
                    marginLeft: "auto", fontSize: 10, fontWeight: 700, padding: "2px 6px",
                    background: "rgba(34,197,94,0.2)", color: "var(--success)", borderRadius: 99,
                  }}>{shortlisted.length}</span>
                )}
              </button>
            </div>
          );
        })}
      </nav>

      {/* Score Tuner */}
      <div style={{ margin: "20px 8px 0", padding: "14px", background: "var(--black-2)", border: "1px solid var(--black-3)", borderRadius: 10 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--gray-2)", marginBottom: 12 }}>
          Score Tuner
        </div>
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: "var(--gray-3)" }}>Match Weight</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--brand-purple-light)" }}>{matchWeight}%</span>
          </div>
          <input
            type="range" min={10} max={90} value={matchWeight}
            onChange={(e) => setMatchWeight(Number(e.target.value))}
            style={{ width: "100%", accentColor: "var(--brand-purple)" }}
          />
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: "var(--gray-3)" }}>Interest Weight</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--brand-orange)" }}>{interestWeight}%</span>
          </div>
          <input
            type="range" min={10} max={90} value={interestWeight}
            onChange={(e) => setMatchWeight(100 - Number(e.target.value))}
            style={{ width: "100%", accentColor: "var(--brand-orange)" }}
          />
        </div>
        <div style={{ fontSize: 10, color: "var(--gray-2)", marginTop: 8, textAlign: "center" }}>
          Blended = {matchWeight}% Match + {interestWeight}% Interest
        </div>
      </div>

      {/* JD History */}
      {jdHistory.length > 0 && (
        <div style={{ margin: "12px 8px 0" }}>
          <button
            onClick={() => setShowHistory(!showHistory)}
            style={{
              width: "100%", padding: "10px 12px",
              background: "var(--black-2)", border: "1px solid var(--black-3)",
              borderRadius: 10, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8,
              color: "var(--gray-3)", fontSize: 11, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.06em",
            }}
          >
            <History size={13} />
            JD History ({jdHistory.length})
            <ChevronRight size={12} style={{ marginLeft: "auto", transform: showHistory ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
          </button>
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: "hidden" }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 6 }}>
                  {jdHistory.map((entry) => (
                    <button
                      key={entry.id}
                      onClick={() => { loadFromHistory(entry); onNavigate("shortlist"); }}
                      style={{
                        padding: "8px 12px", background: "var(--black-2)",
                        border: "1px solid var(--black-3)", borderRadius: 8,
                        cursor: "pointer", textAlign: "left",
                        color: "var(--white-soft)",
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--white)", marginBottom: 2 }}>
                        {entry.jd.title}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--gray-3)" }}>
                        {entry.candidates.length} candidates · {new Date(entry.createdAt).toLocaleDateString()}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: "auto", padding: "12px 16px", borderTop: "1px solid var(--black-3)" }}>
        <a href="https://github.com" target="_blank" rel="noreferrer"
          style={{ color: "var(--gray-2)", display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
          <GitBranch size={14} /> GitHub
        </a>
      </div>
    </aside>
  );
}
