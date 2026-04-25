import asyncio
from fastapi import APIRouter, HTTPException
from app.models import MatchRequest, ScoredCandidate, CandidateProfile
from app.services.vector_store import vector_search
from app.services.llm_service import score_candidate
from app.data.candidates import get_candidate_by_id

router = APIRouter()
@router.post("/", response_model=list[ScoredCandidate])
async def match_candidates(request: MatchRequest):
    """Find and score top candidates using TF-IDF search + Groq LLM scoring."""
    try:
        jd = request.parsed_jd
        # Get ALL matches from vector search
        search_results = vector_search(jd.summary_embedding_text, top_k=request.top_k)
        
        # Paginate results BEFORE scoring to save tokens
        start_idx = request.offset
        end_idx = request.offset + request.limit
        paginated_results = search_results[start_idx:end_idx]

        scored = []
        for candidate_id, vector_sim in paginated_results:
            candidate_data = get_candidate_by_id(candidate_id)
            if not candidate_data:
                continue

            # This will use ~600 tokens per candidate (6000 total for limit 10)
            score_result = score_candidate(candidate_data, jd)

            # Blend: 25% TF-IDF similarity + 75% LLM score
            blended_match = round(0.25 * vector_sim + 0.75 * score_result["match_score"], 2)

            profile = CandidateProfile(
                id=candidate_data["id"],
                name=candidate_data["name"],
                current_role=candidate_data["current_role"],
                current_company=candidate_data["current_company"],
                years_experience=candidate_data["years_experience"],
                location=candidate_data["location"],
                remote_preference=candidate_data["remote_preference"],
                skills=candidate_data["skills"],
                education=candidate_data["education"],
                salary_expectation=candidate_data["salary_expectation"],
                bio=candidate_data["bio"],
                avatar_seed=candidate_data.get("avatar_seed"),
            )

            scored.append(ScoredCandidate(
                candidate=profile,
                match_score=blended_match,
                match_explanation=score_result["explanation"],
                match_breakdown=score_result["breakdown"],
                outreach_status="pending",
            ))

        scored.sort(key=lambda x: x.match_score, reverse=True)
        return scored

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
