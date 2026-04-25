"""
Outreach service — Groq llama-3.3-70b-versatile for both recruiter and candidate personas.
Manages in-memory sessions. Manual override support.
"""
import json
import uuid
from datetime import datetime
from groq import Groq
from app.config import get_settings
from app.models import ParsedJD, ChatMessage, OutreachSession
from app.services.llm_service import evaluate_interest

settings = get_settings()

MODEL = "llama-3.1-8b-instant"

# In-memory session store (swap to Redis/DB for production)
_sessions: dict[str, OutreachSession] = {}
_session_ctx: dict[str, dict] = {}


def _groq():
    return Groq(api_key=settings.groq_api_key)


def _recruiter_system(jd: ParsedJD, candidate: dict) -> str:
    return f"""You are TalentAI — a professional AI recruiter agent.
Persona: Warm, direct, professional. You ask ONE focused question per message.

ROLE YOU ARE HIRING FOR:
- Title: {jd.title}
- Domain: {jd.domain}
- Key Skills: {', '.join(jd.hard_skills[:5])}
- Experience: {jd.experience_years_min}-{jd.experience_years_max} years
- Salary: {jd.salary_range or 'Competitive'}
- Location: {jd.location} | Remote OK: {jd.remote_ok}

CANDIDATE: {candidate['name']} | {candidate['current_role']} @ {candidate['current_company']}

GOAL — In 6-8 exchanges, assess:
1. Genuine interest in this role
2. Salary alignment
3. Availability & location fit
4. Motivation and career goals

Start by introducing yourself and the role enthusiastically but concisely.
Keep each reply under 80 words. Talk naturally, no bullet points."""


def _candidate_system(candidate: dict, jd: ParsedJD) -> str:
    return f"""You are roleplaying as {candidate['name']}, a real professional being approached by a recruiter.

YOUR PROFILE:
- Current: {candidate['current_role']} @ {candidate['current_company']}
- Skills: {', '.join(candidate['skills'][:6])}
- Experience: {candidate['years_experience']} years
- Location: {candidate['location']} | Remote preference: {candidate['remote_preference']}
- Salary expectation: {candidate['salary_expectation']}
- Your hidden personality: {candidate['persona_notes']}

Respond as a real professional — curious, sometimes cautious, occasionally skeptical.
If asked about salary, be realistic about your expectations.
Mention dealbreakers if relevant. Keep replies under 70 words. Sound human, not robotic."""


def create_session(candidate: dict, jd: ParsedJD, job_id: str, mode: str) -> OutreachSession:
    session_id = str(uuid.uuid4())
    
    expires_at = None
    status = "active"
    if mode == "form":
        from datetime import timedelta
        # Expire in 24 hours
        expires_at = (datetime.utcnow() + timedelta(days=1)).isoformat()
        status = "waiting_for_form"
        
    session = OutreachSession(
        session_id=session_id,
        candidate_id=candidate["id"],
        job_id=job_id,
        mode=mode,
        status=status,
        expires_at=expires_at,
    )
    _sessions[session_id] = session
    
    if mode != "form":
        _session_ctx[session_id] = {
            "recruiter_msgs": [{"role": "system", "content": _recruiter_system(jd, candidate)}],
            "candidate_msgs": [{"role": "system", "content": _candidate_system(candidate, jd)}],
            "candidate": candidate,
            "jd": jd,
        }
    else:
        # Form mode doesn't need chat context
        _session_ctx[session_id] = {
            "candidate": candidate,
            "jd": jd,
        }
    return session


def get_session(session_id: str) -> OutreachSession | None:
    return _sessions.get(session_id)


def generate_recruiter_message(session_id: str) -> str:
    ctx = _session_ctx[session_id]
    client = _groq()
    resp = client.chat.completions.create(
        model=MODEL,
        messages=ctx["recruiter_msgs"],
        temperature=0.75,
        max_tokens=150,
    )
    content = resp.choices[0].message.content.strip()
    # Update both histories
    ctx["recruiter_msgs"].append({"role": "assistant", "content": content})
    ctx["candidate_msgs"].append({"role": "user", "content": f"Recruiter: {content}"})
    return content


def generate_candidate_response(session_id: str) -> str:
    ctx = _session_ctx[session_id]
    client = _groq()
    resp = client.chat.completions.create(
        model=MODEL,
        messages=ctx["candidate_msgs"],
        temperature=0.85,
        max_tokens=130,
    )
    content = resp.choices[0].message.content.strip()
    ctx["candidate_msgs"].append({"role": "assistant", "content": content})
    ctx["recruiter_msgs"].append({"role": "user", "content": f"Candidate: {content}"})
    return content


def add_manual_candidate_message(session_id: str, message: str):
    ctx = _session_ctx[session_id]
    ctx["candidate_msgs"].append({"role": "assistant", "content": message})
    ctx["recruiter_msgs"].append({"role": "user", "content": f"Candidate: {message}"})


def append_message(session_id: str, role: str, content: str):
    session = _sessions[session_id]
    session.messages.append(ChatMessage(
        role=role,
        content=content,
        timestamp=datetime.utcnow().isoformat()
    ))


def run_interest_evaluation(session_id: str) -> dict:
    session = _sessions[session_id]
    transcript = "\n".join(
        f"{m.role.upper()}: {m.content}" for m in session.messages
    )
    result = evaluate_interest(transcript)
    session.interest_score = result["interest_score"]
    session.status = "completed"
    return result


def submit_form(session_id: str, responses: dict) -> dict:
    from app.services.llm_service import evaluate_form_responses
    session = _sessions[session_id]
    
    session.form_responses = responses
    
    result = evaluate_form_responses(responses)
    session.interest_score = result["interest_score"]
    session.status = "completed"
    
    return result


def check_expirations():
    """Simulates 24h fast forward for testing."""
    for sid, session in _sessions.items():
        if session.mode == "form" and session.status == "waiting_for_form":
            session.status = "expired"
            session.interest_score = 0
    return {"status": "success", "message": "Fast-forward complete. All waiting forms are now expired."}
