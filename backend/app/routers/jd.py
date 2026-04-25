from fastapi import APIRouter, HTTPException
from app.models import JDParseRequest, ParsedJD
from app.services.llm_service import parse_jd
from app.services.vector_store import seed_vector_store

router = APIRouter()


@router.post("/parse", response_model=ParsedJD)
async def parse_job_description(request: JDParseRequest):
    """Parse a raw JD into structured format using Groq Llama-3.3 70B."""
    try:
        seed_vector_store()
        parsed = parse_jd(request.jd_text)
        return parsed
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/seed-candidates")
async def seed_candidates():
    """Seed the TF-IDF vector index with all candidate profiles."""
    try:
        result = seed_vector_store()
        return {"success": True, **result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
