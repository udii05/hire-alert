# Hire Alert — AI-Powered Job & Opportunity Discovery

A full-stack app that uses **AI agents** to scrape/query job boards, internships,
hackathons, competitions, scholarships and freelance gigs — then **curates them
for each user** based on their profile (skills, roles, education, location).

Every opportunity is scored with a **fit %**, classified into **priority
buckets by deadline** (🔴 HIGH < 7 days, 🟡 MEDIUM 7–15 days, 🟢 LOW 15+ days),
and users get **in-app + email alerts** the moment a job enters the HIGH
priority zone.

---

## Architecture

```
┌──────────────────────────┐      ┌──────────────────────────────┐
│  Frontend (Next.js 16)   │      │  Backend (FastAPI + agents)  │
│  - NextAuth (Google/     │      │  - JobDiscoveryAgent         │
│    GitHub/Credentials)   │      │  - InternshipAgent           │
│  - Prisma (Postgres)     │◄────►│  - HackathonEventAgent       │
│  - Dashboard w/ priority │ REST │  - ScholarshipAgent          │
│    cards, tabs, apply/   │      │  - FreelancingAgent          │
│    reject/un-reject      │      │  - EligibilityAgent          │
│  - Profile form          │      │  - DuplicateRemovalAgent     │
└──────────────────────────┘      │  - AIMatchingAgent (fit %)   │
                                  │  - RecommendationAgent (75%) │
                                  │  - NotificationAgent (email) │
                                  └──────────────────────────────┘
```

- **One shared PostgreSQL database** (schema owned by Prisma; the backend
  agents read/write the same tables).
- **Docker** runs PostgreSQL (port 5433) + Redis (port 6379).

## Data sources

| Source | Type | Method |
|---|---|---|
| LinkedIn (guest search API) | Jobs / Internships | Public HTML API (no auth) |
| Remotive API | Remote jobs | Free public API |
| Jobicy API | Remote jobs | Free public API |
| Arbeitnow API | Tech jobs | Free public API |
| Naukri | Jobs | Best-effort (recaptcha-blocked; graceful skip) |
| Internshala | Internships | Best-effort scrape |
| Devpost API | Hackathons | Free public API |
| MLH (schema.org) | Hackathons | Public HTML |
| Unstop API | Hackathons / Scholarships | Free public API |
| Kaggle | Competitions | API w/ credentials **or** HTML fallback |
| GitHub API | Open-source opportunities | Free public API |
| Reddit | Freelance / jobs | Best-effort (often blocked) |
| Wellfound | Startup jobs | Best-effort (auth required) |

> **API keys you can add** (optional, in `backend/.env`):
> `KAGGLE_USERNAME` / `KAGGLE_KEY` — unlocks Kaggle's official API.

## Quick start (Windows)

```powershell
# 1. Start Docker (Postgres + Redis) and both apps
.\scripts\start-dev.ps1

# Or manually:
docker compose up -d postgres redis
cd frontend
npx prisma db push && npx prisma generate
npm run dev            # http://localhost:3000

cd ..\backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --port 8000   # http://localhost:8000/docs
```

1. Open http://localhost:3000 and **register** (or sign in with Google/GitHub).
2. Go to **Profile** and fill in skills, preferred roles, education, interests.
3. Open the **Dashboard** → click **Scan Jobs** — the agent pipeline runs
   (discovery → store → dedupe → eligibility → match → recommend → notify).
4. Your curated board appears with colored priority outlines and fit %.
   Apply (opens the external link + tracks it), Reject (moves to Rejected tab,
   never shown again) or Un-reject (bring it back).

## Email alerts (SMTP)

In `backend/.env`:

```env
EMAIL_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@gmail.com
SMTP_PASSWORD=<16-char Gmail app password>
EMAIL_FROM=Hire Alert <you@gmail.com>
```

With this set, the NotificationAgent emails you **as soon as a job enters HIGH
priority** (< 7 days to deadline). Without it, alerts still appear in-app
(bell icon). A background scheduler re-checks deadlines every 2 hours.

## Matching & priority rules

- **Fit score (0–100)**: skills (40) + role alignment (25) + education (15) +
  location (10) + experience (10) + domain interest (5). Skills are aggregated
  from all profile categories (languages, frameworks, databases, cloud, AI/ML…).
- **Strict 75% eligibility rule**: only opportunities with fit ≥ 75% are ever
  shown — in "For You" **and** in Search. Anything below 75% is treated as not
  eligible and hidden. The rule is announced on the login/register and profile
  pages.
- **Priority buckets**: HIGH = deadline < 7 days, MEDIUM = 7–15 days,
  LOW = 15+ days. Sources without deadlines default to 30 days
  (`DEFAULT_DEADLINE_DAYS`).
- **Search filters**: keyword, type, location, work mode (Remote/Hybrid/On-site),
  priority (deadline urgency), experience level, and min match % (75/80/90).

## Profile (6 sections, view + edit modes)

1. **Basic Information** — name, email, phone, city, country, time zone,
   nationality, work authorization, visa sponsorship.
2. **Job Preferences** — desired roles, job type, work mode, locations,
   min/target salary, notice period, joining date, relocation.
3. **Education** — university, degree, specialization, graduation year, CGPA,
   relevant coursework.
4. **Experience** — status, years, current/previous companies, internships,
   freelancing, research, teaching, open source + work-history entries.
5. **Technical Skills** — languages, frameworks, libraries, databases, cloud,
   DevOps, AI/ML, data analysis, design tools, soft skills.
6. **Resume & Portfolio** — resume upload (PDF/DOC), portfolio, GitHub,
   LinkedIn, LeetCode, CodeChef, HackerRank, Kaggle, personal website.

After saving, the profile is shown **read-only** (with an Edit button on top) —
no more editable form at first sight.

## Project structure

```
backend/
  app/
    agents/       # AI agent pipeline (orchestrator + 10 agents)
    sources/      # per-source adapters (APIs + scrapers)
    api/          # FastAPI routes (/api/agents, /api/opportunities)
    models/       # SQLAlchemy models mirroring the Prisma schema
    workers/      # APScheduler (daily refresh, cleanup, priority alerts)
frontend/
  src/app/        # Next.js app router (dashboard, profile, auth, api routes)
  prisma/         # database schema (source of truth)
```

## Notes / limitations

- Naukri & Reddit frequently block automated access (recaptcha / 403) —
  the pipeline degrades gracefully and other sources keep the board fresh.
- Fit scoring is heuristic (no LLM calls), so it runs fast and free; the
  threshold and weights are configurable.
