# CivicOS - Officer Operations Dashboard 💻

> **High-Density React + TypeScript + Vite + Tailwind CSS Operations Web Portal for Government Department Officers**  
> *Consumes FastAPI Backend (`/api/v1/auth`, `/api/v1/officer`) & Displays Google Gemini AI Triage Insights*

---

## 📌 Features & Capabilities

1. **Secure Officer Authentication**:
   - JWT stateless Bearer token authentication.
   - Strict Role-Based Access Control (RBAC) preventing unauthorized citizen access.
   - 1-click Fast-Fill buttons for synthetic demo officer personas.
2. **Real-Time Department Grievance Queue**:
   - Automatically filters tickets to the officer's jurisdiction (`Water_Sanitation`, `Public_Works`, `Electricity_Board`, `Health_Dept`, `Municipal_Corp`).
   - Dynamic search by Tracking ID, keywords, title, or location.
   - Multi-attribute filter chips for Status and Priority.
3. **AI Triage & Urgency Inspection Card**:
   - Google Gemini AI-assigned category, department, and priority level.
   - Visual AI Urgency Score gauge (0–100%).
   - Executive issue summary & recommended first action.
   - Extracted key entities and locations tags.
4. **Official Status Transition & Audit Trail**:
   - Departmental action form to mark tickets `IN_PROGRESS`, `RESOLVED`, `REJECTED`, or `TRIAGED`.
   - Officer remarks input with 1-click standard quick-insert templates.
   - Immutable audit trail timeline displaying timestamps, officers involved, and remarks history.

---

## 👥 Pre-Configured Demo Officer Personas

| Persona | Role | Department Jurisdiction | Email | Password |
|---|---|---|---|---|
| **Rajesh Kumar** | `officer` | Water Supply & Sanitation | `officer.rajesh@civicos.gov` | `demo123` |
| **Anita Desai** | `officer` | Public Works / Roads | `officer.anita@civicos.gov` | `demo123` |

---

## 🚀 Running the Officer Dashboard

### 1. Ensure Backend is Running (Terminal 1)
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
Backend API will be live at `http://localhost:8000`.

### 2. Start the Frontend Development Server (Terminal 2)
```bash
cd officer-dashboard
npm run dev
```

Open your browser at: **[http://localhost:5173](http://localhost:5173)**

---

## 🛠️ Build & Verification

To verify TypeScript types and generate production bundles:
```bash
cd officer-dashboard
npm run build
```
Build output is generated into `dist/`.
