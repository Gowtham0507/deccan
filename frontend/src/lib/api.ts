const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = {
  async parseJD(jdText: string) {
    const res = await fetch(`${BASE_URL}/api/jd/parse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jd_text: jdText }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async seedCandidates() {
    const res = await fetch(`${BASE_URL}/api/jd/seed-candidates`, { method: "POST" });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async matchCandidates(parsedJD: object, offset = 0, limit = 10) {
    const res = await fetch(`${BASE_URL}/api/match/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parsed_jd: parsedJD, offset, limit }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async startOutreach(candidateId: string, parsedJD: object, mode: "auto" | "manual" | "form", jobId = "default") {
    const res = await fetch(`${BASE_URL}/api/outreach/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidate_id: candidateId, job_id: jobId, parsed_jd: parsedJD, mode }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async sendManualMessage(sessionId: string, message: string) {
    const res = await fetch(`${BASE_URL}/api/outreach/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, message }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async sendAutoReply(sessionId: string) {
    const res = await fetch(`${BASE_URL}/api/outreach/auto-reply/${sessionId}`, {
      method: "POST",
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async evaluateSession(sessionId: string) {
    const res = await fetch(`${BASE_URL}/api/outreach/evaluate/${sessionId}`, { method: "POST" });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async getSession(sessionId: string) {
    const res = await fetch(`${BASE_URL}/api/outreach/session/${sessionId}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async sendEmail(candidateId: string, candidateEmail: string, candidateName: string, parsedJD: object, jobId = "default") {
    const res = await fetch(`${BASE_URL}/api/outreach/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidate_id: candidateId,
        candidate_email: candidateEmail,
        candidate_name: candidateName,
        parsed_jd: parsedJD,
        job_id: jobId,
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  async submitForm(sessionId: string, responses: object) {
    const res = await fetch(`${BASE_URL}/api/outreach/submit-form`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, responses }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async fastForward() {
    const res = await fetch(`${BASE_URL}/api/outreach/fast-forward`, {
      method: "POST",
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};
