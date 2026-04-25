// Zustand global store
import { create } from "zustand";

export interface ParsedJD {
  title: string;
  company_context: string | null;
  hard_skills: string[];
  soft_skills: string[];
  experience_years_min: number;
  experience_years_max: number;
  domain: string;
  location: string | null;
  remote_ok: boolean;
  salary_range: string | null;
  summary_embedding_text: string;
}

export interface CandidateProfile {
  id: string;
  name: string;
  current_role: string;
  current_company: string;
  years_experience: number;
  location: string;
  remote_preference: string;
  skills: string[];
  education: string;
  salary_expectation: string;
  bio: string;
  avatar_seed: string | null;
}

export interface ScoredCandidate {
  candidate: CandidateProfile;
  match_score: number;
  match_explanation: string;
  match_breakdown: {
    skills_match: number;
    experience_match: number;
    domain_match: number;
    location_match: number;
  };
  interest_score: number | null;
  blended_score: number | null;
  outreach_status: string;
}

export interface ShortlistedEntry {
  candidate: CandidateProfile;
  match_score: number;
  interest_score: number;
  blended_score: number;
  via: "chat" | "form";
  jd_title: string;
  shortlisted_at: string;
}

export interface JDHistoryEntry {
  id: string;
  jd: ParsedJD;
  candidates: ScoredCandidate[];
  shortlisted: ShortlistedEntry[];
  createdAt: string;
}

export interface ChatMessage {
  role: "recruiter" | "candidate";
  content: string;
  timestamp: string | null;
}

interface AppState {
  // JD
  rawJD: string;
  parsedJD: ParsedJD | null;
  isParsingJD: boolean;
  setRawJD: (text: string) => void;
  setParsedJD: (jd: ParsedJD | null) => void;
  setIsParsingJD: (v: boolean) => void;

  // Pipeline
  pipelineStage: "idle" | "parsing" | "seeding" | "matching" | "done";
  setPipelineStage: (s: AppState["pipelineStage"]) => void;

  // Pagination
  offset: number;
  setOffset: (o: number) => void;

  // Candidates
  candidates: ScoredCandidate[];
  setCandidates: (c: ScoredCandidate[]) => void;
  appendCandidates: (c: ScoredCandidate[]) => void;
  updateCandidateInterest: (id: string, score: number, status: string) => void;

  // Form Session Mapping (candidateId → sessionId)
  formSessionMap: Record<string, string>;
  setFormSession: (candidateId: string, sessionId: string) => void;
  // Final Shortlist
  shortlisted: ShortlistedEntry[];
  shortlistCandidate: (sc: ScoredCandidate, via: "chat" | "form") => void;
  removeFromShortlist: (id: string) => void;

  // JD History
  jdHistory: JDHistoryEntry[];
  saveCurrentJDToHistory: () => void;
  loadFromHistory: (entry: JDHistoryEntry) => void;

  // Recruiter Notes
  notes: Record<string, string>;
  setNote: (candidateId: string, note: string) => void;

  // Score Tuner
  matchWeight: number;
  interestWeight: number;
  setMatchWeight: (w: number) => void;
  setInterestWeight: (w: number) => void;

  // Outreach
  activeSessionId: string | null;
  activeCandidateId: string | null;
  chatMessages: ChatMessage[];
  outreachMode: "auto" | "manual";
  isStreaming: boolean;
  setActiveSession: (sessionId: string, candidateId: string) => void;
  addChatMessage: (msg: ChatMessage) => void;
  clearChat: () => void;
  setOutreachMode: (m: "auto" | "manual") => void;
  setIsStreaming: (v: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  rawJD: "",
  parsedJD: null,
  isParsingJD: false,
  setRawJD: (text) => set({ rawJD: text }),
  setParsedJD: (jd) => set({ parsedJD: jd }),
  setIsParsingJD: (v) => set({ isParsingJD: v }),

  pipelineStage: "idle",
  setPipelineStage: (s) => set({ pipelineStage: s }),

  offset: 0,
  setOffset: (o) => set({ offset: o }),

  candidates: [],
  setCandidates: (c) => set({ candidates: c, offset: 0 }),
  appendCandidates: (c) => set((state) => ({ candidates: [...state.candidates, ...c] })),
  updateCandidateInterest: (id, score, status) =>
    set((state) => ({
      candidates: state.candidates.map((c) =>
        c.candidate.id === id
          ? {
              ...c,
              interest_score: score,
              blended_score: Math.round(
                (get().matchWeight / 100) * c.match_score +
                (get().interestWeight / 100) * score
              ),
              outreach_status: status,
            }
          : c
      ),
    })),

  formSessionMap: {},
  setFormSession: (candidateId, sessionId) =>
    set((state) => ({ formSessionMap: { ...state.formSessionMap, [candidateId]: sessionId } })),

  shortlisted: [],
  shortlistCandidate: (sc, via) => {
    const { parsedJD, shortlisted, matchWeight, interestWeight } = get();
    if (shortlisted.some((s) => s.candidate.id === sc.candidate.id)) return;
    const entry: ShortlistedEntry = {
      candidate: sc.candidate,
      match_score: sc.match_score,
      interest_score: sc.interest_score ?? 0,
      blended_score: Math.round(
        (matchWeight / 100) * sc.match_score + (interestWeight / 100) * (sc.interest_score ?? 0)
      ),
      via,
      jd_title: parsedJD?.title ?? "Unknown Role",
      shortlisted_at: new Date().toISOString(),
    };
    set((state) => ({ shortlisted: [...state.shortlisted, entry] }));
  },
  removeFromShortlist: (id) =>
    set((state) => ({ shortlisted: state.shortlisted.filter((s) => s.candidate.id !== id) })),

  jdHistory: [],
  saveCurrentJDToHistory: () => {
    const { parsedJD, candidates, shortlisted } = get();
    if (!parsedJD) return;
    const entry: JDHistoryEntry = {
      id: Date.now().toString(),
      jd: parsedJD,
      candidates: [...candidates],
      shortlisted: shortlisted.filter((s) => s.jd_title === parsedJD.title),
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ jdHistory: [entry, ...state.jdHistory.slice(0, 9)] }));
  },
  loadFromHistory: (entry) =>
    set({
      parsedJD: entry.jd,
      candidates: entry.candidates,
      shortlisted: entry.shortlisted,
      pipelineStage: "done",
      offset: entry.candidates.length,
    }),

  notes: {},
  setNote: (candidateId, note) =>
    set((state) => ({ notes: { ...state.notes, [candidateId]: note } })),

  matchWeight: 60,
  interestWeight: 40,
  setMatchWeight: (w) => set({ matchWeight: w, interestWeight: 100 - w }),
  setInterestWeight: (w) => set({ interestWeight: w, matchWeight: 100 - w }),

  activeSessionId: null,
  activeCandidateId: null,
  chatMessages: [],
  outreachMode: "manual",
  isStreaming: false,
  setActiveSession: (sessionId, candidateId) =>
    set({ activeSessionId: sessionId, activeCandidateId: candidateId, chatMessages: [] }),
  addChatMessage: (msg) =>
    set((state) => ({ chatMessages: [...state.chatMessages, msg] })),
  clearChat: () => set({ chatMessages: [], activeSessionId: null, activeCandidateId: null }),
  setOutreachMode: (m) => set({ outreachMode: m }),
  setIsStreaming: (v) => set({ isStreaming: v }),
}));
