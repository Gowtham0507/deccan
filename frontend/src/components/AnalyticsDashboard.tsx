"use client";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { Users, MessageSquare, CheckCircle2, TrendingUp, BarChart2, Mail, Clock } from "lucide-react";

export default function AnalyticsDashboard() {
  const { candidates, shortlisted, parsedJD } = useAppStore();

  // Funnel metrics
  const totalScouted = candidates.length;
  const totalEngaged = candidates.filter((c) =>
    ["active", "completed", "waiting_for_form", "expired"].includes(c.outreach_status)
  ).length;
  const totalEvaluated = candidates.filter((c) => c.outreach_status === "completed").length;
  const totalShortlisted = shortlisted.length;

  const chatEngaged = candidates.filter((c) => c.outreach_status === "completed" && c.interest_score !== null).length;
  const formSent = candidates.filter((c) => ["waiting_for_form", "expired"].includes(c.outreach_status)).length;
  const formCompleted = shortlisted.filter((s) => s.via === "form").length;

  // Score distributions (buckets: 0-30, 30-60, 60-80, 80-100)
  const matchBuckets = [0, 0, 0, 0];
  const interestBuckets = [0, 0, 0, 0];
  candidates.forEach((c) => {
    const mi = c.match_score >= 80 ? 3 : c.match_score >= 60 ? 2 : c.match_score >= 30 ? 1 : 0;
    matchBuckets[mi]++;
    if (c.interest_score !== null) {
      const ii = c.interest_score >= 80 ? 3 : c.interest_score >= 60 ? 2 : c.interest_score >= 30 ? 1 : 0;
      interestBuckets[ii]++;
    }
  });
  const maxMatch = Math.max(...matchBuckets, 1);
  const maxInterest = Math.max(...interestBuckets, 1);

  // Top skills in shortlisted
  const skillCount: Record<string, number> = {};
  shortlisted.forEach((s) => s.candidate.skills.forEach((sk) => { skillCount[sk] = (skillCount[sk] || 0) + 1; }));
  const topSkills = Object.entries(skillCount).sort((a, b) => b[1] - a[1]).slice(0, 8);

  const funnelSteps = [
    { label: "Scouted", value: totalScouted, icon: Users, color: "var(--brand-purple-light)" },
    { label: "Engaged", value: totalEngaged, icon: MessageSquare, color: "var(--brand-purple)" },
    { label: "Evaluated", value: totalEvaluated, icon: TrendingUp, color: "var(--brand-orange)" },
    { label: "Shortlisted", value: totalShortlisted, icon: CheckCircle2, color: "var(--success)" },
  ];

  return (
    <div style={{ padding: "28px 40px", overflowY: "auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>
          Analytics
        </h1>
        <p style={{ color: "var(--gray-3)", fontSize: 14, marginTop: 4 }}>
          Pipeline insights for{" "}
          <span style={{ color: "var(--brand-purple-light)", fontWeight: 600 }}>
            {parsedJD?.title || "your current role"}
          </span>
        </p>
      </div>

      {/* Funnel */}
      <Section title="Recruitment Funnel">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {funnelSteps.map((step, i) => {
            const Icon = step.icon;
            const pct = totalScouted > 0 ? Math.round((step.value / totalScouted) * 100) : 0;
            return (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                style={{
                  padding: "20px 24px", background: "var(--black-2)",
                  border: "1px solid var(--black-3)", borderRadius: "var(--radius-lg)",
                  position: "relative", overflow: "hidden",
                }}
              >
                {/* Background bar */}
                <div style={{
                  position: "absolute", bottom: 0, left: 0, height: 3,
                  width: `${pct}%`, background: step.color, transition: "width 1s ease",
                }} />
                <Icon size={20} color={step.color} style={{ marginBottom: 12 }} />
                <div style={{ fontSize: 36, fontWeight: 800, color: step.color, fontFamily: "var(--font-display)", lineHeight: 1 }}>
                  {step.value}
                </div>
                <div style={{ fontSize: 13, color: "var(--gray-3)", marginTop: 6, fontWeight: 600 }}>{step.label}</div>
                {i > 0 && (
                  <div style={{ fontSize: 11, color: "var(--gray-2)", marginTop: 4 }}>
                    {pct}% of scouted
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </Section>

      {/* Outreach Breakdown + Score distributions side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20 }}>
        {/* Outreach breakdown */}
        <Section title="Outreach Breakdown">
          <OutreachBreakdownRow icon={<MessageSquare size={14} />} label="Chat Evaluations" value={chatEngaged} color="var(--brand-purple)" />
          <OutreachBreakdownRow icon={<Mail size={14} />} label="Forms Sent" value={formSent} color="var(--brand-orange)" />
          <OutreachBreakdownRow icon={<CheckCircle2 size={14} />} label="Forms Submitted" value={formCompleted} color="var(--success)" />
          <OutreachBreakdownRow icon={<Clock size={14} />} label="Forms Expired" value={candidates.filter((c) => c.outreach_status === "expired").length} color="var(--gray-3)" />
        </Section>

        {/* Match Score Distribution */}
        <Section title="Match Score Distribution">
          {["< 30%", "30–60%", "60–80%", "> 80%"].map((label, i) => (
            <BarRow key={label} label={label} value={matchBuckets[i]} max={maxMatch}
              color={i === 3 ? "var(--success)" : i === 2 ? "var(--brand-purple)" : i === 1 ? "var(--brand-orange)" : "var(--gray-3)"} />
          ))}
        </Section>
      </div>

      {/* Interest Distribution */}
      {totalEvaluated > 0 && (
        <div style={{ marginTop: 20 }}>
          <Section title="Interest Score Distribution (Evaluated Candidates)">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {["< 30%", "30–60%", "60–80%", "> 80%"].map((label, i) => (
                <BarRow key={label} label={label} value={interestBuckets[i]} max={maxInterest}
                  color={i === 3 ? "var(--success)" : i === 2 ? "var(--brand-purple)" : i === 1 ? "var(--brand-orange)" : "var(--gray-3)"} />
              ))}
            </div>
          </Section>
        </div>
      )}

      {/* Top Skills in Pipeline */}
      {topSkills.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <Section title="Top Skills in Shortlisted Pipeline">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {topSkills.map(([skill, count]) => (
                <div key={skill} style={{
                  padding: "6px 14px", borderRadius: 99,
                  background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)",
                  color: "var(--brand-purple-light)", fontSize: 13, fontWeight: 600,
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  {skill}
                  <span style={{ fontSize: 11, background: "rgba(124,58,237,0.3)", borderRadius: 99, padding: "1px 7px" }}>
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "var(--black-2)", border: "1px solid var(--black-3)",
      borderRadius: "var(--radius-lg)", padding: "20px 24px",
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function BarRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 12, color: "var(--gray-3)" }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--white)" }}>{value}</span>
      </div>
      <div style={{ height: 6, background: "var(--black-3)", borderRadius: 99, overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ height: "100%", background: color, borderRadius: 99 }}
        />
      </div>
    </div>
  );
}

function OutreachBreakdownRow({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--black-3)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--gray-3)", fontSize: 13 }}>
        <span style={{ color }}>{icon}</span> {label}
      </div>
      <span style={{ fontWeight: 700, fontSize: 16, color, fontFamily: "var(--font-display)" }}>{value}</span>
    </div>
  );
}
