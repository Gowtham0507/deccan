import asyncio
from fastapi import APIRouter, HTTPException
from app.models import OutreachStartRequest, ManualMessageRequest, FormSubmitRequest, SendEmailRequest
from app.services.outreach_service import (
    create_session, get_session,
    generate_recruiter_message, generate_candidate_response,
    add_manual_candidate_message, append_message, run_interest_evaluation,
    submit_form, check_expirations
)
from app.services.email_service import send_form_invitation
from app.data.candidates import get_candidate_by_id

router = APIRouter()

@router.post("/start")
async def start_outreach(request: OutreachStartRequest):
    candidate = get_candidate_by_id(request.candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    session = create_session(candidate, request.parsed_jd, request.job_id, request.mode)
    
    if request.mode == "form":
        # Form mode doesn't send a chat message, it just returns the link
        return {
            "session_id": session.session_id,
            "status": "waiting_for_form"
        }
    
    # Recruiter always starts in chat modes
    rec_msg = await asyncio.to_thread(generate_recruiter_message, session.session_id)
    append_message(session.session_id, "recruiter", rec_msg)
    
    return {
        "session_id": session.session_id,
        "first_message": rec_msg
    }

@router.post("/message")
async def send_manual_message(request: ManualMessageRequest):
    """Human candidate sends a message, AI recruiter replies."""
    session = get_session(request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    add_manual_candidate_message(request.session_id, request.message)
    append_message(request.session_id, "candidate", request.message)
    
    rec_msg = await asyncio.to_thread(generate_recruiter_message, request.session_id)
    append_message(request.session_id, "recruiter", rec_msg)
    
    return {
        "candidate_message": request.message,
        "recruiter_response": rec_msg
    }

@router.post("/auto-reply/{session_id}")
async def send_auto_reply(session_id: str):
    """AI candidate generates a reply, AI recruiter replies."""
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    cand_msg = await asyncio.to_thread(generate_candidate_response, session_id)
    append_message(session_id, "candidate", cand_msg)
    
    rec_msg = await asyncio.to_thread(generate_recruiter_message, session_id)
    append_message(session_id, "recruiter", rec_msg)
    
    return {
        "candidate_message": cand_msg,
        "recruiter_response": rec_msg
    }

@router.post("/evaluate/{session_id}")
async def evaluate_session(session_id: str):
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    result = await asyncio.to_thread(run_interest_evaluation, session_id)
    return result

@router.get("/session/{session_id}")
async def get_session_data(session_id: str):
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@router.post("/submit-form")
async def submit_candidate_form(request: FormSubmitRequest):
    session = get_session(request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.status == "expired":
        raise HTTPException(status_code=400, detail="Form link has expired")
        
    result = await asyncio.to_thread(submit_form, request.session_id, request.responses)
    return result

@router.post("/fast-forward")
def fast_forward():
    return check_expirations()

@router.post("/send-email")
async def send_email_form(request: SendEmailRequest):
    """
    Creates a form session and sends a real branded email to the candidate.
    Falls back to simulation if RESEND_API_KEY is not set.
    """
    candidate = get_candidate_by_id(request.candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    # Create the form session (sets waiting_for_form status + 24h expiry)
    session = create_session(candidate, request.parsed_jd, request.job_id, "form")

    # Send the branded email
    try:
        email_result = await asyncio.to_thread(
            send_form_invitation,
            request.candidate_email,
            request.candidate_name,
            request.parsed_jd.title,
            session.session_id,
        )
    except Exception as e:
        # Don't block the flow if email fails — return session anyway
        return {
            "session_id": session.session_id,
            "status": "waiting_for_form",
            "email_status": "failed",
            "email_error": str(e),
        }

    return {
        "session_id": session.session_id,
        "status": "waiting_for_form",
        "email_status": email_result.get("status", "sent"),
        "email_id": email_result.get("id", ""),
    }
