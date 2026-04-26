# Catalyst Talent: Technical Documentation

## 1. Executive Summary

Catalyst is an autonomous, AI-powered talent scouting and engagement platform designed to streamline the recruitment lifecycle. Traditional recruitment processes suffer from high latency, manual repetition, and inefficient candidate screening. Catalyst solves this by automating the initial phases of the hiring funnel: parsing job descriptions, evaluating a talent pool, and executing initial candidate outreach and screening. 

By leveraging modern language models, mathematical vector search, and asynchronous real-time user interfaces, Catalyst acts as a complete AI agent. It is capable of making independent outreach decisions, gathering structured candidate data via automated emails, and scoring candidate interest and technical fit to present human recruiters with a finalized, highly qualified shortlist.

## 2. System Architecture and Workflows

The application is built on a decoupled architecture, separating the client-side interface (React/Next.js) from the intensive AI and data processing backend (Python/FastAPI).

### 2.1. Job Description Parsing
The workflow begins when a recruiter provides a raw, unstructured job description. Catalyst utilizes a Large Language Model (LLM) to extract critical requirements. The AI structures this data into strict JSON, isolating the target role, mandatory technical skills, required years of experience, and location preferences. This structured data becomes the foundational query for the matching engine.

### 2.2. Candidate Matching and Scoring
Once the job requirements are parsed, the system scans the candidate database. Catalyst employs a custom mathematical search engine (TF-IDF and Cosine Similarity) to calculate a strict "Match Score" between the job description and every candidate profile. The top candidates are then passed through a secondary LLM evaluation layer that generates a human-readable justification for the match score, breaking down exactly why the candidate is a strong fit.

### 2.3. The Outreach Pipeline
The platform's standout feature is its autonomous outreach capability. When a recruiter approves a candidate, Catalyst generates a personalized, branded email using the Resend API. This email contains a unique, secure, session-based link that directs the candidate to a Catalyst screening form.

### 2.4. Candidate Evaluation
When the candidate completes the screening form, the responses are instantly analyzed by the AI evaluator. The system scores the candidate's interest level, evaluates their salary expectations and notice period, and generates a "Blended Score" (combining the technical match and behavioral interest). Finally, it outputs a definitive recommendation (Proceed, Consider, or Reject).

## 3. Technical Innovations and Additional Features

Beyond standard CRUD operations, Catalyst incorporates several advanced, custom-built features to handle the complexity of an autonomous recruitment agent.

### 3.1. Custom In-Memory Vector Search
Instead of relying on heavy, latency-prone external vector databases (like Pinecone or Qdrant), Catalyst utilizes a custom built TF-IDF (Term Frequency-Inverse Document Frequency) and Cosine Similarity engine built entirely on Scikit-Learn. By transforming candidate data into mathematical vectors completely in-memory, the system guarantees zero-latency search results and perfect precision without the overhead of external database calls.

### 3.2. Production Email Dispatching and Form Tracking
Catalyst moves beyond simulated "mock" environments by integrating a full production email pipeline via the Resend API. 
- The system dynamically generates unique UUID-based sessions for each candidate.
- It dispatches actual HTML emails to candidate inboxes.
- The emails contain routing links that direct candidates to a secure screening form hosted on the frontend.
- This creates a real-world, interactive feedback loop between the platform and external users.

### 3.3. Asynchronous State Synchronization
Because candidate forms are filled out on a separate device or tab, the recruiter's dashboard must be aware of external actions. Catalyst achieves this through advanced asynchronous state synchronization. By leveraging browser LocalStorage events combined with state management (Zustand), the recruiter's dashboard dynamically updates the exact second a candidate submits their screening form, transitioning their status from "Waiting" to "Interest Captured" without requiring manual page refreshes.

### 3.4. Database Persistence Layer
To ensure data integrity and track outreach sessions, the frontend integrates Prisma ORM backed by a SQLite database. This allows Catalyst to persistently track job ingestions, candidate shortlists, and outreach history, ensuring that the platform can scale to handle multiple hiring pipelines simultaneously.

### 3.5. Optimized Cloud Deployment Architecture
The platform is fully decoupled and optimized for cloud deployment. The Next.js frontend is statically optimized and deployed globally on Vercel for maximum edge-caching and performance. The FastAPI Python backend is containerized and deployed on Render, explicitly configured with optimized CORS policies and environment variable injection to ensure secure, cross-origin communication between the two independent cloud environments.

## 4. Application Views and Interfaces

The platform is designed with a premium, dark-themed user interface to ensure high usability for recruiters.

### 4.1. Scout Dashboard
The starting point for recruiters. This interface allows for the input of raw job descriptions and triggers the initial AI parsing. 

![Scout View 1](./screenshots/scout-1.png)
![Scout View 2](./screenshots/scout-2.png)
![Scout View 3](./screenshots/scout-3.png)

### 4.2. Candidate Shortlist
Once parsing is complete, the Shortlist view presents ranked candidates. It features mathematical scoring rings and detailed AI-generated match breakdowns.

![Shortlist View 1](./screenshots/shortlist-1.png)
![Shortlist View 2](./screenshots/shortlist-2.png)

### 4.3. Automated Email Engagement
From the shortlist, recruiters can trigger the automated email sequence. The platform generates secure links and dispatches the branded emails to candidates.

![Automated Mail](./screenshots/Automated%20mail.png)
![Chatbot Mail 1](./screenshots/chatbot_mail-1.png)

### 4.4. Pipeline and Analytics Dashboard
As candidates progress through the funnel (from pending, to waiting for form, to evaluated), the pipeline dashboard provides a high-level overview of recruitment health.

![Pipeline Overview](./screenshots/pipeline%20for%20hired%20people%20after%20convo.png)
![Analytics Dashboard 1](./screenshots/Analytics_dashboard-1.png)
![Analytics Dashboard 2](./screenshots/Analytics_dashboard-2.png)

## 5. Conclusion

Catalyst represents a significant leap forward in recruitment technology. By abstracting the manual labor of resume screening, initial outreach, and preliminary evaluation, it empowers recruiters to focus entirely on human connection and final hiring decisions. With a robust architecture spanning Vercel, Render, Python, and React, the system is designed to be highly scalable, secure, and performant.
