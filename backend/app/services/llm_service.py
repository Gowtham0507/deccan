"""
All LLM operations via Groq llama-3.3-70b-versatile.
Handles: JD Parsing, Candidate Scoring, Interest Evaluation.
"""
import json
from groq import Groq
from app.config import get_settings
from app.models import ParsedJD

settings = get_settings()

MODEL = "llama-3.1-8b-instant"

def _client() -> Groq:
    return Groq(api_key=settings.groq_api_key)


# ─── JD PARSER ───────────────────────────────────────────────────────────────

PARSE_SYSTEM = """You are an expert technical recruiter. Parse the job description and return ONLY a valid JSON object.
No markdown, no explanation, no code fences. Raw JSON only.

Schema:
{
  "title": "string",
  "company_context": "string or null",
  "hard_skills": ["list of specific technical skills"],
  "soft_skills": ["list of soft skills"],
  "experience_years_min": integer,
  "experience_years_max": integer,
  "domain": "string (e.g. Data Science, Backend Engineering, ML Engineering)",
  "location": "string or null",
  "remote_ok": boolean,
  "salary_range": "string or null",
  "summary_embedding_text": "A dense 2-3 sentence paragraph combining all key requirements for semantic matching"
}"""


def parse_jd(jd_text: str) -> ParsedJD:
    client = _client()
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": PARSE_SYSTEM},
            {"role": "user", "content": f"Parse this JD:\n\n{jd_text}"},
        ],
        temperature=0.1,
        max_tokens=1024,
    )
    raw = response.choices[0].message.content.strip()
    # Strip markdown fences if present
    if "```" in raw:
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    data = json.loads(raw.strip())
    return ParsedJD(**data)


# ─── CANDIDATE SCORER ────────────────────────────────────────────────────────

SCORE_SYSTEM = """You are a senior technical recruiter evaluating a candidate against a job description.
Return ONLY a valid JSON object. No markdown, no code fences, raw JSON only.

Schema:
{
  "match_score": float (0-100),
  "explanation": "2-3 sentence summary of why they match or don't",
  "breakdown": {
    "skills_match": float (0-100),
    "experience_match": float (0-100),
    "domain_match": float (0-100),
    "location_match": float (0-100)
  },
  "top_strengths": ["3 specific strengths"],
  "gaps": ["up to 3 gaps, or empty list"]
}"""


def score_candidate(candidate: dict, parsed_jd: ParsedJD) -> dict:
    client = _client()
    jd_text = (
        f"Role: {parsed_jd.title} | Domain: {parsed_jd.domain}\n"
        f"Hard Skills: {', '.join(parsed_jd.hard_skills)}\n"
        f"Soft Skills: {', '.join(parsed_jd.soft_skills)}\n"
        f"Experience: {parsed_jd.experience_years_min}-{parsed_jd.experience_years_max} years\n"
        f"Location: {parsed_jd.location} | Remote OK: {parsed_jd.remote_ok}\n"
        f"Salary: {parsed_jd.salary_range or 'Not specified'}"
    )
    candidate_text = (
        f"Name: {candidate['name']}\n"
        f"Role: {candidate['current_role']} @ {candidate['current_company']}\n"
        f"Skills: {', '.join(candidate['skills'])}\n"
        f"Experience: {candidate['years_experience']} years\n"
        f"Location: {candidate['location']} ({candidate['remote_preference']})\n"
        f"Education: {candidate['education']}\n"
        f"Bio: {candidate['bio']}"
    )
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": SCORE_SYSTEM},
            {"role": "user", "content": f"JD:\n{jd_text}\n\nCANDIDATE:\n{candidate_text}"},
        ],
        temperature=0.2,
        max_tokens=512,
    )
    raw = response.choices[0].message.content.strip()
    if "```" in raw:
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw.strip())


# ─── INTEREST EVALUATOR ──────────────────────────────────────────────────────

EVAL_SYSTEM = """Analyze this recruiter-candidate conversation transcript and evaluate the candidate's genuine interest.
Return ONLY a valid JSON object. No markdown, no code fences.

Schema:
{
  "interest_score": float (0-100),
  "interest_level": "High" or "Medium" or "Low",
  "summary": "2 sentence summary of the candidate's interest and attitude",
  "positive_signals": ["list of positive signals observed"],
  "red_flags": ["list of concerns or dealbreakers"],
  "recommendation": "Proceed" or "Consider" or "Pass"
}"""


def evaluate_interest(transcript: str) -> dict:
    client = _client()
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": EVAL_SYSTEM},
            {"role": "user", "content": f"TRANSCRIPT:\n{transcript}"},
        ],
        temperature=0.2,
        max_tokens=512,
    )
    raw = response.choices[0].message.content.strip()
    if "```" in raw:
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw.strip())


# ─── FORM EVALUATOR ──────────────────────────────────────────────────────────

EVAL_FORM_SYSTEM = """Analyze these screening form responses from a candidate and evaluate their genuine interest and fit.
Return ONLY a valid JSON object. No markdown, no code fences.

Schema:
{
  "interest_score": float (0-100),
  "interest_level": "High" or "Medium" or "Low",
  "summary": "2 sentence summary of the candidate's responses",
  "positive_signals": ["list of positive signals observed"],
  "red_flags": ["list of concerns or dealbreakers"],
  "recommendation": "Proceed" or "Consider" or "Pass"
}"""


def evaluate_form_responses(responses: dict) -> dict:
    client = _client()
    formatted_responses = "\n".join(f"Q: {k}\nA: {v}" for k, v in responses.items())
    
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": EVAL_FORM_SYSTEM},
            {"role": "user", "content": f"RESPONSES:\n{formatted_responses}"},
        ],
        temperature=0.2,
        max_tokens=512,
    )
    raw = response.choices[0].message.content.strip()
    if "```" in raw:
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw.strip())
