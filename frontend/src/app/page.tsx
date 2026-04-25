"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import JDIngestion from "@/components/JDIngestion";
import ShortlistDashboard from "@/components/ShortlistDashboard";
import EngagementArena from "@/components/EngagementArena";
import FinalShortlistPanel from "@/components/FinalShortlistPanel";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import EmailModal from "@/components/EmailModal";
import Sidebar from "@/components/Sidebar";
import { useAppStore } from "@/store/useAppStore";
import { ScoredCandidate } from "@/store/useAppStore";

type View = "ingest" | "shortlist" | "engagement" | "pipeline" | "analytics";

export default function HomePage() {
  const [view, setView] = useState<View>("ingest");
  const [emailModalTarget, setEmailModalTarget] = useState<ScoredCandidate | null>(null);
  const {
    candidates, parsedJD, updateCandidateInterest,
    saveCurrentJDToHistory, formSessionMap, setFormSession,
  } = useAppStore();

  // Listen for form submission events from the form tab via localStorage
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (!e.key?.startsWith("catalyst_form_result_")) return;
      const sessionId = e.key.replace("catalyst_form_result_", "");
      const data = e.newValue ? JSON.parse(e.newValue) : null;
      if (!data) return;

      const candidateId = Object.entries(formSessionMap).find(
        ([, sid]) => sid === sessionId
      )?.[0];
      if (!candidateId) return;

      updateCandidateInterest(candidateId, data.interest_score, "completed");
      localStorage.removeItem(e.key);
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [formSessionMap, updateCandidateInterest]);

  // Called when recruiter clicks "Email Form" on a card
  const handleOpenEmailModal = (sc: ScoredCandidate) => {
    setEmailModalTarget(sc);
  };

  // Called when the modal's Send button is clicked
  const handleSendEmail = async (email: string) => {
    if (!emailModalTarget || !parsedJD) throw new Error("Missing data");
    const { api } = await import("@/lib/api");
    const result = await api.sendEmail(
      emailModalTarget.candidate.id,
      email,
      emailModalTarget.candidate.name,
      parsedJD,
    );
    setFormSession(emailModalTarget.candidate.id, result.session_id);
    updateCandidateInterest(emailModalTarget.candidate.id, 0, "waiting_for_form");
  };

  const handleNavigate = (nextView: View) => {
    if (view === "ingest" && nextView !== "ingest" && parsedJD) {
      saveCurrentJDToHistory();
    }
    setView(nextView);
  };

  const slideProps = (key: string) => ({
    key,
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -18 },
    transition: { duration: 0.25 },
    style: { flex: 1, overflow: "auto" as const },
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--black)" }}>
      <Sidebar currentView={view} onNavigate={handleNavigate} />
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <AnimatePresence mode="wait">
          {view === "ingest" && (
            <motion.div {...slideProps("ingest")}>
              <JDIngestion onSuccess={() => handleNavigate("shortlist")} />
            </motion.div>
          )}
          {view === "shortlist" && (
            <motion.div {...slideProps("shortlist")}>
              <ShortlistDashboard
                onEngageCandidate={() => setView("engagement")}
                onSendForm={(sc) => handleOpenEmailModal(sc)}
              />
            </motion.div>
          )}
          {view === "engagement" && (
            <motion.div {...slideProps("engagement")} style={{ flex: 1, overflow: "hidden" }}>
              <EngagementArena onBack={() => setView("shortlist")} />
            </motion.div>
          )}
          {view === "pipeline" && (
            <motion.div {...slideProps("pipeline")}>
              <FinalShortlistPanel />
            </motion.div>
          )}
          {view === "analytics" && (
            <motion.div {...slideProps("analytics")}>
              <AnalyticsDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Email Modal — rendered at root so it overlays everything */}
      {emailModalTarget && (
        <EmailModal
          candidateName={emailModalTarget.candidate.name}
          jobTitle={parsedJD?.title || "this role"}
          onSend={handleSendEmail}
          onClose={() => setEmailModalTarget(null)}
        />
      )}
    </div>
  );
}
