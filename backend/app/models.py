from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum


class OutreachMode(str, Enum):
    auto = "auto"
    manual = "manual"
    form = "form"


class JDParseRequest(BaseModel):
    jd_text: str = Field(..., min_length=50, description="Raw job description text")


class ParsedJD(BaseModel):
    title: str
    company_context: Optional[str]
    hard_skills: List[str]
    soft_skills: List[str]
    experience_years_min: int
    experience_years_max: Optional[int]
    domain: str
    location: Optional[str]
    remote_ok: bool
    salary_range: Optional[str]
    summary_embedding_text: str


class MatchRequest(BaseModel):
    parsed_jd: ParsedJD
    top_k: int = 1000
    offset: int = 0
    limit: int = 10


class CandidateProfile(BaseModel):
    id: str
    name: str
    current_role: str
    current_company: str
    years_experience: int
    location: str
    remote_preference: str
    skills: List[str]
    education: str
    salary_expectation: str
    bio: str
    avatar_seed: Optional[str]


class ScoredCandidate(BaseModel):
    candidate: CandidateProfile
    match_score: float
    match_explanation: str
    match_breakdown: dict
    interest_score: Optional[float] = None
    blended_score: Optional[float] = None
    outreach_status: str = "pending"


class OutreachStartRequest(BaseModel):
    job_id: str
    candidate_id: str
    parsed_jd: ParsedJD
    mode: OutreachMode = OutreachMode.auto


class ChatMessage(BaseModel):
    role: str  # "recruiter" | "candidate"
    content: str
    timestamp: Optional[str]


class ManualMessageRequest(BaseModel):
    session_id: str
    message: str


class FormSubmitRequest(BaseModel):
    session_id: str
    responses: dict


class SendEmailRequest(BaseModel):
    candidate_id: str
    candidate_email: str
    candidate_name: str
    parsed_jd: ParsedJD
    job_id: str = "default"


class OutreachSession(BaseModel):
    session_id: str
    candidate_id: str
    job_id: str
    mode: OutreachMode
    messages: List[ChatMessage] = []
    interest_score: Optional[float] = None
    status: str = "active"
    expires_at: Optional[str] = None
    form_responses: Optional[dict] = None
