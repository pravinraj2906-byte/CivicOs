import sys
import io
import json

# Ensure UTF-8 output on Windows console
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from fastapi.testclient import TestClient
from app.main import app
from app.db.database import SessionLocal
from app.db.models import User, CitizenProfile, Scheme, Grievance, GrievanceUpdate
from app.services.gemini_service import classify_grievance_fallback

def run_verification():
    print("==================================================")
    print("CIVICOS PHASE 2A BACKEND & AI VERIFICATION SCRIPT")
    print("==================================================")
    
    results = {}
    client = TestClient(app)
    
    # 1. FastAPI Startup & Health Endpoint
    try:
        res = client.get("/health")
        assert res.status_code == 200, f"Expected 200, got {res.status_code}"
        data = res.json()
        assert data.get("status") == "ok"
        assert data.get("service") == "CivicOS API"
        results["1. Health endpoint"] = ("PASS", "Returned 200 with status: ok, service: CivicOS API")
        print("[PASS] 1. Health endpoint: PASS")
    except Exception as e:
        results["1. Health endpoint"] = ("FAIL", str(e))
        print("[FAIL] 1. Health endpoint: FAIL -", e)

    # 2. Swagger & OpenAPI
    try:
        res_docs = client.get("/docs")
        assert res_docs.status_code == 200
        res_openapi = client.get("/openapi.json")
        assert res_openapi.status_code == 200
        openapi_data = res_openapi.json()
        assert "paths" in openapi_data
        assert "/api/v1/auth/login" in openapi_data["paths"]
        assert "/api/v1/ai/analyze-grievance" in openapi_data["paths"]
        results["2. Swagger & OpenAPI"] = ("PASS", "/docs, /openapi.json accessible and include AI routes")
        print("[PASS] 2. Swagger & OpenAPI: PASS")
    except Exception as e:
        results["2. Swagger & OpenAPI"] = ("FAIL", str(e))
        print("[FAIL] 2. Swagger & OpenAPI: FAIL -", e)

    # 3. Database & Models
    try:
        db = SessionLocal()
        users_count = db.query(User).count()
        profiles_count = db.query(CitizenProfile).count()
        schemes_count = db.query(Scheme).count()
        grievances_count = db.query(Grievance).count()
        updates_count = db.query(GrievanceUpdate).count()
        
        assert users_count >= 4
        assert schemes_count >= 5
        assert grievances_count >= 3
        results["3. Database & Models"] = ("PASS", f"SQLite running, all models verified. Users: {users_count}, Schemes: {schemes_count}, Grievances: {grievances_count}")
        print("[PASS] 3. Database & Models: PASS")
        db.close()
    except Exception as e:
        results["3. Database & Models"] = ("FAIL", str(e))
        print("[FAIL] 3. Database & Models: FAIL -", e)

    # 4. Seed Data
    try:
        db = SessionLocal()
        priya = db.query(User).filter(User.email == "citizen.priya@example.com").first()
        ramesh = db.query(User).filter(User.email == "citizen.ramesh@example.com").first()
        rajesh = db.query(User).filter(User.email == "officer.rajesh@civicos.gov").first()
        anita = db.query(User).filter(User.email == "officer.anita@civicos.gov").first()
        
        assert priya and priya.role == "citizen"
        assert ramesh and ramesh.role == "citizen"
        assert rajesh and rajesh.role == "officer" and rajesh.department == "Water_Sanitation"
        assert anita and anita.role == "officer" and anita.department == "Public_Works"
        results["4. Seed data"] = ("PASS", "Priya, Ramesh, Rajesh, Anita seeded with correct roles and departments")
        print("[PASS] 4. Seed data: PASS")
        db.close()
    except Exception as e:
        results["4. Seed data"] = ("FAIL", str(e))
        print("[FAIL] 4. Seed data: FAIL -", e)

    # 5. Citizen Login & Auth Token
    citizen_token = None
    try:
        login_res = client.post("/api/v1/auth/login", json={
            "email": "citizen.priya@example.com",
            "password": "demo123"
        })
        assert login_res.status_code == 200
        citizen_token = login_res.json()["access_token"]
        results["5. Citizen login"] = ("PASS", "Citizen Priya logged in, JWT access token retrieved")
        print("[PASS] 5. Citizen login: PASS")
    except Exception as e:
        results["5. Citizen login"] = ("FAIL", str(e))
        print("[FAIL] 5. Citizen login: FAIL -", e)

    # 6. Officer Authentication
    officer_token = None
    try:
        off_login_res = client.post("/api/v1/auth/login", json={
            "email": "officer.rajesh@civicos.gov",
            "password": "demo123"
        })
        assert off_login_res.status_code == 200
        officer_token = off_login_res.json()["access_token"]
        results["6. Officer login"] = ("PASS", "Officer Rajesh authenticated with department: Water_Sanitation")
        print("[PASS] 6. Officer login: PASS")
    except Exception as e:
        results["6. Officer login"] = ("FAIL", str(e))
        print("[FAIL] 6. Officer login: FAIL -", e)

    # 7. AI Analysis Endpoint (/api/v1/ai/analyze-grievance)
    try:
        ai_res = client.post(
            "/api/v1/ai/analyze-grievance",
            json={
                "title": "Broken water pipe",
                "description": "A water pipe has been leaking for two days near our street.",
                "location": "Indiranagar 5th Cross",
            },
            headers={"Authorization": f"Bearer {citizen_token}"}
        )
        assert ai_res.status_code == 200, f"AI analyze returned {ai_res.status_code}: {ai_res.text}"
        ai_data = ai_res.json()
        assert ai_data["category"] == "Water & Sanitation"
        assert ai_data["assigned_department"] == "Water_Sanitation"
        assert ai_data["priority"] in ["HIGH", "CRITICAL", "MEDIUM"]
        assert 0.0 <= ai_data["urgency_score"] <= 1.0
        assert "summary" in ai_data and len(ai_data["summary"]) > 0
        assert "suggested_initial_action" in ai_data and len(ai_data["suggested_initial_action"]) > 0
        assert "source" in ai_data
        results["7. AI Analysis Endpoint"] = ("PASS", f"Returned Category: {ai_data['category']}, Dept: {ai_data['assigned_department']}, Priority: {ai_data['priority']}, Source: {ai_data['source']}")
        print(f"[PASS] 7. AI Analysis Endpoint: PASS (Source: {ai_data['source']})")
    except Exception as e:
        results["7. AI Analysis Endpoint"] = ("FAIL", str(e))
        print("[FAIL] 7. AI Analysis Endpoint: FAIL -", e)

    # 8. Grievance Creation with AI Triage (POST /api/v1/grievances)
    new_grievance_id = None
    new_grievance_tracking_id = None
    try:
        create_res = client.post(
            "/api/v1/grievances",
            json={
                "title": "Garbage not collected",
                "description": "Garbage has not been collected from our street for four days and there is a strong smell.",
                "location": "Indiranagar 12th Main Road",
                "landmark": "Near BDA Complex"
            },
            headers={"Authorization": f"Bearer {citizen_token}"}
        )
        assert create_res.status_code == 201, f"Create returned {create_res.status_code}: {create_res.text}"
        g_data = create_res.json()
        new_grievance_id = g_data["id"]
        new_grievance_tracking_id = g_data["tracking_id"]
        
        assert g_data["status"] == "TRIAGED"
        assert g_data["category"] == "Waste Management"
        assert g_data["department"] == "Municipal_Corp"
        assert g_data["priority"] in ["HIGH", "CRITICAL"]
        assert g_data["urgency_score"] is not None
        assert g_data["ai_summary"] is not None
        assert g_data["suggested_initial_action"] is not None
        assert g_data["ai_source"] in ["GEMINI", "FALLBACK"]
        assert len(g_data["updates"]) == 2  # SUBMITTED and TRIAGED
        assert g_data["updates"][0]["status"] == "SUBMITTED"
        assert g_data["updates"][1]["status"] == "TRIAGED"
        
        results["8. Grievance AI Triage Creation"] = ("PASS", f"Created {new_grievance_tracking_id} with status: TRIAGED, Dept: {g_data['department']}, Priority: {g_data['priority']}")
        print(f"[PASS] 8. Grievance AI Triage Creation: PASS ({new_grievance_tracking_id}, TRIAGED, {g_data['department']})")
    except Exception as e:
        results["8. Grievance AI Triage Creation"] = ("FAIL", str(e))
        print("[FAIL] 8. Grievance AI Triage Creation: FAIL -", e)

    # 9. Officer Status Update Workflow
    try:
        patch_res = client.patch(
            f"/api/v1/officer/grievances/{new_grievance_id}/status",
            json={"status": "IN_PROGRESS", "remarks": "Sanitation compactor vehicle dispatched to clear pile."},
            headers={"Authorization": f"Bearer {officer_token}"}
        )
        assert patch_res.status_code == 200
        assert patch_res.json()["status"] == "IN_PROGRESS"
        assert len(patch_res.json()["updates"]) == 3
        results["9. Officer Status Lifecycle"] = ("PASS", "Updated status to IN_PROGRESS, 3 audit records verified")
        print("[PASS] 9. Officer Status Lifecycle: PASS")
    except Exception as e:
        results["9. Officer Status Lifecycle"] = ("FAIL", str(e))
        print("[FAIL] 9. Officer Status Lifecycle: FAIL -", e)

    # 10. Manual Demo Test Cases Verification
    try:
        # Case 1: Garbage
        c1 = classify_grievance_fallback("Garbage not collected", "Garbage has not been collected for four days and strong smell.")
        assert c1.category == "Waste Management" and c1.assigned_department == "Municipal_Corp"
        
        # Case 2: Water pipe burst
        c2 = classify_grievance_fallback("Water pipe burst", "A main water pipe has burst and water is flooding the road near school.")
        assert c2.category == "Water & Sanitation" and c2.assigned_department == "Water_Sanitation"
        
        # Case 3: Pothole
        c3 = classify_grievance_fallback("Large pothole", "There is a large pothole on the main road causing difficulty for vehicles.")
        assert c3.category == "Roads & Infrastructure" and c3.assigned_department == "Public_Works"
        
        # Case 4: Power failure
        c4 = classify_grievance_fallback("Power failure", "The street transformer appears damaged and the entire area has no electricity.")
        assert c4.category == "Electricity & Energy" and c4.assigned_department == "Electricity_Board"
        
        results["10. Demo Cases (1-4)"] = ("PASS", "All 4 demo cases correctly categorized and routed to departments")
        print("[PASS] 10. Demo Cases (1-4): PASS")
    except Exception as e:
        results["10. Demo Cases (1-4)"] = ("FAIL", str(e))
        print("[FAIL] 10. Demo Cases (1-4): FAIL -", e)

    print("==================================================")
    print("PHASE 2A VERIFICATION COMPLETED SUCCESSFULLY")
    print("==================================================")
    return results

if __name__ == "__main__":
    res = run_verification()
    all_pass = all(status == "PASS" for status, _ in res.values())
    sys.exit(0 if all_pass else 1)
