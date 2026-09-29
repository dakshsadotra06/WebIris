# WebIris — AI-Powered Browser Agent

**One-line pitch:** Tell WebIris your goal in plain language — it perceives the webpage, reasons about the next step, validates the action, operates the browser, and verifies the result, looping until the task is done.

## Problem Statement

Traditional browser automation breaks the moment a website changes: developers hard-code selectors (`#name`, `#submit`), and any redesign kills the script. Teams still do repetitive web work — form filling, data collection, portal navigation — manually, because writing brittle automation isn't worth it.

## Solution Description

WebIris is an AI browser agent built on the **Perceive → Reason → Validate → Act → Verify** loop:

1. **Perceive** — a headless browser loads the page; the agent collects visible interactive elements (DOM) plus a screenshot (multimodal context).
2. **Reason** — Gemini (vision model) receives the goal + elements + screenshot and returns the single next action as **strict JSON**, validated with Zod.
3. **Validate** — a deterministic validator checks the AI's action against the *current* page state. The AI proposes; the system disposes. Invalid actions are blocked and logged, never executed.
4. **Act** — Playwright performs click / fill / select / scroll / navigate / wait.
5. **Verify** — a fresh screenshot is captured as proof; the loop re-observes until the goal is `complete` (or `fail`, max 10 steps).

Every run is stored in Supabase (`runs` + `steps` tables) as a full audit trail, viewable as a live step timeline in the React cockpit.

## Architecture

```
        USER (natural-language goal + URL)
                     │
                     ▼
        ┌────────────────────────┐
        │  React cockpit (Vite)  │  login · new task · live run view · history
        └───────────┬────────────┘
                    │  axios / JWT
                    ▼
        ┌────────────────────────┐
        │ Express agent worker   │
        │  /api/auth (JWT+bcrypt)│
        │  /api/runs             │
        │  agent loop:           │
        │   perceive → reason    │
        │   → validate → execute │
        └──────┬─────────┬───────┘
               │         │
     ┌─────────▼──┐  ┌───▼────────────┐
     │ Playwright │  │ Gemini API     │
     │ headless   │  │ (vision, strict│
     │ Chromium   │  │  JSON + Zod)   │
     └────────────┘  └────────────────┘
               │
     ┌─────────▼──────────────────────┐
     │ Supabase (PostgreSQL)          │
     │ users · runs · steps (audit)   │
     └────────────────────────────────┘
```

## Setup

### 1. Database (Supabase)
- Create a free project at supabase.com.
- Open the SQL editor and run `backend/supabase/schema.sql`.

### 2. Backend
```bash
cd backend
npm install
npx playwright install chromium
cp .env.example .env
# fill in SUPABASE_URL, SUPABASE_SERVICE_KEY, GEMINI_API_KEY, JWT_SECRET
npm start   # http://localhost:5000
```
Get a Gemini key at https://aistudio.google.com (free tier is enough for the demo).

### 3. Frontend
```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:5000
npm run dev            # http://localhost:5173
```

Register an account, hit **New Task**, pick the *Fill the demo registration form* preset, and watch the agent work.

## Deployment

- **Frontend → Vercel:** import the `frontend/` folder, set env `VITE_API_URL` to the backend URL.
- **Backend → Render:** build command `npm install && npx playwright install chromium`, start command `npm start`; set `PORT`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `JWT_SECRET`, `GEMINI_API_KEY`, `FRONTEND_URL`.
- **Database → Supabase** (free tier).
- Note: headless-browser agent runs are heaviest; the most reliable demo is a **locally recorded run** (video below) while the deployed link serves the cockpit UI + run history from Supabase.

## Demo Video Script (4 min)

- **0:00–0:30** — Problem: brittle selector-based automation breaks; manual web work is slow.
- **0:30–1:00** — Architecture: the Perceive → Reason → Validate → Act → Verify loop.
- **1:00–2:30** — LIVE: goal *"Fill the registration form with name Aarav Sharma…"* → watch each step: AI reasoning, action badge, screenshot proof.
- **2:30–3:10** — Safety: show a validator-blocked action (AI proposes a stale target → system blocks it). *AI proposes, deterministic system validates.*
- **3:10–3:40** — History page: full audit trail of runs/steps in Supabase.
- **3:40–4:00** — Stack recap + closing line.

## Security Notes

- `GEMINI_API_KEY` lives **only** in `backend/.env` — it is never sent to the frontend.
- Never commit `.env` (see `.env.example` for the template).
- Auth uses JWT (12h expiry) + bcrypt (cost 10) password hashing.
- The action validator only allows targets present in the current page snapshot, limiting prompt-injection-driven misbehavior.

## Future Scope

Chrome extension client, privacy redaction layer (PII masking before AI calls), task decomposition for multi-page workflows, ONNX/WebGPU on-device inference.
