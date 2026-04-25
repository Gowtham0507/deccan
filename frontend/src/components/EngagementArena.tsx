"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { api } from "@/lib/api";
import { ArrowLeft, Bot, User, Send, Zap, ZapOff, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import ScoreRing from "./ScoreRing";

interface Props { onBack: () => void; }

export default function EngagementArena({ onBack }: Props) {
  const {
    activeCandidateId, candidates, parsedJD,
    chatMessages, addChatMessage, outreachMode, setOutreachMode,
    isStreaming, setIsStreaming, activeSessionId, setActiveSession,
    updateCandidateInterest,
  } = useAppStore();

  const [manualInput, setManualInput] = useState("");
  const [evaluation, setEvaluation] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSendingManual, setIsSendingManual] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const activeSc = candidates.find((c) => c.candidate.id === activeCandidateId);
  const candidate = activeSc?.candidate;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const startSession = async () => {
    if (!candidate || !parsedJD) return;
    try {
      setIsStreaming(true);
      const res = await api.startOutreach(candidate.id, parsedJD, "manual", "job_001");
      setSessionId(res.session_id);
      setActiveSession(res.session_id, candidate.id);
      addChatMessage({ role: "recruiter", content: res.first_message, timestamp: new Date().toISOString() });
      setIsStreaming(false);
      toast.success("Session started. You are the Candidate!");
    } catch (err: any) {
      toast.error(err.message);
      setIsStreaming(false);
    }
  };

  const sendManualMessage = async () => {
    if (!manualInput.trim() || !sessionId) return;
    const msg = manualInput.trim();
    setManualInput("");
    setIsSendingManual(true);
    addChatMessage({ role: "candidate", content: msg, timestamp: new Date().toISOString() });
    try {
      const res = await api.sendManualMessage(sessionId, msg);
      addChatMessage({ role: "recruiter", content: res.recruiter_response, timestamp: new Date().toISOString() });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSendingManual(false);
    }
  };

  const handleAutoReply = async () => {
    if (!sessionId) return;
    setIsSendingManual(true);
    try {
      const res = await api.sendAutoReply(sessionId);
      addChatMessage({ role: "candidate", content: res.candidate_message, timestamp: new Date().toISOString() });
      addChatMessage({ role: "recruiter", content: res.recruiter_response, timestamp: new Date().toISOString() });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSendingManual(false);
    }
  };

  const finishAndEvaluate = async () => {
    if (!sessionId) return;
    try {
      const result = await api.evaluateSession(sessionId);
      setEvaluation(result);
      if (candidate) updateCandidateInterest(candidate.id, result.interest_score, "completed");
      toast.success("Interest evaluation complete!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (!candidate) {
    return (
      <div style={{ padding: "60px 40px", textAlign: "center", color: "var(--gray-3)" }}>
        <p>No candidate selected. Go back to the shortlist.</p>
        <button onClick={onBack} style={{ marginTop: 16, color: "var(--brand-purple-light)", background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>
          ← Back to Shortlist
        </button>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Top Bar */}
      <div style={{
        padding: "16px 28px", borderBottom: "1px solid var(--black-3)",
        display: "flex", alignItems: "center", gap: 16, background: "var(--black-1)",
      }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gray-3)", display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          <ArrowLeft size={16} /> Back
        </button>
        <div style={{ width: 1, height: 20, background: "var(--black-3)" }} />
        <div style={{ flex: 1 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: "var(--white)" }}>{candidate.name}</span>
          <span style={{ color: "var(--gray-3)", fontSize: 13, marginLeft: 8 }}>{candidate.current_role}</span>
        </div>
        {/* Mode Toggle (Removed) */}
        {chatMessages.length > 2 && !evaluation && (
          <motion.button
            onClick={finishAndEvaluate}
            whileHover={{ scale: 1.03 }}
            style={{
              padding: "8px 16px", borderRadius: "var(--radius-md)", cursor: "pointer",
              background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.3)",
              color: "var(--brand-orange)", fontWeight: 600, fontSize: 13, fontFamily: "var(--font-body)",
            }}
          >
            Evaluate Interest →
          </motion.button>
        )}
      </div>

      {/* Body: Split */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left: Candidate Profile */}
        <div style={{
          width: 280, flexShrink: 0, borderRight: "1px solid var(--black-3)",
          padding: "24px 20px", overflowY: "auto", background: "var(--black-1)",
          display: "flex", flexDirection: "column", gap: 20,
        }}>
          {/* Avatar + name */}
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%", margin: "0 auto 12px",
              background: "linear-gradient(135deg, var(--brand-purple-dark), var(--brand-orange))",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, fontWeight: 700, color: "#fff",
            }}>{candidate.name.charAt(0)}</div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{candidate.name}</div>
            <div style={{ color: "var(--gray-3)", fontSize: 12, marginTop: 4 }}>{candidate.current_role}</div>
            <div style={{ color: "var(--gray-2)", fontSize: 12 }}>@ {candidate.current_company}</div>
          </div>

          {/* Score(s) */}
          {activeSc && (
            <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
              <ScoreRing score={activeSc.match_score} size={58} color="var(--brand-purple)" label="Match" />
              {activeSc.interest_score !== null && (
                <ScoreRing score={activeSc.interest_score} size={58} color="var(--brand-orange)" label="Interest" />
              )}
            </div>
          )}

          {/* Details */}
          <InfoBlock label="Location" value={`${candidate.location} (${candidate.remote_preference})`} />
          <InfoBlock label="Experience" value={`${candidate.years_experience} years`} />
          <InfoBlock label="Salary Expectation" value={candidate.salary_expectation} />
          <InfoBlock label="Education" value={candidate.education} />

          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--gray-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Top Skills</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {candidate.skills.slice(0, 8).map((s) => (
                <span key={s} style={{ fontSize: 11, padding: "3px 9px", borderRadius: 99, background: "var(--black-3)", border: "1px solid var(--black-4)", color: "var(--gray-4)" }}>{s}</span>
              ))}
            </div>
          </div>

          {/* Evaluation result */}
          {evaluation && (
            <div style={{ padding: "14px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "var(--radius-md)" }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: "var(--success)", marginBottom: 6 }}>
                <CheckCircle2 size={14} style={{ display: "inline", marginRight: 6 }} />
                Interest: {evaluation.interest_level}
              </div>
              <div style={{ fontSize: 12, color: "var(--white-soft)", lineHeight: 1.6 }}>{evaluation.summary}</div>
              <div style={{ marginTop: 8, fontSize: 12, fontWeight: 600, color: evaluation.recommendation === "Proceed" ? "var(--success)" : evaluation.recommendation === "Consider" ? "var(--brand-orange)" : "var(--error)" }}>
                Recommendation: {evaluation.recommendation}
              </div>
            </div>
          )}

          {/* Start Button */}
          {!sessionId && (
            <motion.button
              onClick={startSession}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                width: "100%", padding: "12px", borderRadius: "var(--radius-md)",
                background: "linear-gradient(135deg, var(--brand-purple), var(--brand-purple-dark))",
                border: "none", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
                fontFamily: "var(--font-body)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              <Zap size={15} fill="currentColor" /> Start Outreach
            </motion.button>
          )}
        </div>

        {/* Right: Chat */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
            {chatMessages.length === 0 && !isStreaming && (
              <div style={{ textAlign: "center", color: "var(--gray-2)", marginTop: 60, fontSize: 14 }}>
                <Bot size={40} strokeWidth={1} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
                Click "Start Outreach" to begin the simulated conversation
              </div>
            )}
            {chatMessages.map((msg, i) => (
              <ChatBubble key={i} message={msg} />
            ))}
            {isStreaming && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--gray-3)", fontSize: 13 }}>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}>
                  <Loader2 size={16} />
                </motion.div>
                Agent is thinking...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Manual Input */}
          {sessionId && !evaluation && (
            <div style={{
              padding: "16px 28px", borderTop: "1px solid var(--black-3)",
              display: "flex", gap: 10, background: "var(--black-1)",
            }}>
              <input
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendManualMessage()}
                placeholder="Type your reply as the Candidate..."
                style={{
                  flex: 1, padding: "12px 16px",
                  background: "var(--black-2)", border: "1px solid var(--black-4)",
                  borderRadius: "var(--radius-md)", color: "var(--white)", fontSize: 14,
                  fontFamily: "var(--font-body)", outline: "none",
                }}
                onFocus={(e) => { e.target.style.borderColor = "var(--brand-purple)"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--black-4)"; }}
                disabled={isSendingManual}
              />
              <motion.button
                onClick={handleAutoReply}
                disabled={isSendingManual}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: "12px 16px", borderRadius: "var(--radius-md)", border: "1px solid var(--brand-orange)",
                  background: "rgba(249,115,22,0.15)", color: "var(--brand-orange)", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6, fontWeight: 600, fontSize: 13,
                  opacity: isSendingManual ? 0.5 : 1,
                }}
              >
                <Zap size={14} /> Auto Answer
              </motion.button>
              <motion.button
                onClick={sendManualMessage}
                disabled={isSendingManual || !manualInput.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: "12px 16px", borderRadius: "var(--radius-md)", border: "none",
                  background: "var(--brand-purple)", color: "#fff", cursor: "pointer",
                  opacity: isSendingManual || !manualInput.trim() ? 0.5 : 1,
                }}
              >
                {isSendingManual ? <Loader2 size={18} /> : <Send size={18} />}
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ message }: { message: { role: string; content: string; timestamp: string | null } }) {
  const isCandidate = message.role === "candidate"; // Human is candidate, floats right
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: "flex",
        flexDirection: isCandidate ? "row-reverse" : "row",
        alignItems: "flex-end", gap: 10,
      }}
    >
      <div style={{
        width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: isCandidate ? "rgba(249,115,22,0.15)" : "rgba(124,58,237,0.2)",
        border: `1px solid ${isCandidate ? "rgba(249,115,22,0.25)" : "rgba(124,58,237,0.3)"}`,
      }}>
        {isCandidate ? <User size={14} color="var(--brand-orange)" /> : <Bot size={14} color="var(--brand-purple-light)" />}
      </div>
      <div style={{
        maxWidth: "68%",
        padding: "12px 16px",
        borderRadius: isCandidate ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
        background: isCandidate ? "rgba(249,115,22,0.05)" : "rgba(124,58,237,0.12)",
        border: `1px solid ${isCandidate ? "rgba(249,115,22,0.15)" : "rgba(124,58,237,0.2)"}`,
        fontSize: 14, lineHeight: 1.65,
        color: "var(--white-soft)",
      }}>
        {message.content}
        {message.timestamp && (
          <div style={{ fontSize: 10, color: "var(--gray-2)", marginTop: 6, textAlign: isCandidate ? "right" : "left" }}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 600, color: "var(--gray-2)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 13, color: "var(--white-soft)" }}>{value}</div>
    </div>
  );
}
