"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useSearchParams } from "next/navigation";
import { CheckCircle2, Clock, XCircle, Loader2, ChevronRight } from "lucide-react";

const QUESTIONS = [
  { id: "interest", label: "Are you currently open to new opportunities? What excites you about this role?", type: "textarea" },
  { id: "salary", label: "What is your current salary expectation (annual CTC)?", type: "text", placeholder: "e.g. ₹20 LPA or $120,000" },
  { id: "notice", label: "What is your current notice period / availability to start?", type: "text", placeholder: "e.g. 30 days, Immediate" },
  { id: "location", label: "Are you open to relocating? What is your preferred work arrangement?", type: "text", placeholder: "e.g. Remote only, Open to Hybrid in Bengaluru" },
  { id: "motivation", label: "Describe one career achievement you are most proud of.", type: "textarea" },
  { id: "questions", label: "Do you have any questions for us about this role or company?", type: "textarea" },
];

type Status = "loading" | "ready" | "submitting" | "success" | "expired" | "error";

export default function CandidateFormPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const sessionId = params.sessionId as string;
  const jobTitle = searchParams.get("job") || "the role";

  const [status, setStatus] = useState<Status>("loading");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [evaluation, setEvaluation] = useState<any>(null);

  useEffect(() => {
    // Verify the session is valid
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/outreach/session/${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.status === "expired") {
          setStatus("expired");
        } else if (data.status === "waiting_for_form") {
          setStatus("ready");
        } else if (data.status === "completed") {
          setStatus("success");
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, [sessionId]);

  const handleNext = () => {
    if (step < QUESTIONS.length - 1) setStep(step + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    setStatus("submitting");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/outreach/submit-form`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, responses: answers }),
      });
      if (!res.ok) throw new Error(await res.text());
      const result = await res.json();
      setEvaluation(result);
      setStatus("success");
      // Notify the recruiter's tab via localStorage
      localStorage.setItem(
        `catalyst_form_result_${sessionId}`,
        JSON.stringify({ interest_score: result.interest_score, recommendation: result.recommendation })
      );
    } catch {
      setStatus("error");
    }
  };

  const currentQ = QUESTIONS[step];
  const progress = ((step + 1) / QUESTIONS.length) * 100;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0a0f 0%, #12071e 50%, #0a0a0f 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter', sans-serif", padding: "40px 20px",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <div style={{ width: "100%", maxWidth: 600 }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 16px", borderRadius: 99,
            background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)",
            color: "#a78bfa", fontSize: 13, fontWeight: 600, marginBottom: 16,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#a78bfa", display: "inline-block" }} />
            Catalyst Talent · Screening Form
          </div>
          <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 800, margin: 0 }}>
            Candidate Screening
          </h1>
          <p style={{ color: "#6b7280", fontSize: 15, marginTop: 8 }}>
            Application for <span style={{ color: "#a78bfa", fontWeight: 600 }}>{jobTitle}</span>
          </p>
        </motion.div>

        {/* Card */}
        <AnimatePresence mode="wait">
          {status === "loading" && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ ...card, textAlign: "center", padding: "60px 40px" }}>
              <Loader2 size={36} color="#a78bfa" style={{ margin: "0 auto 16px", animation: "spin 1s linear infinite" }} />
              <p style={{ color: "#9ca3af" }}>Verifying your invitation link...</p>
              <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
            </motion.div>
          )}

          {status === "expired" && (
            <motion.div key="expired" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ ...card, textAlign: "center", padding: "60px 40px" }}>
              <Clock size={52} color="#f97316" style={{ margin: "0 auto 20px" }} />
              <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 700 }}>Link Expired</h2>
              <p style={{ color: "#9ca3af", marginTop: 10, lineHeight: 1.6 }}>
                This screening form link has expired (24-hour limit). Please contact the recruiter if you're still interested.
              </p>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div key="error" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ ...card, textAlign: "center", padding: "60px 40px" }}>
              <XCircle size={52} color="#ef4444" style={{ margin: "0 auto 20px" }} />
              <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 700 }}>Invalid Link</h2>
              <p style={{ color: "#9ca3af", marginTop: 10 }}>This form link is invalid or has already been submitted.</p>
            </motion.div>
          )}

          {status === "ready" && (
            <motion.div key={`q-${step}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }} style={card}>
              {/* Progress bar */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ color: "#6b7280", fontSize: 12 }}>Question {step + 1} of {QUESTIONS.length}</span>
                  <span style={{ color: "#a78bfa", fontSize: 12, fontWeight: 600 }}>{Math.round(progress)}%</span>
                </div>
                <div style={{ height: 4, background: "#1f2937", borderRadius: 99, overflow: "hidden" }}>
                  <motion.div
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4 }}
                    style={{ height: "100%", background: "linear-gradient(90deg, #7c3aed, #a78bfa)", borderRadius: 99 }}
                  />
                </div>
              </div>

              {/* Question */}
              <label style={{ display: "block", color: "#fff", fontSize: 18, fontWeight: 700, marginBottom: 20, lineHeight: 1.5 }}>
                {currentQ.label}
              </label>

              {currentQ.type === "textarea" ? (
                <textarea
                  value={answers[currentQ.id] || ""}
                  onChange={(e) => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
                  placeholder="Type your answer here..."
                  rows={5}
                  style={{
                    width: "100%", background: "#111827", border: "1px solid #374151",
                    borderRadius: 10, color: "#fff", fontSize: 15, padding: "14px 16px",
                    resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box",
                  }}
                />
              ) : (
                <input
                  value={answers[currentQ.id] || ""}
                  onChange={(e) => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
                  placeholder={currentQ.placeholder || "Type your answer..."}
                  style={{
                    width: "100%", background: "#111827", border: "1px solid #374151",
                    borderRadius: 10, color: "#fff", fontSize: 15, padding: "14px 16px",
                    outline: "none", fontFamily: "inherit", boxSizing: "border-box",
                  }}
                />
              )}

              <motion.button
                onClick={handleNext}
                disabled={!answers[currentQ.id]?.trim()}
                whileHover={{ scale: answers[currentQ.id]?.trim() ? 1.02 : 1 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  marginTop: 24, width: "100%", padding: "14px",
                  background: answers[currentQ.id]?.trim()
                    ? "linear-gradient(135deg, #7c3aed, #5b21b6)"
                    : "#1f2937",
                  border: "none", borderRadius: 10, color: answers[currentQ.id]?.trim() ? "#fff" : "#4b5563",
                  fontWeight: 700, fontSize: 15, cursor: answers[currentQ.id]?.trim() ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  fontFamily: "inherit", transition: "background 0.2s",
                }}
              >
                {step === QUESTIONS.length - 1 ? "Submit Application" : "Next"} <ChevronRight size={16} />
              </motion.button>
            </motion.div>
          )}

          {status === "submitting" && (
            <motion.div key="submitting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ ...card, textAlign: "center", padding: "60px 40px" }}>
              <Loader2 size={36} color="#a78bfa" style={{ margin: "0 auto 16px", animation: "spin 1s linear infinite" }} />
              <p style={{ color: "#9ca3af" }}>Submitting your responses...</p>
              <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
            </motion.div>
          )}

          {status === "success" && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ ...card, textAlign: "center", padding: "48px 40px" }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.1 }}>
                <CheckCircle2 size={60} color="#22c55e" style={{ margin: "0 auto 20px" }} />
              </motion.div>
              <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 800 }}>Application Submitted!</h2>
              <p style={{ color: "#9ca3af", marginTop: 10, lineHeight: 1.6, fontSize: 15 }}>
                Thank you for taking the time to complete the screening. Our team will review your responses and be in touch shortly.
              </p>

              {evaluation && (
                <div style={{
                  marginTop: 32, padding: "20px 24px", background: "#111827",
                  border: "1px solid #1f2937", borderRadius: 12, textAlign: "left",
                }}>
                  <p style={{ color: "#6b7280", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                    AI Assessment Preview
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: "50%",
                      background: `conic-gradient(#22c55e ${evaluation.interest_score * 3.6}deg, #1f2937 0deg)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#111827", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ color: "#22c55e", fontWeight: 800, fontSize: 12 }}>{Math.round(evaluation.interest_score)}</span>
                      </div>
                    </div>
                    <div>
                      <div style={{ color: "#fff", fontWeight: 700 }}>{evaluation.interest_level} Interest</div>
                      <div style={{ color: "#6b7280", fontSize: 13 }}>Recommendation: <span style={{ color: evaluation.recommendation === "Proceed" ? "#22c55e" : evaluation.recommendation === "Consider" ? "#f97316" : "#ef4444" }}>{evaluation.recommendation}</span></div>
                    </div>
                  </div>
                  <p style={{ color: "#9ca3af", fontSize: 13, lineHeight: 1.6, margin: 0 }}>{evaluation.summary}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const card: React.CSSProperties = {
  background: "#0f0f1a",
  border: "1px solid #1f2937",
  borderRadius: 16,
  padding: "36px 40px",
  boxShadow: "0 24px 48px rgba(0,0,0,0.4)",
};
