from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.routers import jd, match, outreach, candidates

settings = get_settings()

app = FastAPI(
    title="Catalyst - AI Talent Scouting API",
    description="End-to-end AI agent for talent discovery, matching, and conversational engagement.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(jd.router, prefix="/api/jd", tags=["JD Parser"])
app.include_router(match.router, prefix="/api/match", tags=["Candidate Matching"])
app.include_router(outreach.router, prefix="/api/outreach", tags=["Outreach Agent"])
app.include_router(candidates.router, prefix="/api/candidates", tags=["Candidates"])


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "Catalyst API is live."}
