# CivicOS - n8n Workflow Automation ⚡

## Overview
The **n8n** automation layer orchestrates event-driven workflows across CivicOS. When a citizen submits a grievance and Gemini completes AI triage, the backend dispatches a webhook to n8n. n8n processes the event, executes routing logic, enforces SLA timers, and simulates automated notifications to relevant officers and citizens.

---

## Planned Directory Structure

```text
n8n/
├── workflows/
│   ├── grievance_routing.json    # Main workflow: Webhook trigger -> Department router -> Alert dispatch
│   └── sla_escalation.json       # Scheduled / Timer workflow: Check pending high-priority grievances
├── docker-compose.yml            # Local one-click Docker setup for n8n + PostgreSQL
└── README.md
```

---

## Workflow Specification: Grievance Routing Flow

```text
[ Webhook Trigger (FastAPI) ]
             │
             ▼
[ Switch Node (by Department) ]
 ├── Water_Sanitation  ──> [ Dispatch to Sanitation Queue & Mock Alert ]
 ├── Public_Works      ──> [ Dispatch to Roads / Infra Queue & Mock Alert ]
 ├── Electricity_Board ──> [ Dispatch to Power Utility Queue & Mock Alert ]
 └── Municipal_Corp    ──> [ Dispatch to General Civic Queue & Mock Alert ]
             │
             ▼
[ Priority Evaluation (High / Critical) ]
 └── If Priority >= HIGH: Set 24h SLA Monitor & Send High-Priority Notice
```

---

## Quickstart (Dockerized n8n)

```bash
cd n8n
docker compose up -d
```
Access the n8n UI at `http://localhost:5678` and import the workflow JSON files from `workflows/`.
