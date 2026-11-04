# CivicOS REST API Specification 🔌

## 1. Overview & General Conventions

- **Base URL**: `http://localhost:8000/api/v1`
- **Protocol**: HTTP/1.1 or HTTP/2 over TLS (HTTPS in production)
- **Data Format**: `application/json`
- **Authentication**: Stateless Bearer Token (`Authorization: Bearer <JWT_TOKEN>`)
- **Roles**:
  - `citizen`: Citizen end-user
  - `officer`: Departmental government official
  - `admin`: Platform administrator

### Standard Error Response Format
```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Grievance with ID grv_123 was not found.",
    "details": null
  }
}
```

---

## 2. Authentication & Identity Endpoints (`/auth`)

### 2.1 Register User
- **Method**: `POST`
- **Path**: `/api/v1/auth/register`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "citizen.priya@example.com",
  "password": "SecurePassword123!",
  "full_name": "Priya Sharma",
  "phone": "+919876543210",
  "role": "citizen"
}
```
- **Response (201 Created)**:
```json
{
  "user_id": "usr_9981a",
  "email": "citizen.priya@example.com",
  "full_name": "Priya Sharma",
  "role": "citizen",
  "created_at": "2026-08-24T14:30:00Z"
}
```

---

### 2.2 Login (Token Generation)
- **Method**: `POST`
- **Path**: `/api/v1/auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "citizen.priya@example.com",
  "password": "SecurePassword123!"
}
```
- **Response (200 OK)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 86400,
  "user": {
    "id": "usr_9981a",
    "email": "citizen.priya@example.com",
    "full_name": "Priya Sharma",
    "role": "citizen",
    "department": null
  }
}
```

---

### 2.3 Get Current User Profile
- **Method**: `GET`
- **Path**: `/api/v1/auth/me`
- **Access**: Authenticated (`citizen`, `officer`, `admin`)
- **Response (200 OK)**:
```json
{
  "id": "usr_9981a",
  "email": "citizen.priya@example.com",
  "full_name": "Priya Sharma",
  "phone": "+919876543210",
  "role": "citizen",
  "department": null,
  "created_at": "2026-08-24T14:30:00Z"
}
```

---

## 3. Citizen Twin / Profile Endpoints (`/citizens`)

### 3.1 Get Citizen Twin Profile
- **Method**: `GET`
- **Path**: `/api/v1/citizens/profile`
- **Access**: Authenticated (`citizen`)
- **Response (200 OK)**:
```json
{
  "user_id": "usr_9981a",
  "age": 32,
  "gender": "female",
  "occupation": "Self-Employed / Small Business",
  "annual_income": 450000,
  "state": "Karnataka",
  "district": "Bengaluru Urban",
  "residence_type": "urban",
  "family_size": 4,
  "is_bpl": false,
  "has_disability": false,
  "interests": ["Renewable Energy", "Small Business Support", "Healthcare"]
}
```

---

### 3.2 Update / Upsert Citizen Twin Profile
- **Method**: `PUT`
- **Path**: `/api/v1/citizens/profile`
- **Access**: Authenticated (`citizen`)
- **Request Body**:
```json
{
  "age": 32,
  "gender": "female",
  "occupation": "Self-Employed / Small Business",
  "annual_income": 450000,
  "state": "Karnataka",
  "district": "Bengaluru Urban",
  "residence_type": "urban",
  "family_size": 4,
  "is_bpl": false,
  "has_disability": false,
  "interests": ["Renewable Energy", "Small Business Support"]
}
```
- **Response (200 OK)**: (Returns updated Citizen Twin object)

---

## 4. Government Schemes & AI Recommendations (`/schemes`)

### 4.1 List Public Schemes
- **Method**: `GET`
- **Path**: `/api/v1/schemes`
- **Access**: Public / Authenticated
- **Query Params**: `?category=agriculture&residence_type=rural`
- **Response (200 OK)**:
```json
{
  "total": 6,
  "items": [
    {
      "id": "SCH_001",
      "title": "PM Surya Ghar: Muft Bijli Yojana",
      "category": "Energy & Sustainability",
      "department": "Ministry of New and Renewable Energy",
      "description": "Financial subsidy for installing rooftop solar systems up to 3kW.",
      "benefits": "Subsidy of ₹30,000 to ₹78,000 for residential households.",
      "eligibility_summary": "Residential homeowner, grid-connected power connection.",
      "application_url": "https://pmsuryaghar.gov.in"
    }
  ]
}
```

---

### 4.2 Get AI-Powered Scheme Recommendations
- **Method**: `POST`
- **Path**: `/api/v1/schemes/recommendations`
- **Access**: Authenticated (`citizen`)
- **Description**: Uses Google Gemini to analyze the citizen's Twin profile against active government schemes to generate ranked, personalized recommendations with human-readable eligibility justifications.
- **Request Body**: Empty or optional override filters `{}`
- **Response (200 OK)**:
```json
{
  "generated_at": "2026-08-24T14:35:00Z",
  "citizen_context_summary": "Urban female entrepreneur in Bengaluru, income ₹4.5L/yr",
  "recommendations": [
    {
      "scheme_id": "SCH_001",
      "scheme_title": "PM Surya Ghar: Muft Bijli Yojana",
      "match_confidence": 0.94,
      "why_you_qualify": "As an urban resident with moderate electricity usage and independent roofing, you are eligible for up to ₹78,000 in direct solar subsidies.",
      "estimated_benefit_value": "₹78,000 subsidy + ₹1,500/mo electricity bill reduction",
      "action_steps": "Submit your electricity consumer number and roof area measurement."
    },
    {
      "scheme_id": "SCH_004",
      "scheme_title": "Stand-Up India / MUDRA Scheme for Women Entrepreneurs",
      "match_confidence": 0.88,
      "why_you_qualify": "Matching your profile as a self-employed female business owner.",
      "estimated_benefit_value": "Collateral-free business credit up to ₹10 Lakhs",
      "action_steps": "Submit Udyam registration and current account statement."
    }
  ]
}
```

---

## 5. Grievance Management & AI Triage (`/grievances`)

### 5.1 Submit a Grievance (With Automatic AI Triage)
- **Method**: `POST`
- **Path**: `/api/v1/grievances`
- **Access**: Authenticated (`citizen`)
- **Request Body**:
```json
{
  "title": "Severe sewage water overflow on 12th Main Road",
  "description": "The main drain near 12th Main Indiranagar has been overflowing for 3 days. Foul smell and contaminated water entering nearby residential gates.",
  "location": "12th Main Road, Indiranagar, Bengaluru",
  "landmark": "Near BDA Complex",
  "image_url": "https://example.com/uploads/overflow_drain.jpg"
}
```
- **Internal Processing**:
  1. Calls **Google Gemini** to classify category, urgency, department, and summary.
  2. Saves grievance record with status `TRIAGED` and priority `HIGH`.
  3. Triggers **n8n Webhook** with triage payload for automated routing.
- **Response (201 Created)**:
```json
{
  "id": "GRV-2026-0891",
  "title": "Severe sewage water overflow on 12th Main Road",
  "status": "TRIAGED",
  "submitted_at": "2026-08-24T14:40:00Z",
  "ai_triage": {
    "category": "Water & Sanitation",
    "assigned_department": "Water_Sanitation",
    "priority": "HIGH",
    "urgency_score": 0.88,
    "ai_summary": "Sewage drain overflow causing public health risk and access disruption.",
    "suggested_action": "Deploy jetting machine and dispatch sanitation maintenance crew."
  },
  "assigned_department": "Water_Sanitation",
  "priority": "HIGH"
}
```

---

### 5.2 List Grievances (Role-filtered)
- **Method**: `GET`
- **Path**: `/api/v1/grievances`
- **Access**: Authenticated (`citizen` sees own, `officer` sees departmental, `admin` sees all)
- **Query Parameters**:
  - `status`: `SUBMITTED | TRIAGED | IN_PROGRESS | RESOLVED | REJECTED`
  - `priority`: `LOW | MEDIUM | HIGH | CRITICAL`
  - `department`: `Water_Sanitation | Public_Works | Electricity_Board | Municipal_Corp`
- **Response (200 OK)**:
```json
{
  "total": 1,
  "items": [
    {
      "id": "GRV-2026-0891",
      "title": "Severe sewage water overflow on 12th Main Road",
      "status": "TRIAGED",
      "priority": "HIGH",
      "assigned_department": "Water_Sanitation",
      "submitted_at": "2026-08-24T14:40:00Z",
      "updated_at": "2026-08-24T14:40:05Z",
      "citizen_name": "Priya Sharma"
    }
  ]
}
```

---

### 5.3 Get Single Grievance Detail & Timeline
- **Method**: `GET`
- **Path**: `/api/v1/grievances/{id}`
- **Access**: Authenticated (Owner Citizen, Assigned Officer, Admin)
- **Response (200 OK)**:
```json
{
  "id": "GRV-2026-0891",
  "title": "Severe sewage water overflow on 12th Main Road",
  "description": "The main drain near 12th Main Indiranagar has been overflowing for 3 days...",
  "location": "12th Main Road, Indiranagar, Bengaluru",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "assigned_department": "Water_Sanitation",
  "submitted_at": "2026-08-24T14:40:00Z",
  "ai_triage": {
    "category": "Water & Sanitation",
    "urgency_score": 0.88,
    "ai_summary": "Sewage drain overflow causing public health risk."
  },
  "timeline": [
    {
      "id": "LOG_01",
      "status": "SUBMITTED",
      "actor_name": "Priya Sharma",
      "actor_role": "citizen",
      "notes": "Grievance lodged via CivicOS Citizen App",
      "timestamp": "2026-08-24T14:40:00Z"
    },
    {
      "id": "LOG_02",
      "status": "TRIAGED",
      "actor_name": "CivicOS Gemini AI Engine",
      "actor_role": "system",
      "notes": "Automated triage assigned priority: HIGH, Dept: Water_Sanitation",
      "timestamp": "2026-08-24T14:40:02Z"
    },
    {
      "id": "LOG_03",
      "status": "IN_PROGRESS",
      "actor_name": "Officer Rajesh Kumar (Sanitation)",
      "actor_role": "officer",
      "notes": "Maintenance vehicle BWSSB-44 dispatched to site.",
      "timestamp": "2026-08-24T15:10:00Z"
    }
  ]
}
```

---

### 5.4 Update Grievance Status (Officer Action)
- **Method**: `PATCH`
- **Path**: `/api/v1/grievances/{id}/status`
- **Access**: Authenticated (`officer`, `admin`)
- **Request Body**:
```json
{
  "status": "RESOLVED",
  "notes": "Drain blockage cleared and disinfectant sprayed. Tested flow normal.",
  "resolution_proof_url": "https://example.com/proof/cleaned_drain.jpg"
}
```
- **Response (200 OK)**:
```json
{
  "id": "GRV-2026-0891",
  "status": "RESOLVED",
  "updated_at": "2026-08-24T16:00:00Z",
  "message": "Grievance marked as RESOLVED and citizen notified."
}
```

---

## 6. Officer Metrics & Queue Statistics (`/officer`)

### 6.1 Get Department Triage Metrics
- **Method**: `GET`
- **Path**: `/api/v1/officer/stats`
- **Access**: Authenticated (`officer`, `admin`)
- **Response (200 OK)**:
```json
{
  "department": "Water_Sanitation",
  "total_assigned": 42,
  "pending_triage": 3,
  "in_progress": 14,
  "resolved_today": 8,
  "high_priority_unresolved": 4,
  "average_resolution_hours": 18.5
}
```

---

## 7. Webhook Integrations (`/webhooks`)

### 7.1 n8n Callback / Escalation Receiver
- **Method**: `POST`
- **Path**: `/api/v1/webhooks/n8n/escalate`
- **Access**: Protected by Webhook Secret Header (`X-CivicOS-Webhook-Secret`)
- **Request Body**:
```json
{
  "grievance_id": "GRV-2026-0891",
  "escalation_level": "LEVEL_2",
  "reason": "SLA breached: High-priority issue untouched for > 24 hours"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "updated_priority": "CRITICAL"
}
```
