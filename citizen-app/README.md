# CivicOS — Citizen Services Portal 📱

> **Accessible, High-Contrast Mobile-First Citizen Web & PWA Portal for Public Grievances & Welfare Schemes**  
> *Built with React 18, TypeScript, Vite, Tailwind CSS, and Lucide Icons — Designed for Universal Accessibility & Elderly Citizens*

---

## 📌 Key Features & Capabilities

1. **Accessible, Elderly-Friendly Design**:
   - Predominantly clean white/light theme with high-contrast text (`#0f172a` / `#1e293b`).
   - Large touch targets (48px+ for buttons, inputs, and tab navigation).
   - Dynamic 1-tap **Text Size Scaler** (`A`, `A+`, `A++`) in the header.
   - Built-in interactive **Help & Instructions Guide** modal.
2. **Citizen Authentication**:
   - JWT stateless Bearer authentication.
   - 1-tap **Quick-Fill Demo Personas**:
     - **Priya Sharma** (Urban Entrepreneur in Indiranagar, Bengaluru — Solar subsidies & Urban Drainage flow)
     - **Ramesh Patel** (Rural Farmer in Mandya — PM-Kisan & Irrigation Canal flow)
   - New citizen registration with district/state selection.
3. **Home Dashboard**:
   - Personalized greeting and Citizen Twin profile completeness meter.
   - Prominent **"Report a Civic Problem"** hero call-to-action button.
   - Active complaints tracker vs. resolved issues count.
   - Top matched government welfare scheme highlight.
   - Quick-dial emergency public helplines (BWSSB Water, BESCOM Electricity, 112 Emergency).
4. **Smart Grievance Reporting with Google Gemini AI Triage**:
   - Quick-select common problem preset chips (water leaks, potholes, dark streetlights, garbage dump).
   - Input for Title, Description, Location, and Landmark.
   - Post-submission celebratory feedback screen displaying Tracking ID (`GRV-2026-XXXXXX`), assigned Category, Department, Priority badge, Urgency score gauge (0–100%), and AI Summary.
5. **My Grievances & Resolution Timeline Tracker**:
   - Real-time search by ID, keywords, location, or department.
   - Multi-status filter tabs (`All`, `AI Triaged`, `In Progress`, `Resolved`, `Submitted`, `Rejected`).
   - Full drill-down view with **AI Triage Inspection Card** and **Chronological Resolution Timeline** displaying officer actions, remarks, and timestamps.
6. **Welfare Schemes & AI Recommendations**:
   - **"Matched For You (AI)"** feed displaying match confidence percentage and natural language **"Why you qualify"** reasoning.
   - Public scheme catalog with category search and detailed eligibility / application steps.
7. **Citizen Twin Profile Hub**:
   - Socio-economic digital twin parameters (Age, Gender, Occupation, Income range, Residence type: Urban/Rural, BPL status, PwD status, Interests).
   - Editable demographics with real-time profile completeness score updating.

---

## 👥 Pre-Configured Demo Citizen Personas

| Persona | Role | Location | Focus Area | Email | Password |
|---|---|---|---|---|---|
| **Priya Sharma** | `citizen` | Indiranagar, Bengaluru | Urban Boutique Owner • Solar & Drainage | `citizen.priya@example.com` | `demo123` |
| **Ramesh Patel** | `citizen` | Pandavapura, Mandya | Rural Farmer • PM-Kisan & Irrigation | `citizen.ramesh@example.com` | `demo123` |

---

## 🚀 Running the Citizen Portal

### 1. Ensure Backend is Running (Terminal 1)
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
Backend API will be live at `http://localhost:8000`.

### 2. Start the Citizen Portal (Terminal 2)
```bash
cd citizen-app
npm run dev
```

Open your browser at: **[http://localhost:5174](http://localhost:5174)**

*(Note: The Officer Portal runs on port 5173, so both applications can be run and tested simultaneously!)*

---

## 🛠️ Build & Verification

```bash
cd citizen-app
npm run build
```
Build output is generated into `dist/`.
