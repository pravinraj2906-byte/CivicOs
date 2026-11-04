# CivicOS MVP Scope & Hackathon Boundaries 🎯

## 1. Executive Summary

This document establishes the precise scope boundaries for the **CivicOS** hackathon prototype. As a solo-developer project with strict hackathon time constraints, our core objective is to deliver a **flawless, end-to-end interactive demo** showcasing the transformative integration of **AI triage (Gemini)** and **automated workflow orchestration (n8n)** across citizen and officer experiences.

---

## 2. In-Scope Features (Hackathon Prototype Deliverables)

### 2.1 Citizen Portal & Citizen Twin Experience (Flutter App)
- [x] **Lightweight Authentication**: Fast login with pre-configured demo citizen accounts or quick registration.
- [x] **Citizen Twin Profile Viewer & Editor**: Interactive demographic inputs (Age, Occupation, Income bracket, Urban/Rural residency, Family size, Disability/BPL status).
- [x] **AI Welfare Scheme Recommendations**:
  - Gemini API analyzes Citizen Twin and returns top matched government schemes with natural language justifications.
  - Interactive scheme card drawer with eligibility details and benefit calculations.
- [x] **Intelligent Grievance Submission**:
  - Simple form: Title, Description, Location, optional Image attachment.
  - Real-time display of Gemini AI triage results (Department assigned, Urgency level, Summary).
- [x] **Live Grievance Tracking Timeline**: Visual step-by-step progress tracker (Submitted ➔ Triaged by AI ➔ In Progress by Officer ➔ Resolved).

---

### 2.2 Officer Management Portal (React + TypeScript Dashboard)
- [x] **Officer Authentication & Role Filtering**: Log in as a department officer (e.g., Sanitation, Public Works, Electricity).
- [x] **Departmental Queue & Kanban View**: Filter grievances by status (`TRIAGED`, `IN_PROGRESS`, `RESOLVED`) and priority (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
- [x] **AI Triage Inspection Drawer**: View Gemini's classification rationale, urgency score, and suggested immediate actions.
- [x] **Status & Resolution Update Flow**: Change status, add official remarks/notes, and simulate proof of resolution.
- [x] **Department Metrics Overview**: Top KPI cards for pending grievances, high-priority issues, and daily resolution count.

---

### 2.3 Backend & AI Engine (FastAPI + Gemini)
- [x] **RESTful API**: Standardized JSON endpoints with Swagger/OpenAPI interactive documentation (`/docs`).
- [x] **Database Persistence (PostgreSQL / SQLite fallback)**: Normalized schemas for Users, Citizen Twins, Schemes, Grievances, and Audit Logs.
- [x] **Google Gemini Integration**:
  - `Grievance Triage Service`: Structured JSON mode extracting department, priority score, and root-cause summary.
  - `Scheme Recommender Service`: Contextual multi-attribute matching with natural language eligibility explanation.
  - Deterministic fallback logic to guarantee 100% demo uptime even during API rate-limits or offline judging.
- [x] **Deterministic Seed Data Script**: 1-command database population with realistic Indian civic personas, welfare schemes, and sample grievances.

---

### 2.4 Automation & Orchestration (n8n)
- [x] **Webhook Integration**: FastAPI emits structured JSON payloads to n8n upon grievance creation.
- [x] **Workflow Rules Engine**:
  - Auto-routes ticket based on Gemini's department tag.
  - Logs notification dispatch and SLA tracking event.
- [x] **Visual Workflow Canvas**: Demo-ready n8n canvas ready to display to hackathon judges to demonstrate enterprise-grade workflow separation.

---

## 3. Explicit Out-of-Scope (Non-Goals for Hackathon)

| Feature / Component | Hackathon Treatment | Rationale & Production Roadmap |
|---|---|---|
| **Real Aadhaar / OTP / DigiLocker Auth** | ❌ **Excluded** (Simulated with JWT) | Real government auth requires official KYC sandbox access, SMS gateway contracts, and strict regulatory compliance. Simulated JWT provides identical UX without third-party fragility. |
| **Direct Integration with CPGRAMS / State Portals** | ❌ **Excluded** (Self-contained DB) | Government legacy systems lack public open REST APIs or require enterprise enterprise VPNs. CivicOS acts as the modern core engine. |
| **Live SMS / WhatsApp Gateway** | ❌ **Excluded** (Mocked in UI / n8n) | Avoids third-party telecommunication costs and SMS delivery latencies during live jury presentations. |
| **Complex GIS / Map Routing Engine** | ❌ **Excluded** (Standard text / geocoding) | High development overhead with minimal judging impact; standard location strings and visual pins are sufficient. |
| **Payment / Subsidy Disbursement Gateways** | ❌ **Excluded** (Simulated Benefit Ledger) | Financial transactions require RBI/bank compliance and escrow setups. |
| **Complex Microservices & Kubernetes** | ❌ **Excluded** (Clean Modular Monolith) | Modular monolith runs locally in seconds with zero cluster orchestration headaches. |

---

## 4. Pre-Seeded Demo Personas

To enable immediate testing and live demo runs without manual data entry, the system includes pre-seeded profiles:

### 👤 Persona 1: Priya Sharma (Citizen - Urban Entrepreneur)
- **Role**: `citizen`
- **Email**: `citizen.priya@example.com` | **Password**: `demo123`
- **Profile**: 32 yrs old, Urban (Bengaluru), Self-Employed (Boutique owner), Income: ₹4.5L/year.
- **Key Demo Flow**: Discovers Rooftop Solar Subsidy & MUDRA loan; submits broken drainage grievance.

### 👤 Persona 2: Ramesh Patel (Citizen - Rural Farmer)
- **Role**: `citizen`
- **Email**: `citizen.ramesh@example.com` | **Password**: `demo123`
- **Profile**: 48 yrs old, Rural (Mandya), Small Farmer, Income: ₹1.8L/year, BPL card holder.
- **Key Demo Flow**: Discovers PM-Kisan crop insurance & Micro-irrigation subsidy; reports canal irrigation blockage.

### 👮 Persona 3: Rajesh Kumar (Officer - Water Supply & Sanitation)
- **Role**: `officer`
- **Department**: `Water_Sanitation`
- **Email**: `officer.rajesh@civicos.gov` | **Password**: `demo123`
- **Key Demo Flow**: Receives Priya's drainage grievance in real-time, reviews Gemini AI severity score, updates status to `IN_PROGRESS` and `RESOLVED`.

### 👮 Persona 4: Anita Desai (Officer - Public Works / Roads)
- **Role**: `officer`
- **Department**: `Public_Works`
- **Email**: `officer.anita@civicos.gov` | **Password**: `demo123`
- **Key Demo Flow**: Manages road repair and pothole queue with automated SLA flags.

---

## 5. Hackathon Success & Judging Checklist

1. **Instant Cold Start**: System starts locally in under 60 seconds.
2. **Deterministic Reliability**: Zero runtime crashes or unhandled exceptions during live submission.
3. **AI Value Proposition**: Gemini's structured output directly saves time by categorizing and summarizing grievances without human intervention.
4. **Complete Feedback Loop**: A full action taken by a citizen appears on the officer portal, and an officer's action updates the citizen's screen.
