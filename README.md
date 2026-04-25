# Catalyst — AI-Powered Talent Scouting & Engagement Agent

> Hackathon submission for **Catalyst** by Deccan AI — April 2026

---

## 🚀 What It Does

Catalyst is a full-stack AI agent system that:

1. **Parses** a raw Job Description using **Google Gemini 1.5 Flash** — extracting structured skills, experience, domain, location, and salary requirements.
2. **Discovers** matching candidates via **semantic vector search** (ChromaDB + sentence-transformers embeddings).
3. **Scores** each candidate with an **LLM explainability report** — Match Score (0–100) with breakdown by skills, experience, domain, and location.
4. **Engages** candidates via a **simulated conversation** powered by **Groq Llama-3 70B** — a Recruiter AI and a Candidate AI persona talk in real-time.
5. **Evaluates interest** after the conversation, assigning an **Interest Score (0–100)** with signals, red flags, and a Proceed/Consider/Pass recommendation.
6. **Ranks** the final shortlist by a blended score (60% Match + 40% Interest).

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS, Framer Motion, Zustand |
| Backend | Python 3.10, FastAPI, SSE (real-time streaming) |
| LLM — Parsing & Scoring | Google Gemini 1.5 Flash (free tier) |
| LLM — Conversation | Groq Llama-3 70B (free tier, 800 tok/s) |
| Vector Search | ChromaDB + sentence-transformers (`all-MiniLM-L6-v2`) |
| AI Framework | LangChain, LangChain-Groq, LangChain-Google-GenAI |

---

## 📁 Project Structure

```
deccan/
├── frontend/          # Next.js 16 app
│   └── src/
│       ├── app/           # Pages (layout, page)
│       ├── components/    # UI components
│       ├── store/         # Zustand global state
│       └── lib/           # API client
└── backend/           # FastAPI Python app
    └── app/
        ├── main.py        # FastAPI entry point
        ├── models.py      # Pydantic models
        ├── config.py      # Settings (pydantic-settings)
        ├── data/          # Mock candidate profiles
        ├── routers/       # API routers (jd, match, outreach, candidates)
        └── services/      # AI services (gemini, groq, vector store)
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- A free **Groq API key** → https://console.groq.com
- A free **Google Gemini API key** → https://aistudio.google.com

### 1. Backend Setup

```bash
cd d:\deccan

# Activate virtual environment (already created)
.\venv\Scripts\activate

# Fill in your API keys
cd backend
copy .env.example .env
# Edit .env with your GROQ_API_KEY and GEMINI_API_KEY

# Start the FastAPI server
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
cd d:\deccan\frontend
npm run dev
```

Open http://localhost:3000

---

## 🎯 Usage Flow

1. **Scout Tab** → Paste a Job Description or click "Load Sample JD"
2. Click **"Scout Talent"** — watch the 3-stage pipeline run in real-time
3. **Shortlist Tab** → View ranked candidates with Match Scores and AI explanations
4. Click **"Engage"** on any candidate → opens the **Engagement Arena**
5. In the Engagement Arena:
   - Toggle **Auto-Pilot** (default) to watch AI Recruiter + AI Candidate converse automatically
   - Toggle to **Manual** to take over and type your own recruiter messages
   - Click **"Evaluate Interest →"** to generate the Interest Score and final recommendation

---

## 🏗 Architecture

```
[Recruiter] → pastes JD
     ↓
[JD Parser Agent] (Gemini 1.5 Flash)
     ↓ Structured ParsedJD
[Vector Search] (ChromaDB + MiniLM)
     ↓ Top 10 candidates
[Scoring Agent] (Gemini 1.5 Flash)
     ↓ Match Score + Explanation per candidate
[Outreach Agent] (Groq Llama-3 70B)
     ├── Recruiter Persona (LLM)
     └── Candidate Persona (LLM with hidden profile)
          ↓ Chat transcript (streamed via SSE)
[Evaluator Agent] (Gemini 1.5 Flash)
     ↓ Interest Score + Recommendation
[Final Shortlist] → Blended Score (60% Match + 40% Interest)
```

---

## 📊 Sample Input / Output

**Input JD:** Senior ML Engineer — 5+ yrs, Python, PyTorch, MLOps, AWS, Bengaluru/Remote

**Output (Top 3):**
| Rank | Name | Match | Interest | Blended | Recommendation |
|---|---|---|---|---|---|
| 1 | Arjun Mehta | 94% | 87% | 91% | Proceed |
| 2 | Karthik Rajan | 88% | 72% | 82% | Proceed |
| 3 | Meera Pillai | 81% | 65% | 75% | Consider |

---

## 👤 Author

**Peddinti Venkata Sesha Sai Gowtham**
GitHub: [@Gowtham0507](https://github.com/Gowtham0507)
