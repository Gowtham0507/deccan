from fastapi import APIRouter
from app.data.candidates import get_all_candidates, get_candidate_by_id
from fastapi import HTTPException

router = APIRouter()


@router.get("/")
async def list_candidates():
    return get_all_candidates()


@router.get("/{candidate_id}")
async def get_candidate(candidate_id: str):
    c = get_candidate_by_id(candidate_id)
    if not c:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return c
