"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Upload, Sparkles, ChevronRight, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAppStore } from "@/store/useAppStore";
import { api } from "@/lib/api";
import PipelineProgress from "./PipelineProgress";

const SAMPLE_JD = `Senior Machine Learning Engineer — TechCorp AI (Bengaluru / Remote)

We are building the next generation of real-time recommendation systems powering 100M+ users. We need a Senior ML Engineer to lead model development, deployment, and experimentation.

Requirements:
- 5+ years of experience in Machine Learning or MLOps
- Strong Python skills with PyTorch or TensorFlow
- Experience with distributed training (Spark, Horovod)
- Proficiency in MLflow, Kubeflow or similar MLOps platforms
- Solid understanding of NLP, recommendation systems, or computer vision
- Experience deploying models on AWS SageMaker or GCP Vertex AI
- Strong SQL and data engineering skills

Nice to have: LLM fine-tuning, RAG systems, real-time feature stores (Feast)

Compensation: 25-35 LPA | Hybrid/Remote | Bengaluru preferred`;

interface Props { onSuccess: () => void; }

export default function JDIngestion({ onSuccess }: Props) {
  const { rawJD, setRawJD, setParsedJD, setPipelineStage, setCandidates, pipelineStage } = useAppStore();
  const [isRunning, setIsRunning] = useState(false);
  const [charCount, setCharCount] = useState(rawJD.length);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRawJD(e.target.value);
    setCharCount(e.target.value.length);
  };

  const handleSample = () => {
    setRawJD(SAMPLE_JD);
    setCharCount(SAMPLE_JD.length);
  };

  const handleSubmit = async () => {
    if (rawJD.trim().length < 50) {
      toast.error("Please enter a valid job description (min 50 chars).");
      return;
    }
    setIsRunning(true);
    try {
      // Stage 1: Parse JD
      setPipelineStage("parsing");
      const parsedJD = await api.parseJD(rawJD);
      setParsedJD(parsedJD);

      // Stage 2: Seed candidates
      setPipelineStage("seeding");
      await api.seedCandidates();

      // Stage 3: Match
      setPipelineStage("matching");
      const candidates = await api.matchCandidates(parsedJD, 10);
      setCandidates(candidates);

      setPipelineStage("done");
      toast.success(`Found ${candidates.length} matching candidates!`);
      setTimeout(() => onSuccess(), 1200);
    } catch (err: any) {
      toast.error(err.message || "Pipeline failed. Check API keys.");
      setPipelineStage("idle");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{
        padding: "24px 40px 0",
        borderBottom: "1px solid var(--black-3)",
        paddingBottom: 24,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div style={{
            padding: "6px 12px",
            background: "rgba(124,58,237,0.12)",
            border: "1px solid rgba(124,58,237,0.25)",
            borderRadius: 99,
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 12, fontWeight: 600, color: "var(--brand-purple-light)",
            letterSpacing: "0.05em",
          }}>
            <Sparkles size={12} />
            AI-POWERED TALENT SCOUTING
          </div>
        </div>
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(28px, 3vw, 42px)",
          fontWeight: 800,
          color: "var(--white)",
          lineHeight: 1.15,
          letterSpacing: "-0.02em",
        }}>
          Paste your Job Description.<br />
          <span style={{ background: "linear-gradient(90deg, var(--brand-purple-light), var(--brand-orange-light))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Let the agent handle the rest.
          </span>
        </h1>
        <p style={{ color: "var(--gray-3)", marginTop: 8, fontSize: 15 }}>
          The AI agent parses, matches semantically, and simulates outreach conversations — in minutes.
        </p>
      </header>

      {/* Body */}
      <div style={{ flex: 1, padding: "32px 40px", display: "flex", flexDirection: "column", gap: 20 }}>
        <AnimatePresence>
          {isRunning && <PipelineProgress />}
        </AnimatePresence>

        {!isRunning && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Textarea area */}
            <div style={{ position: "relative" }}>
              <textarea
                ref={textareaRef}
                value={rawJD}
                onChange={handleChange}
                placeholder="Paste your job description here... (role, requirements, experience, location, compensation)"
                style={{
                  width: "100%",
                  minHeight: 320,
                  background: "var(--black-2)",
                  border: "1.5px solid var(--black-4)",
                  borderRadius: "var(--radius-lg)",
                  padding: "20px 24px",
                  color: "var(--white)",
                  fontSize: 15,
                  lineHeight: 1.7,
                  fontFamily: "var(--font-body)",
                  resize: "vertical",
                  outline: "none",
                  transition: "border-color var(--transition-base)",
                }}
                onFocus={(e) => { e.target.style.borderColor = "var(--brand-purple)"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--black-4)"; }}
              />
              <div style={{
                position: "absolute", bottom: 14, right: 18,
                fontSize: 12, color: "var(--gray-2)",
              }}>
                {charCount} chars
              </div>
            </div>

            {/* Actions row */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
              <button
                onClick={handleSample}
                style={{
                  padding: "10px 20px",
                  background: "transparent",
                  border: "1px solid var(--black-4)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--gray-3)",
                  fontSize: 13, fontWeight: 500, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 8,
                  transition: "all var(--transition-fast)",
                }}
                onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.borderColor = "var(--brand-purple)"; (e.target as HTMLButtonElement).style.color = "var(--brand-purple-light)"; }}
                onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.borderColor = "var(--black-4)"; (e.target as HTMLButtonElement).style.color = "var(--gray-3)"; }}
              >
                <Upload size={14} /> Load Sample JD
              </button>

              <div style={{ flex: 1 }} />

              <motion.button
                onClick={handleSubmit}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  padding: "12px 28px",
                  background: "linear-gradient(135deg, var(--brand-purple), var(--brand-purple-dark))",
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  color: "#fff",
                  fontSize: 15, fontWeight: 700, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 10,
                  boxShadow: "var(--shadow-purple)",
                  fontFamily: "var(--font-body)",
                }}
              >
                <Zap size={16} fill="currentColor" />
                Scout Talent
                <ChevronRight size={16} />
              </motion.button>
            </div>

            {/* Features row */}
            <div style={{
              display: "flex", gap: 16, marginTop: 32, flexWrap: "wrap",
            }}>
              {[
                { label: "JD Parsing", desc: "Gemini 1.5 Flash extracts hard & soft skills, experience, domain.", color: "var(--brand-purple)" },
                { label: "Semantic Matching", desc: "Vector search + LLM scoring with full explainability breakdown.", color: "var(--brand-orange)" },
                { label: "Simulated Outreach", desc: "Groq Llama-3 70B agents simulate a realistic recruiter-candidate chat.", color: "var(--success)" },
              ].map((f) => (
                <div key={f.label} style={{
                  flex: 1, minWidth: 200,
                  padding: "16px 20px",
                  background: "var(--black-2)",
                  border: "1px solid var(--black-3)",
                  borderRadius: "var(--radius-md)",
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: f.color, marginBottom: 10,
                    boxShadow: `0 0 8px ${f.color}`,
                  }} />
                  <div style={{ fontWeight: 600, fontSize: 13, color: "var(--white)", marginBottom: 4 }}>{f.label}</div>
                  <div style={{ fontSize: 12, color: "var(--gray-3)", lineHeight: 1.5 }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
