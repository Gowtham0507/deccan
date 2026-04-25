"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, X, Send, Loader2, CheckCircle2 } from "lucide-react";

interface Props {
  candidateName: string;
  jobTitle: string;
  onSend: (email: string) => Promise<void>;
  onClose: () => void;
}

export default function EmailModal({ candidateName, jobTitle, onSend, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSend = async () => {
    if (!isValidEmail) return;
    setStatus("sending");
    setErrorMsg("");
    try {
      await onSend(email);
      setStatus("sent");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "Failed to send email.");
    }
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(4px)", zIndex: 200,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {/* Modal card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "100%", maxWidth: 480,
            background: "var(--black-2)",
            border: "1px solid var(--black-3)",
            borderRadius: "var(--radius-xl)",
            padding: "32px",
            boxShadow: "0 32px 64px rgba(0,0,0,0.6)",
            margin: "0 16px",
          }}
        >
          {/* Close */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: "rgba(124,58,237,0.15)",
              border: "1px solid rgba(124,58,237,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Mail size={22} color="var(--brand-purple-light)" />
            </div>
            <button
              onClick={onClose}
              style={{
                padding: 6, background: "transparent", border: "1px solid var(--black-3)",
                borderRadius: 8, cursor: "pointer", color: "var(--gray-3)",
              }}
            >
              <X size={16} />
            </button>
          </div>

          {status !== "sent" ? (
            <>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "var(--white)", marginBottom: 6 }}>
                Send Screening Form
              </h2>
              <p style={{ fontSize: 14, color: "var(--gray-3)", lineHeight: 1.6, marginBottom: 24 }}>
                Enter <strong style={{ color: "var(--white)" }}>{candidateName}</strong>'s email address.
                They will receive a branded invitation to complete the{" "}
                <span style={{ color: "var(--brand-purple-light)" }}>{jobTitle}</span> screening form.
              </p>

              {/* Email input */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--gray-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                  Candidate Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="candidate@example.com"
                  autoFocus
                  style={{
                    width: "100%", padding: "12px 16px",
                    background: "var(--black-3)", border: `1px solid ${isValidEmail ? "rgba(124,58,237,0.4)" : "var(--black-4)"}`,
                    borderRadius: "var(--radius-md)", color: "var(--white)",
                    fontSize: 15, outline: "none", fontFamily: "var(--font-body)",
                    transition: "border-color 0.2s", boxSizing: "border-box",
                  }}
                />
              </div>

              {/* What happens next */}
              <div style={{
                padding: "12px 16px", background: "var(--black-3)",
                border: "1px solid var(--black-4)", borderRadius: "var(--radius-md)", marginBottom: 24,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-2)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                  What happens next
                </div>
                {[
                  "Candidate receives a branded email with a secure form link",
                  "They complete 6 short questions (3–5 minutes)",
                  "AI evaluates responses and scores their interest",
                  "Dashboard updates automatically when they submit",
                ].map((step, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: i < 3 ? 6 : 0, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 11, color: "var(--brand-purple-light)", fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                    <span style={{ fontSize: 12, color: "var(--gray-3)", lineHeight: 1.5 }}>{step}</span>
                  </div>
                ))}
              </div>

              {errorMsg && (
                <p style={{ fontSize: 13, color: "var(--error)", marginBottom: 16, padding: "10px 14px", background: "rgba(239,68,68,0.1)", borderRadius: 8, border: "1px solid rgba(239,68,68,0.2)" }}>
                  ⚠ {errorMsg}
                </p>
              )}

              <motion.button
                onClick={handleSend}
                disabled={!isValidEmail || status === "sending"}
                whileHover={{ scale: isValidEmail ? 1.02 : 1 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: "100%", padding: "13px",
                  background: isValidEmail
                    ? "linear-gradient(135deg, var(--brand-purple), var(--brand-purple-dark))"
                    : "var(--black-3)",
                  border: "none", borderRadius: "var(--radius-md)",
                  color: isValidEmail ? "#fff" : "var(--gray-2)",
                  fontWeight: 700, fontSize: 15, cursor: isValidEmail ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  fontFamily: "var(--font-body)", transition: "background 0.2s",
                }}
              >
                {status === "sending" ? (
                  <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Sending...</>
                ) : (
                  <><Send size={15} /> Send Screening Email</>
                )}
              </motion.button>
            </>
          ) : (
            /* Success state */
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <CheckCircle2 size={56} color="var(--success)" style={{ margin: "0 auto 16px" }} />
              </motion.div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "var(--white)", marginBottom: 8 }}>
                Email Sent!
              </h2>
              <p style={{ fontSize: 14, color: "var(--gray-3)", lineHeight: 1.6, marginBottom: 6 }}>
                Screening form sent to
              </p>
              <p style={{ fontSize: 15, fontWeight: 600, color: "var(--brand-purple-light)", marginBottom: 24 }}>
                {email}
              </p>
              <p style={{ fontSize: 13, color: "var(--gray-2)", lineHeight: 1.6, marginBottom: 24 }}>
                The dashboard will automatically update when{" "}
                <strong style={{ color: "var(--white)" }}>{candidateName}</strong> submits the form.
              </p>
              <button
                onClick={onClose}
                style={{
                  padding: "10px 28px", background: "var(--black-3)",
                  border: "1px solid var(--black-4)", borderRadius: "var(--radius-md)",
                  color: "var(--white)", fontWeight: 600, fontSize: 14, cursor: "pointer",
                  fontFamily: "var(--font-body)",
                }}
              >
                Close
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
