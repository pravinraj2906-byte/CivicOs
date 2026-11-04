# CivicOs — Seva First 2026

Citizen service guidance and grievance follow-up, with React/TypeScript citizen and officer interfaces and a FastAPI development backend.

**Evaluation demo:** https://civicos-seva-2026-pravinraj.tarthen7.chatgpt.site

## Public demo boundary

The hosted evaluation build uses a separate Axios transport in `demo/browser-api.ts`. All records are synthetic, browser-local and resettable. It does not call Gemini, n8n or government case APIs. Demo sign-in is preset selection, not secure authentication. Do not enter real personal information or treat its status changes as real complaint resolution.

The Python backend is included for local reproduction; it is not running on the static public host. The inspected development backend uses SQLite by default. PostgreSQL migration, live integrations, production-grade permissions, consent controls and field validation are separate work. Do not deploy the development backend to real users without a security review.

## Try the demo

1. Open the demo and choose Citizen. Use the prefilled synthetic Priya account and `demo123`.
2. Browse a service or catalogue entry. Current eligibility is determined by the official authority, not this demo.
3. Submit a fictional road complaint and note its `DEMO-…` reference.
4. Open Officer on the same host in the same browser. Use the prefilled officer account and `demo123`.
5. Locate the complaint, add a status update and return to the citizen view to confirm/reopen it.
6. The banner's Reset demo action clears browser-local demo records and sign-in state.

Preset emails are synthetic fixtures, not working government accounts. No real credentials, `.env` files or local database snapshots belong in this repository.

## Repository layout

| Path | Purpose |
|---|---|
| `citizen-app/` | React/TypeScript citizen interface |
| `officer-dashboard/` | React/TypeScript officer interface |
| `backend/` | FastAPI, SQLAlchemy models, AI/fallback and workflow services |
| `backend/n8n/` | Optional automation workflow definition |
| `demo/` | Static evaluation transport, synthetic fixtures, guide and transport tests |
| `scripts/build-demo.mjs` | Builds and combines both public interfaces |

## Run the browser-local evaluation build

Requires Node.js 20+ and npm.

```sh
npm ci --prefix citizen-app
npm ci --prefix officer-dashboard
npm run test:demo
npm run build
python -m http.server 8080 --directory dist
```

Open http://localhost:8080. Both apps share synthetic state through this origin's localStorage. The build script explicitly enables `VITE_DEMO_MODE=true`. No AI key or database is required for this mode.

## Run the original backend locally

Requires Python 3.11+.

```sh
cd backend
python -m venv .venv
# Activate .venv using the command appropriate to your shell.
pip install -r requirements.txt
# Copy .env.example to .env and set a new random JWT_SECRET_KEY.
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Development data seeding is controlled by `AUTO_SEED`. Keep it disabled for any non-demo deployment. Gemini and n8n settings are optional and read from environment variables. Do not commit `.env` or database files. The fallback JWT default is random per process; configure a stable secret for repeatable sessions.

To connect an interface to the local Python backend, run its normal `npm run dev` without `VITE_DEMO_MODE=true`, set `VITE_API_URL=http://localhost:8000/api/v1` if needed, and open the `/citizen/` or `/officer/` path printed by Vite.

## Validation

The hosted-demo test checks complaint creation, officer status changes, citizen reopening, synthetic ownership/role restrictions, feed updates, idempotent confirmations, indicative scheme results, disabled public signup and browser-local persistence:

```sh
npm run test:demo
```

Both application builds run TypeScript checks before Vite production bundling. The backend includes its original tests; execute `python -m pytest tests -q` from `backend` with isolated test settings. Existing test files alone are not proof that every backend test passes.

## Known limits and next steps

- Hosted routing and scheme matching are illustrative deterministic rules, not live AI or validated eligibility decisions.
- A selected image is not established as persisted photo evidence in the inspected backend flow.
- Real officer onboarding, department-level authorisation, personal-data minimisation and consent need additional implementation review.
- Scheme descriptions are a development catalogue snapshot and may be outdated. Follow the official links for current terms.
- Community confirmations are supporting signals, not independent verification.
- n8n workflow source and historical recordings do not establish present end-to-end delivery.
- No completed field interviews, municipal adoption or measured impact is claimed.

Author: PRAVINRAJ G, SRM TRP Engineering College. Prepared as an independent development entry for Seva First Innovation Challenge 2026.
