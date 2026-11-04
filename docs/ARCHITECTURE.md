# CivicOS Architecture Specification 📐

## 1. Executive Architecture Summary

CivicOS is architected as a modular, event-driven civic-tech platform. It bridges citizens with government department officers through an AI-powered intelligence layer (Google Gemini) and a low-code workflow automation orchestrator (n8n), backed by a high-performance Python FastAPI service and PostgreSQL database.

---

## 2. High-Level System Architecture

```mermaid
flowchart TB
    subgraph Clients["Presentation Layer"]
        CA["📱 Citizen Mobile App<br/>(Flutter / Dart)"]
        OD["💻 Officer Web Dashboard<br/>(React + TypeScript)"]
    end

    subgraph Gateway["API & Backend Layer (FastAPI)"]
        AUTH["🔐 Auth Service<br/>(JWT RBAC)"]
        TWIN["👤 Citizen Twin Service<br/>(Profile & Context)"]
        SCHEME["📜 Scheme Matching Engine<br/>(Eligibility & AI Recs)"]
        GRIEVANCE["📝 Grievance Engine<br/>(CRUD & Audit Logs)"]
        WEBHOOK["⚡ Webhook Dispatcher / Handler"]
    end

    subgraph Intelligence["AI Layer (Google Gemini)"]
        GEMINI_TRIAGE["🧠 Gemini Triage Model<br/>• Category Classification<br/>• Urgency & Severity Scoring<br/>• Department Tagging<br/>• Summary Extraction"]
        GEMINI_REC["🎯 Gemini Scheme Matcher<br/>• Profile Matching<br/>• Eligibility Reasoning"]
    end

    subgraph Automation["Workflow Orchestration (n8n)"]
        N8N_FLOW["⚙️ n8n Workflow Engine<br/>• Event Webhook Ingestion<br/>• Department Route Mapping<br/>• SLA Monitoring & Escalation<br/>• Mock Notification Dispatch"]
    end

    subgraph Data["Persistence Layer"]
        PG[("🐘 PostgreSQL Database<br/>• Users & Roles<br/>• Citizen Twin Profiles<br/>• Welfare Schemes<br/>• Grievance Records<br/>• Status Audit Timelines")]
    end

    %% Client to Backend
    CA -->|"HTTPS / REST API (Bearer JWT)"| AUTH
    CA -->|"Fetch Profile & Schemes"| TWIN
    CA -->|"Submit Grievance"| GRIEVANCE
    CA -->|"Track Grievance Status"| GRIEVANCE
    OD -->|"HTTPS / REST API (Bearer JWT)"| AUTH
    OD -->|"Departmental Queue & Triage"| GRIEVANCE
    OD -->|"Update Status & Resolution"| GRIEVANCE

    %% Backend internal and DB
    AUTH <--> PG
    TWIN <--> PG
    SCHEME <--> PG
    GRIEVANCE <--> PG

    %% AI Integrations
    GRIEVANCE -->|"Prompt + Grievance Text"| GEMINI_TRIAGE
    GEMINI_TRIAGE -->|"Structured JSON Result"| GRIEVANCE
    TWIN -->|"Profile Data + Scheme List"| GEMINI_REC
    GEMINI_REC -->|"Ranked Schemes + Justification"| SCHEME

    %% n8n Integrations
    GRIEVANCE -->|"Trigger Triage Event (Webhook)"| N8N_FLOW
    N8N_FLOW -->|"Callback / Escalate / Log"| WEBHOOK
    WEBHOOK --> GRIEVANCE
```

---

## 3. Data Flow & Sequence Diagrams

### 3.1 Flow A: Citizen Profile & AI Scheme Recommendations

```mermaid
sequenceDiagram
    autonumber
    actor Citizen as Citizen (Flutter App)
    participant API as FastAPI Backend
    participant DB as PostgreSQL
    participant AI as Gemini API

    Citizen->>API: GET /api/v1/schemes/recommendations (with JWT)
    API->>DB: Fetch Citizen Twin (Income, Occupation, Location, Age)
    API->>DB: Fetch active Government Schemes
    API->>AI: Send prompt with Citizen Twin context + Schemes catalog
    Note over AI: Evaluates criteria, matches relevance, generates explanations
    AI-->>API: Returns Structured JSON (Recommended Schemes + Match Score + Reason)
    API-->>Citizen: 200 OK with personalized recommendations
```

### 3.2 Flow B: Grievance Submission, AI Triage & n8n Orchestration

```mermaid
sequenceDiagram
    autonumber
    actor Citizen as Citizen (Flutter App)
    participant API as FastAPI Backend
    participant AI as Gemini API
    participant DB as PostgreSQL
    participant n8n as n8n Workflow Engine
    actor Officer as Department Officer (React Dashboard)

    Citizen->>API: POST /api/v1/grievances (Title, Description, Location, Image URL)
    API->>AI: Send Grievance text to Gemini Triage Prompt
    Note over AI: Classifies category, assigns severity (LOW/MED/HIGH/CRITICAL), identifies target department
    AI-->>API: Structured Triage JSON
    API->>DB: INSERT into Grievances (Status: SUBMITTED -> TRIAGED, Department, Priority)
    API->>n8n: POST /webhook/grievance-event (Grievance ID, Dept, Priority, Summary)
    
    par n8n Processing
        n8n->>n8n: Evaluate routing rules & check SLA threshold
        n8n->>API: Optional callback / SLA registration
    and Instant Citizen Response
        API-->>Citizen: 201 Created (Grievance ID, AI Triage Summary, Status: TRIAGED)
    end

    Officer->>API: GET /api/v1/grievances?department=Water_Sanitation
    API->>DB: Query pending departmental grievances
    DB-->>API: Grievances list
    API-->>Officer: 200 OK (Displays in Officer Dashboard Queue)
```

### 3.3 Flow C: Officer Resolution & Status Propagation

```mermaid
sequenceDiagram
    autonumber
    actor Officer as Department Officer (React Dashboard)
    participant API as FastAPI Backend
    participant DB as PostgreSQL
    actor Citizen as Citizen (Flutter App)

    Officer->>API: PATCH /api/v1/grievances/{id}/status (status: IN_PROGRESS / RESOLVED, remarks)
    API->>DB: UPDATE Grievances & INSERT into GrievanceAuditLog
    API-->>Officer: 200 OK (Status Updated)
    
    Citizen->>API: GET /api/v1/grievances/{id} (Poll / Refresh)
    API->>DB: Fetch Grievance with full timeline history
    DB-->>API: Grievance Record + Audit Logs
    API-->>Citizen: 200 OK (Visual timeline showing resolution steps)
```

---

## 4. Component Modular Design

```text
CivicOS/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── auth.py          # Login, Register, Me
│   │   │   │   ├── citizens.py      # Citizen Twin profile management
│   │   │   │   ├── schemes.py       # Schemes and AI recommendation endpoints
│   │   │   │   ├── grievances.py   # Grievance CRUD, triage, and status updates
│   │   │   │   └── webhooks.py      # n8n webhook receiver & callbacks
│   │   │   └── router.py            # Aggregated v1 API router
│   │   ├── core/
│   │   │   ├── config.py            # Environment variables & application settings
│   │   │   ├── database.py          # SQLAlchemy / asyncpg engine & sessionmaker
│   │   │   └── security.py          # JWT creation, password hashing, OAuth2 dependencies
│   │   ├── models/                  # SQLAlchemy ORM database models
│   │   │   ├── user.py              # User & Role models
│   │   │   ├── citizen_twin.py      # Demographic & socio-economic profile
│   │   │   ├── scheme.py            # Welfare scheme metadata
│   │   │   └── grievance.py         # Grievance, AI triage data, and timeline logs
│   │   ├── schemas/                 # Pydantic v2 schemas for validation & serialization
│   │   │   ├── user.py
│   │   │   ├── citizen_twin.py
│   │   │   ├── scheme.py
│   │   │   └── grievance.py
│   │   ├── services/                # Business logic & 3rd-party integrations
│   │   │   ├── gemini_service.py    # Google Gemini client (Triage & Recommendations)
│   │   │   ├── n8n_service.py       # n8n webhook trigger client
│   │   │   └── seed_data.py         # Pre-loaded hackathon demo fixtures
│   │   └── main.py                  # FastAPI application entrypoint
│   ├── requirements.txt
│   └── Dockerfile
├── citizen-app/                     # Flutter Mobile App (Dart)
├── officer-dashboard/               # React + TypeScript + Vite + Tailwind
└── n8n/                             # Workflow JSON exports & trigger configs
```

---

## 5. Intelligence Layer (Google Gemini Integration)

### 5.1 Grievance Triage Prompt Contract
- **Input**: Grievance title, description, location, category tag (if provided by user).
- **Output (Structured JSON Schema)**:
```json
{
  "category": "Roads & Infrastructure | Water & Sanitation | Electricity & Energy | Public Health | Waste Management",
  "assigned_department": "Public_Works | Water_Sanitation | Electricity_Board | Health_Dept | Municipal_Corp",
  "priority": "LOW | MEDIUM | HIGH | CRITICAL",
  "urgency_score": 0.85,
  "summary": "Concise 1-2 sentence executive summary of the issue",
  "suggested_initial_action": "Immediate on-site inspection for pipe burst",
  "key_entities": ["4th Cross Main Road", "water pipe", "flooding"]
}
```

### 5.2 Scheme Recommendation Prompt Contract
- **Input**: Citizen Twin (Age, Occupation, Annual Income, Urban/Rural, Gender, Caste/Category, Family Size) + JSON List of available government schemes.
- **Output (Structured JSON Schema)**:
```json
{
  "recommendations": [
    {
      "scheme_id": "SCH_001",
      "scheme_name": "Pradhan Mantri Solar Subsidy",
      "match_confidence": 0.95,
      "eligibility_reasons": ["Homeowner in urban area", "Income within eligible tier"],
      "potential_benefit": "Up to 40% subsidy on rooftop solar installation"
    }
  ]
}
```

---

## 6. Automation Layer (n8n Workflow Integration)

1. **Trigger**: Backend dispatches a `POST` request to n8n webhook URL upon grievance creation and triage completion.
2. **Payload**:
   ```json
   {
     "event": "GRIEVANCE_TRIAGED",
     "grievance_id": "grv_8921f92",
     "department": "Water_Sanitation",
     "priority": "HIGH",
     "title": "Broken water main flooding road",
     "citizen_id": "usr_c01",
     "timestamp": "2026-08-24T14:50:00Z"
   }
   ```
3. **n8n Actions**:
   - Routes task to the specific departmental queue.
   - Evaluates SLA timer (e.g. Critical = 4h, High = 24h).
   - Generates simulated alert (e.g. Webhook, Email, or Slack/Discord mock channel).

---

## 7. Role-Based Access Control (RBAC) Matrix

| Resource / Action | Citizen | Department Officer | Admin |
|---|---|---|---|
| Register / Login | ✅ | ✅ | ✅ |
| View / Edit Own Citizen Twin | ✅ | ❌ | ✅ |
| Request Scheme Recommendations | ✅ | ❌ | ✅ |
| Submit New Grievance | ✅ | ❌ | ✅ |
| View Own Grievances | ✅ | ❌ | ✅ |
| View Department Grievance Queue | ❌ | ✅ (Assigned Dept only) | ✅ (All Depts) |
| Update Grievance Status & Remarks | ❌ | ✅ | ✅ |
| Access Metrics / SLA Stats | ❌ | ✅ | ✅ |

---

## 8. Modularity & Independent Development

To enable rapid solo hackathon development, each component is decoupled via strict contracts:
1. **Mock AI Service Mode**: If `GEMINI_API_KEY` is not provided during offline dev, `gemini_service.py` falls back to deterministic rule-based triage.
2. **Mock n8n Webhook Mode**: If n8n is not running, FastAPI gracefully logs the webhook payload without blocking grievance creation.
3. **Seed Data Autoload**: Database can be seeded with one command with realistic citizens, officers, schemes, and grievances for immediate demo testing.
