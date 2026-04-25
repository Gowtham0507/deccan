"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore, ScoredCandidate } from "@/store/useAppStore";
import { MapPin, Briefcase, ChevronDown, ChevronUp, MessageSquare, Star, Award, Mail, CheckCircle2, StickyNote } from "lucide-react";
import ScoreRing from "./ScoreRing";

interface Props { 
  onEngageCandidate: () => void; 
  onSendForm?: (sc: ScoredCandidate) => void;
}

export default function ShortlistDashboard({ onEngageCandidate, onSendForm }: Props) {
  const { candidates, parsedJD, setActiveSession, activeCandidateId, offset, setOffset, appendCandidates, shortlistCandidate, notes, setNote, formSessionMap } = useAppStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  if (!candidates.length) {
    return (
      <div style={{ padding: "60px 40px", textAlign: "center", color: "var(--gray-3)" }}>
        <Star size={48} strokeWidth={1} style={{ margin: "0 auto 16px" }} />
        <p>No candidates yet. Go to Scout to run the pipeline first.</p>
      </div>
    );
  }

  const handleLoadMore = async () => {
    if (!parsedJD) return;
    setIsLoadingMore(true);
    try {
      const nextOffset = offset + 10;
      const { api } = await import("@/lib/api");
      const newCandidates = await api.matchCandidates(parsedJD, nextOffset, 10);
      setOffset(nextOffset);
      appendCandidates(newCandidates);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div style={{ padding: "28px 40px" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>
              Talent Shortlist
            </h1>
            <p style={{ color: "var(--gray-3)", fontSize: 14, marginTop: 4 }}>
              {candidates.length} candidates ranked by AI Match Score for &nbsp;
              <span style={{ color: "var(--brand-purple-light)", fontWeight: 600 }}>{parsedJD?.title || "your role"}</span>
            </p>
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Stat label="Avg Match" value={`${Math.round(candidates.reduce((a, c) => a + c.match_score, 0) / candidates.length)}%`} color="var(--brand-purple-light)" />
            <Stat label="Top Score" value={`${Math.round(candidates[0]?.match_score ?? 0)}%`} color="var(--brand-orange)" />
          </div>
        </div>
      </div>

      {/* Candidate Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {candidates.map((sc, index) => (
          <CandidateCard
            key={sc.candidate.id}
            sc={sc}
            rank={index + 1}
            isExpanded={expandedId === sc.candidate.id}
            onToggleExpand={() => setExpandedId(expandedId === sc.candidate.id ? null : sc.candidate.id)}
            onEngage={() => {
              useAppStore.getState().setActiveSession("", sc.candidate.id);
              onEngageCandidate();
            }}
            onSendForm={() => onSendForm && onSendForm(sc)}
            onProceed={() => shortlistCandidate(sc, sc.outreach_status === "waiting_for_form" || sc.outreach_status === "expired" ? "form" : "chat")}
            note={notes[sc.candidate.id] || ""}
            onNoteChange={(n) => setNote(sc.candidate.id, n)}
            sessionId={formSessionMap[sc.candidate.id]}
          />
        ))}
      </div>

      {/* Load More Button */}
      <div style={{ marginTop: 24, textAlign: "center" }}>
        <motion.button
          onClick={handleLoadMore}
          disabled={isLoadingMore}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            padding: "12px 24px", borderRadius: "var(--radius-md)", cursor: "pointer",
            background: "var(--black-2)", border: "1px solid var(--black-4)",
            color: "var(--white)", fontWeight: 600, fontSize: 14, fontFamily: "var(--font-body)",
            display: "inline-flex", alignItems: "center", gap: 8,
            opacity: isLoadingMore ? 0.7 : 1,
          }}
        >
          {isLoadingMore ? "Loading..." : "Load Next 10"}
        </motion.button>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      padding: "10px 18px",
      background: "var(--black-2)",
      border: "1px solid var(--black-3)",
      borderRadius: "var(--radius-md)",
      textAlign: "center",
    }}>
      <div style={{ fontSize: 20, fontWeight: 800, color, fontFamily: "var(--font-display)" }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--gray-3)", fontWeight: 500, marginTop: 2 }}>{label}</div>
    </div>
  );
}

function CandidateCard({ sc, rank, isExpanded, onToggleExpand, onEngage, onSendForm, onProceed, note, onNoteChange, sessionId }: {
  sc: ScoredCandidate; rank: number; isExpanded: boolean;
  onToggleExpand: () => void; onEngage: () => void; onSendForm: () => void;
  onProceed: () => void; note: string; onNoteChange: (n: string) => void;
  sessionId?: string;
}) {
  const { candidate: c } = sc;
  
  // Status badge
  let statusBadge = null;
  if (sc.outreach_status === "waiting_for_form") {
    statusBadge = (
      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: "rgba(249,115,22,0.15)", color: "var(--brand-orange)", border: "1px solid rgba(249,115,22,0.3)", display: "inline-flex", alignItems: "center", gap: 4 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--brand-orange)", animation: "pulse 1.5s infinite" }} />
        Waiting...
      </span>
    );
  } else if (sc.outreach_status === "expired") {
    statusBadge = <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: "var(--black-3)", color: "var(--gray-3)", border: "1px solid var(--black-4)" }}>No Response</span>;
  } else if (sc.outreach_status === "completed") {
    statusBadge = <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: "rgba(34,197,94,0.15)", color: "var(--success)", border: "1px solid rgba(34,197,94,0.3)" }}>Interest Captured ✓</span>;
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.05 }}
      style={{
        background: "var(--black-2)",
        border: `1px solid ${isExpanded ? "rgba(124,58,237,0.35)" : "var(--black-3)"}`,
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        transition: "border-color var(--transition-base)",
      }}
    >
      {/* Main row */}
      <div style={{ padding: "18px 24px", display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
        {/* Rank */}
        <div style={{
          width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: rank <= 3 ? "rgba(249,115,22,0.15)" : "var(--black-3)",
          border: `1px solid ${rank <= 3 ? "rgba(249,115,22,0.3)" : "var(--black-4)"}`,
          fontSize: 13, fontWeight: 700,
          color: rank <= 3 ? "var(--brand-orange)" : "var(--gray-3)",
        }}>#{rank}</div>

        {/* Avatar */}
        <div style={{
          width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
          background: `linear-gradient(135deg, var(--brand-purple-dark), var(--brand-orange))`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, fontWeight: 700, color: "#fff",
        }}>
          {c.name.charAt(0)}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: "var(--white)", display: "flex", alignItems: "center", gap: 8 }}>
            {c.name} {statusBadge}
          </div>
          <div style={{ fontSize: 13, color: "var(--gray-3)", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
            <Briefcase size={12} /> {c.current_role} @ {c.current_company}
          </div>
          <div style={{ fontSize: 12, color: "var(--gray-2)", marginTop: 3, display: "flex", alignItems: "center", gap: 6 }}>
            <MapPin size={11} /> {c.location} · {c.years_experience}yr exp · {c.remote_preference}
          </div>
        </div>

        {/* Skills chips */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", maxWidth: 260 }}>
          {c.skills.slice(0, 4).map((s) => (
            <span key={s} style={{
              fontSize: 11, padding: "3px 10px", borderRadius: 99,
              background: "var(--black-3)", border: "1px solid var(--black-4)",
              color: "var(--gray-4)", fontWeight: 500,
            }}>{s}</span>
          ))}
          {c.skills.length > 4 && (
            <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 99, color: "var(--gray-2)" }}>+{c.skills.length - 4}</span>
          )}
        </div>

        {/* Scores */}
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <ScoreRing score={sc.match_score} size={52} color="var(--brand-purple)" label="Match" />
          </div>
          {sc.interest_score !== null && (
            <div style={{ textAlign: "center" }}>
              <ScoreRing score={sc.interest_score} size={52} color="var(--brand-orange)" label="Interest" />
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {sc.outreach_status === "pending" ? (
            <>
              <motion.button
                onClick={onEngage}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  padding: "8px 16px", borderRadius: "var(--radius-md)",
                  background: "linear-gradient(135deg, var(--brand-purple), var(--brand-purple-dark))",
                  border: "none", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-body)",
                }}
              >
                <MessageSquare size={13} /> Chat
              </motion.button>
              <motion.button
                onClick={onSendForm}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  padding: "8px 16px", borderRadius: "var(--radius-md)",
                  background: "var(--black-2)",
                  border: "1px solid var(--black-3)", color: "var(--white)", fontWeight: 600, fontSize: 13, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-body)",
                }}
              >
                <Mail size={13} /> Email Form
              </motion.button>
            </>
          ) : sc.outreach_status === "waiting_for_form" ? (
            <>
              {/* Email sent confirmation badge */}
              <span style={{
                fontSize: 12, padding: "6px 12px", borderRadius: "var(--radius-md)",
                background: "rgba(34,197,94,0.1)", color: "var(--success)",
                border: "1px solid rgba(34,197,94,0.25)",
                fontWeight: 600, display: "flex", alignItems: "center", gap: 5,
              }}>
                <Mail size={12} /> Email Sent ✓
              </span>
              {/* Mock form button */}
              {sessionId && (
                <motion.button
                  onClick={() => window.open(`/form/${sessionId}`, "_blank")}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    padding: "8px 16px", borderRadius: "var(--radius-md)",
                    background: "var(--black-2)", border: "1px solid var(--brand-orange)",
                    color: "var(--brand-orange)", fontWeight: 600, fontSize: 13, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-body)",
                  }}
                >
                  <Award size={13} /> Mock Email Form
                </motion.button>
              )}
            </>
          ) : sc.outreach_status === "completed" ? (
            <span style={{
              fontSize: 13, padding: "8px 14px", borderRadius: "var(--radius-md)",
              background: "rgba(34,197,94,0.1)", color: "var(--success)",
              border: "1px solid rgba(34,197,94,0.25)",
              fontWeight: 600, display: "flex", alignItems: "center", gap: 5,
            }}>
              ✓ Interest Captured
            </span>
          ) : (
            <div style={{ width: 80 }} />
          )}
          <button
            onClick={onToggleExpand}
            style={{
              padding: 8, borderRadius: "var(--radius-md)",
              background: "var(--black-3)", border: "1px solid var(--black-4)",
              color: "var(--gray-3)", cursor: "pointer",
            }}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "0 24px 20px", borderTop: "1px solid var(--black-3)", paddingTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* AI Explanation */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                  AI Match Explanation
                </div>
                <p style={{ fontSize: 14, color: "var(--white-soft)", lineHeight: 1.65 }}>{sc.match_explanation}</p>
              </div>
              {/* Breakdown */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                  Score Breakdown
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {Object.entries(sc.match_breakdown).map(([key, val]) => (
                    <BreakdownBar key={key} label={key.replace("_", " ")} value={val as number} />
                  ))}
                </div>
              </div>
              {/* Recruiter Notes — full width */}
              <div style={{ gridColumn: "1 / -1" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  <StickyNote size={12} /> Recruiter Notes
                </div>
                <textarea
                  value={note}
                  onChange={(e) => onNoteChange(e.target.value)}
                  placeholder="Add private notes about this candidate..."
                  rows={2}
                  style={{
                    width: "100%", background: "var(--black-3)", border: "1px solid var(--black-4)",
                    borderRadius: 8, color: "var(--white)", fontSize: 13, padding: "10px 14px",
                    resize: "vertical", outline: "none", fontFamily: "var(--font-body)",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              {/* Proceed to shortlist */}
              {sc.interest_score !== null && sc.outreach_status === "completed" && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <motion.button
                    onClick={onProceed}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      padding: "10px 20px", borderRadius: "var(--radius-md)",
                      background: "linear-gradient(135deg, #16a34a, #15803d)",
                      border: "none", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-body)",
                    }}
                  >
                    <CheckCircle2 size={14} /> Proceed to Pipeline →
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function BreakdownBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: "var(--gray-3)", textTransform: "capitalize" }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--white)" }}>{Math.round(value)}%</span>
      </div>
      <div style={{ height: 5, background: "var(--black-3)", borderRadius: 99, overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          style={{
            height: "100%", borderRadius: 99,
            background: value >= 80 ? "var(--success)" : value >= 60 ? "var(--brand-purple)" : "var(--brand-orange)",
          }}
        />
      </div>
    </div>
  );
}
