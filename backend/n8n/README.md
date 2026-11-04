# CivicOS — Hackathon-Grade n8n Civic Automation Orchestration

## 1. System Architecture & Core Authority Principle

CivicOS incorporates **n8n** as an intelligent, event-driven orchestration layer that reacts to authoritative civic grievance events across municipal departments.

```text
                                CITIZEN SUBMITS GRIEVANCE
                                            │
                                            ▼
                    ┌───────────────────────────────────────────────┐
                    │           CivicOS Backend (FastAPI)           │
                    │   ★ AUTHORITATIVE SOURCE OF TRUTH ★           │
                    │   • Real SQLite Database Persistence          │
                    │   • Deterministic Gemini AI Triage            │
                    │   • Living Citizen & Officer Audit Trail      │
                    │   • Immutable Priority & Department RBAC      │
                    └───────────────────────┬───────────────────────┘
                                            │
                             Authoritative Event Dispatch
                        (Non-blocking / Strict 3.0s Timeout)
                                            │
                                            ▼
                    ┌───────────────────────────────────────────────┐
                    │               n8n Webhook Engine              │
                    │         (/webhook/civicos-grievance)          │
                    └───────────────────────┬───────────────────────┘
                                            │
                        ┌───────────────────┴───────────────────┐
                        │                                       │
                        ▼                                       ▼
        ┌───────────────────────────────┐       ┌───────────────────────────────┐
        │   🚨 Smart Escalation Engine   │       │   👥 Community Impact Engine   │
        │   • Critical Fast-Track       │       │   • 0  : No Confirmation      │
        │   • High-Priority Operations  │       │   • 1+ : Community Confirmed  │
        │   • Department Routing        │       │   • 5+ : High Impact          │
        │   • SLA Staleness Monitoring  │       │   • 10+: Widespread Impact    │
        │                               │       │   • 25+: Mass Impact          │
        └───────────────┬───────────────┘       └───────────────┬───────────────┘
                        │                                       │
                        └───────────────────┬───────────────────┘
                                            │
                                            ▼
                    ┌───────────────────────────────────────────────┐
                    │          Citizen Resolution & Follow-Up       │
                    │   • Resolution Notification Preparation       │
                    │   • RESOLUTION_FOLLOWUP_PENDING Event         │
                    │   • Audit Telemetry & Officer Queue Logs      │
                    └───────────────────────────────────────────────┘
```

### Invariant Rules
1. **CivicOS Authority**: CivicOS backend is the single source of truth. n8n **never** overrides status, priority, urgency score, department, officer assignment, or citizen identity.
2. **Resilient Failsafe**: If n8n is offline, slow (> 3.0s), or returns HTTP 4xx/5xx errors, grievance submission, AI triage, database persistence, and officer actions succeed with **100% reliability**.

---

## 2. Supported Authoritative Events

| Event Type | Trigger | Automation Action |
| :--- | :--- | :--- |
| `GRIEVANCE_CREATED` | Citizen submits new grievance | AI triage evaluation, priority queue routing, department dispatch. |
| `GRIEVANCE_CRITICAL` | AI or Officer flags CRITICAL priority | Immediate fast-track escalation and emergency notification dispatch. |
| `COMMUNITY_IMPACT_CHANGED` | Citizen confirms *"I HAVE THIS PROBLEM TOO"* | Threshold classification (`NO_CONFIRMATION` to `MASS_IMPACT`), queue bump. |
| `GRIEVANCE_STATUS_CHANGED` | Officer updates status (`IN_PROGRESS`, etc.) | SLA tracking, operational status monitoring, living timeline sync. |
| `GRIEVANCE_RESOLVED` | Officer officially resolves grievance | Citizen resolution notice, satisfaction survey follow-up preparation. |

---

## 3. Privacy-Safe Payload Specification

CivicOS strictly omits private citizen passwords, tokens, API keys, Aadhaar numbers, and phone numbers.

```json
{
  "event": "GRIEVANCE_CREATED",
  "event_id": "EVT_GRIEVANCE_CREATED_75_1788275000",
  "timestamp": "2026-09-01T15:10:00.000000Z",
  "grievance_id": 75,
  "tracking_id": "GRV-2026-64A7B5",
  "title": "No water supply",
  "category": "Water & Sanitation",
  "department": "Water_Sanitation",
  "priority": "HIGH",
  "urgency_score": 0.85,
  "status": "TRIAGED",
  "community_count": 5,
  "impact_classification": "HIGH_COMMUNITY_IMPACT",
  "is_critical": false,
  "is_high_priority": true,
  "location_summary": "7th Cross, Gandhi Nagar",
  "landmark": "Near Community Hall",
  "ai_summary": "Water supply outage affecting multiple households.",
  "suggested_initial_action": "Dispatch emergency water tanker and inspect supply line.",
  "created_at": "2026-09-01T14:30:00.000000Z",
  "age_hours": 0.67,
  "sla_status": "NORMAL",
  "source": "CivicOS-Backend"
}
```

---

## 4. Multi-Department Routing Matrix

The workflow automatically matches the authoritative department to the appropriate municipal dispatch queue:

| Department (`department`) | Municipal Operations Queue (`department_queue`) |
| :--- | :--- |
| `Water_Sanitation` | `Water_Sanitation_Dispatch` |
| `Public_Works` / `Roads` | `Public_Works_Roads_Dispatch` |
| `Electricity` | `Electricity_Board_Dispatch` |
| `Waste_Management` | `Solid_Waste_Management_Dispatch` |
| `Health` | `Public_Health_Sanitation_Dispatch` |
| Other / Municipal Admin | `General_Municipal_Operations` |

---

## 5. Community Impact Classification Thresholds

When citizens confirm problems via the Citizen App, the n8n community engine evaluates the impact severity:

- **`0` Confirmed** → `NO_CONFIRMATION` (Standard monitoring)
- **`1 - 4` Confirmed** → `COMMUNITY_CONFIRMED` (Community tracking logged)
- **`5 - 9` Confirmed** → `HIGH_COMMUNITY_IMPACT` (Priority queue bump)
- **`10 - 24` Confirmed** → `WIDESPREAD_IMPACT` (Urgent district alert)
- **`25+` Confirmed** → `MASS_IMPACT` (Critical mass escalation)

---

## 6. SLA & Staleness Window Monitoring

The SLA monitor detects unattended grievances across priority classes:

- **`CRITICAL`**: 12-hour response window (Approaching SLA: 8h, Breach Warning: 12h+)
- **`HIGH`**: 24-hour response window (Approaching SLA: 18h, Breach Warning: 24h+)
- **`STANDARD`**: 48-hour response window (Approaching SLA: 36h, Breach Warning: 48h+)

---

## 7. Resolution & Follow-Up Automation

When a `GRIEVANCE_RESOLVED` event is processed:
1. Validates the resolution and official officer remarks.
2. Emits a `RESOLUTION_FOLLOWUP_PENDING` metadata payload.
3. Prepares a citizen satisfaction feedback loop URL (`/feed/{id}`).
4. Logs completion to the audit record.

---

## 8. Security & Idempotency Model

- **Authentication Header**: Webhook dispatches are secured using `X-CivicOS-Secret` and `X-N8N-Webhook-Secret`.
- **Idempotency Key**: Every dispatch carries `X-CivicOS-Event-ID` (`EVT_{event}_{id}_{timestamp}`) to ensure duplicate deliveries are safely ignored.

---

## 9. How to Deploy to n8n (Local or n8n Cloud)

### Option A: Local n8n Instance
```bash
# Start local n8n
npx n8n
# Or Docker:
docker run -it --rm --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n
```

### Option B: n8n Cloud Deployment
1. Log into your n8n Cloud account at `https://<your-subdomain>.app.n8n.cloud`.
2. Go to **Workflows** → **Import from File...**
3. Select `backend/n8n/civicos_smart_attention_workflow.json`.
4. Open the **Security & Idempotency Validator** node and verify your secret in environment or credentials.
5. Copy the Production Webhook URL from the **CivicOS Webhook Receiver** node.
6. In `backend/.env`, set:
   ```env
   N8N_ENABLED=true
   N8N_WEBHOOK_URL=https://<your-subdomain>.app.n8n.cloud/webhook/civicos-grievance
   N8N_WEBHOOK_SECRET=your-secure-secret-key-2026
   N8N_TIMEOUT_SECONDS=3.0
   ```
7. Activate the workflow (**Active: ON**).
