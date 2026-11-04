# CivicOS - Backend Core Service ⚙️

> **FastAPI REST API & Database Foundation for CivicOS**  
> *Phase 1 Backend Implementation: SQLite (Local Dev) / PostgreSQL (Production Target) + SQLAlchemy + JWT RBAC + Seed Personas*

---

## 📌 Architectural Overview

CivicOS Backend is a lightweight, high-performance REST API built with **Python FastAPI** and **SQLAlchemy**.

```text
[ Citizen App (Flutter) ]         [ Officer Dashboard (React + TS) ]
            │                                     │
            └───────────────┬─────────────────────┘
                            │ REST APIs (Bearer JWT Auth)
                            ▼
               [ FastAPI Backend (Python) ]
                ├── Auth & Roles (Citizen / Officer)
                ├── Citizen Twin Profile Store
                ├── Welfare Schemes Catalog
                └── Grievance Management & Audit Timeline
                            │
                            ▼
          [ Database: SQLite (Dev) / PostgreSQL (Prod) ]
```

### Key Architectural Decisions for Phase 1:
- **Development Database**: SQLite (`sqlite:///./civicos.db`) for maximum local development reliability, fast startup, and zero Docker/PostgreSQL friction.
- **Production / Deployment Database**: PostgreSQL (`postgresql+psycopg2://USER:PASSWORD@HOST:PORT/DATABASE`). The SQLAlchemy models and database layer are 100% dialect-agnostic and PostgreSQL-compatible; switching to PostgreSQL only requires changing `DATABASE_URL`.
- **Authentication**: Stateless Bearer JWT with Role-Based Access Control (`citizen`, `officer`).
- **Phase 2 Connectors (Upcoming)**:
  - **AI Layer**: Google Gemini API for intelligent grievance triage and scheme matching.
  - **Automation Layer**: n8n webhook orchestration for automated routing and notifications.
- **Frontend Layers (Upcoming)**: Flutter Mobile App (Citizen) and React + TypeScript Web Dashboard (Officer).

---

## 🗂️ Backend Folder Structure

```text
backend/
├── app/
│   ├── main.py                  # FastAPI app entrypoint, lifespan seeding, CORS, /health
│   ├── core/
│   │   ├── config.py            # Pydantic Settings & environment variables
│   │   └── security.py          # Salted Bcrypt hashing & PyJWT token utilities
│   ├── db/
│   │   ├── database.py          # SQLAlchemy engine, SessionLocal & get_db dependency
│   │   └── models/              # MVP Database ORM models
│   │       ├── __init__.py
│   │       ├── user.py          # User accounts & roles (citizen, officer)
│   │       ├── citizen_profile.py # Citizen Twin socio-economic attributes
│   │       ├── scheme.py        # Government welfare schemes catalog
│   │       ├── grievance.py     # Grievances & status tracking
│   │       └── grievance_update.py # Immutable audit logs & timeline
│   ├── schemas/                 # Pydantic v2 validation & serialization schemas
│   │   ├── __init__.py
│   │   ├── user.py              # UserCreate, UserLogin, UserOut, TokenResponse
│   │   ├── citizen_profile.py   # CitizenProfileUpdate, CitizenWithProfileOut
│   │   ├── scheme.py            # SchemeOut, SchemeRecommendationResponse
│   │   └── grievance.py         # GrievanceCreate, GrievanceDetailOut, StatusPatch
│   ├── api/
│   │   ├── deps.py              # Auth & RBAC dependencies (get_current_citizen, get_current_officer)
│   │   └── v1/
│   │       ├── router.py        # Combined v1 API router
│   │       ├── auth.py          # /api/v1/auth (register, login, me)
│   │       ├── citizens.py      # /api/v1/citizens (profile, grievances, recommendations)
│   │       ├── grievances.py   # /api/v1/grievances (submission & retrieval)
│   │       ├── officer.py       # /api/v1/officer (department queue, filtering, status patch)
│   │       └── schemes.py       # /api/v1/schemes (public catalog)
│   ├── services/
│   │   ├── __init__.py
│   │   └── seed_service.py      # Synthetic demo personas, schemes, and grievances
│   └── utils/
├── tests/
│   ├── conftest.py              # In-memory test DB & authentication fixtures
│   ├── test_health.py           # Health check & root endpoints
│   ├── test_auth.py             # User registration & JWT login
│   ├── test_citizens.py         # Citizen Twin & recommendations
│   ├── test_grievances.py       # Grievance lifecycle & access control
│   └── test_officer.py          # Officer queue & status update audit logs
├── .env.example                 # Template environment variables (committed)
├── .env                         # Local environment settings (git-ignored)
├── .gitignore                   # Ignores .env, *.db, __pycache__, .venv
├── requirements.txt             # Pinned backend dependencies
└── README.md
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` for local execution:

```ini
# Development Database (Default SQLite for local hackathon demo)
DATABASE_URL=sqlite:///./civicos.db

# Production / Deployment Target (Simply uncomment and configure when deploying)
# DATABASE_URL=postgresql+psycopg2://postgres:password@localhost:5432/civicos

# JWT Authentication
JWT_SECRET_KEY=civicos-hackathon-insecure-secret-key-change-in-prod-2026
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Application Environment
ENVIRONMENT=development
AUTO_SEED=true

# Future Integration Placeholders (Phase 2)
GEMINI_API_KEY=
N8N_WEBHOOK_URL=http://localhost:5678/webhook/grievance-triage
```

> [!NOTE]
> `.env` is protected by `.gitignore` and is never committed to Git. For production deployment, generate a cryptographically strong `JWT_SECRET_KEY`.

---

## 🚀 Setup & Execution

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Run the FastAPI Development Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The server automatically creates tables in `civicos.db` and populates synthetic demo data on first launch.
- **Interactive OpenAPI / Swagger Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check Endpoint**: [http://localhost:8000/health](http://localhost:8000/health)

---

## 🧪 Automated Tests

Run the complete test suite:

```bash
python -m pytest tests -v
```

All 22 unit & integration tests run in-memory against SQLite with 100% test isolation.

---

## 📋 API Endpoints Summary

### System Endpoints
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/health` | Service health status | Public |
| `GET` | `/docs` | Interactive Swagger API UI | Public |
| `GET` | `/openapi.json` | OpenAPI 3.0 schema | Public |

### Authentication (`/api/v1/auth`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Register citizen or officer | Public |
| `POST` | `/api/v1/auth/login` | Authenticate & get JWT token | Public |
| `GET` | `/api/v1/auth/me` | Current user identity | Authenticated |

### Citizen Endpoints (`/api/v1/citizens`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/v1/citizens/me` | Get citizen account + Citizen Twin profile | Citizen |
| `PUT` | `/api/v1/citizens/me/profile` | Update Citizen Twin socio-economic attributes | Citizen |
| `GET` | `/api/v1/citizens/me/grievances` | List citizen's filed grievances | Citizen |
| `GET` | `/api/v1/citizens/me/recommendations` | Get AI-ready scheme recommendations (Mock in Phase 1) | Citizen |

### Grievance Endpoints (`/api/v1/grievances`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/v1/grievances` | Submit a raw civic complaint | Citizen |
| `GET` | `/api/v1/grievances/{id}` | Get grievance details & timeline history | Citizen / Officer |

### Officer Operations (`/api/v1/officer`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/v1/officer/grievances` | List departmental queue (filterable by status/dept/priority) | Officer |
| `GET` | `/api/v1/officer/grievances/{id}` | Get complete grievance details & timeline | Officer |
| `PATCH` | `/api/v1/officer/grievances/{id}/status` | Update status (`IN_PROGRESS`, `RESOLVED`, `REJECTED`) & record audit log | Officer |

### Schemes Catalog (`/api/v1/schemes`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/v1/schemes` | List public welfare schemes | Public |
| `GET` | `/api/v1/schemes/{id}` | Get single scheme details | Public |

---

## 👥 Synthetic Demo Personas

> [!IMPORTANT]
> **DISCLAIMER**: The users below are **SYNTHETIC DEMO PERSONAS** created strictly for local hackathon demonstration and test scenarios. They do not represent real citizens, government officials, or real government identity data.

| Persona | Role | Department / Context | Email | Password |
|---|---|---|---|---|
| **Priya Sharma** | `citizen` | Urban Entrepreneur (Indiranagar, Bengaluru) | `citizen.priya@example.com` | `demo123` |
| **Ramesh Patel** | `citizen` | Rural Farmer (Pandavapura, Mandya) | `citizen.ramesh@example.com` | `demo123` |
| **Rajesh Kumar** | `officer` | Water Supply & Sanitation | `officer.rajesh@civicos.gov` | `demo123` |
| **Anita Desai** | `officer` | Public Works / Roads | `officer.anita@civicos.gov` | `demo123` |
