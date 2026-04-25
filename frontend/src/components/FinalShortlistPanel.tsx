"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore, ShortlistedEntry } from "@/store/useAppStore";
import { Briefcase, MapPin, Trash2, Download, CheckCircle2, MessageSquare, Mail, Star } from "lucide-react";

export default function FinalShortlistPanel() {
  const { shortlisted, removeFromShortlist, parsedJD } = useAppStore();

  const handleExportCSV = () => {
    if (!shortlisted.length) return;
    const headers = ["Name", "Current Role", "Company", "Location", "Experience (yrs)", "Match Score", "Interest Score", "Blended Score", "Via", "JD Title", "Shortlisted At"];
    const rows = shortlisted.map((s) => [
      s.candidate.name,
      s.candidate.current_role,
      s.candidate.current_company,
      s.candidate.location,
      s.candidate.years_experience,
      `${s.match_score.toFixed(1)}%`,
      `${s.interest_score.toFixed(1)}%`,
      `${s.blended_score.toFixed(1)}%`,
      s.via,
      s.jd_title,
      new Date(s.shortlisted_at).toLocaleString(),
    ]);
    const csvContent = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `catalyst_pipeline_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!shortlisted.length) {
    return (
      <div style={{ padding: "80px 40px", textAlign: "center", color: "var(--gray-3)" }}>
        <CheckCircle2 size={52} strokeWidth={1} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--gray-2)", marginBottom: 8 }}>
          No candidates shortlisted yet
        </h2>
        <p style={{ fontSize: 14, maxWidth: 380, margin: "0 auto", lineHeight: 1.6 }}>
          After evaluating a candidate via Chat or Form, click <strong style={{ color: "var(--brand-purple-light)" }}>Proceed →</strong> on their card to add them here.
        </p>
      </div>
    );
  }

  const avgBlended = shortlisted.reduce((a, s) => a + s.blended_score, 0) / shortlisted.length;

  return (
    <div style={{ padding: "28px 40px" }}>
      {/* Header */}
      <div style={{ marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>
            Hired Pipeline
          </h1>
          <p style={{ color: "var(--gray-3)", fontSize: 14, marginTop: 4 }}>
            <span style={{ color: "var(--brand-purple-light)", fontWeight: 600 }}>{shortlisted.length}</span> candidates approved for{" "}
            <span style={{ color: "var(--brand-orange)", fontWeight: 600 }}>{parsedJD?.title || "your role"}</span>
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <StatBadge label="Total Shortlisted" value={shortlisted.length.toString()} color="var(--brand-purple-light)" />
          <StatBadge label="Avg Blended Score" value={`${Math.round(avgBlended)}%`} color="var(--brand-orange)" />
          <motion.button
            onClick={handleExportCSV}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: "10px 18px", borderRadius: "var(--radius-md)", cursor: "pointer",
              background: "linear-gradient(135deg, var(--brand-purple), var(--brand-purple-dark))",
              border: "none", color: "#fff", fontWeight: 600, fontSize: 13,
              display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-body)",
            }}
          >
            <Download size={14} /> Export CSV
          </motion.button>
        </div>
      </div>

      {/* Table Header */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 1fr auto",
        padding: "8px 20px",
        color: "var(--gray-2)", fontSize: 11, fontWeight: 700,
        textTransform: "uppercase", letterSpacing: "0.08em",
        borderBottom: "1px solid var(--black-3)",
        gap: 8,
      }}>
        <span>Candidate</span>
        <span>Role</span>
        <span>Match</span>
        <span>Interest</span>
        <span>Blended</span>
        <span>Via</span>
        <span />
      </div>

      {/* Rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
        <AnimatePresence>
          {shortlisted.map((entry, i) => (
            <ShortlistRow key={entry.candidate.id} entry={entry} index={i} onRemove={() => removeFromShortlist(entry.candidate.id)} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ShortlistRow({ entry, index, onRemove }: { entry: ShortlistedEntry; index: number; onRemove: () => void }) {
  const c = entry.candidate;
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.04 }}
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 1fr auto",
        padding: "14px 20px",
        alignItems: "center",
        gap: 8,
        background: "var(--black-2)",
        border: "1px solid var(--black-3)",
        borderRadius: "var(--radius-md)",
        transition: "border-color 0.2s",
      }}
    >
      {/* Candidate */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg, var(--brand-purple-dark), var(--brand-orange))",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15, fontWeight: 700, color: "#fff",
        }}>
          {c.name.charAt(0)}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--white)" }}>{c.name}</div>
          <div style={{ fontSize: 12, color: "var(--gray-3)", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
            <MapPin size={10} /> {c.location} · {c.years_experience}yr
          </div>
        </div>
      </div>

      {/* Role */}
      <div>
        <div style={{ fontSize: 13, color: "var(--white-soft)", fontWeight: 500 }}>{c.current_role}</div>
        <div style={{ fontSize: 11, color: "var(--gray-3)", marginTop: 2 }}>{c.current_company}</div>
      </div>

      {/* Scores */}
      <ScoreCell value={entry.match_score} color="var(--brand-purple)" />
      <ScoreCell value={entry.interest_score} color="var(--brand-orange)" />
      <ScoreCell value={entry.blended_score} color={entry.blended_score >= 80 ? "var(--success)" : entry.blended_score >= 60 ? "var(--brand-orange)" : "var(--gray-3)"} />

      {/* Via */}
      <div>
        <span style={{
          fontSize: 11, padding: "3px 10px", borderRadius: 99, fontWeight: 600,
          background: entry.via === "chat" ? "rgba(124,58,237,0.15)" : "rgba(249,115,22,0.15)",
          color: entry.via === "chat" ? "var(--brand-purple-light)" : "var(--brand-orange)",
          border: `1px solid ${entry.via === "chat" ? "rgba(124,58,237,0.3)" : "rgba(249,115,22,0.3)"}`,
          display: "inline-flex", alignItems: "center", gap: 4,
        }}>
          {entry.via === "chat" ? <MessageSquare size={10} /> : <Mail size={10} />}
          {entry.via === "chat" ? "Chat" : "Form"}
        </span>
      </div>

      {/* Actions */}
      <button
        onClick={onRemove}
        style={{
          padding: 6, borderRadius: "var(--radius-sm)",
          background: "transparent", border: "1px solid transparent",
          color: "var(--gray-2)", cursor: "pointer",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.color = "#ef4444"; (e.target as HTMLButtonElement).style.borderColor = "rgba(239,68,68,0.3)"; }}
        onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.color = "var(--gray-2)"; (e.target as HTMLButtonElement).style.borderColor = "transparent"; }}
        title="Remove from pipeline"
      >
        <Trash2 size={14} />
      </button>
    </motion.div>
  );
}

function ScoreCell({ value, color }: { value: number; color: string }) {
  return (
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color, fontFamily: "var(--font-display)" }}>
        {Math.round(value)}%
      </div>
      <div style={{ height: 3, background: "var(--black-3)", borderRadius: 99, marginTop: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${value}%`, background: color, borderRadius: 99 }} />
      </div>
    </div>
  );
}

function StatBadge({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      padding: "10px 16px", background: "var(--black-2)", border: "1px solid var(--black-3)",
      borderRadius: "var(--radius-md)", textAlign: "center",
    }}>
      <div style={{ fontSize: 18, fontWeight: 800, color, fontFamily: "var(--font-display)" }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--gray-3)", marginTop: 2 }}>{label}</div>
    </div>
  );
}
