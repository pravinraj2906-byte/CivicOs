import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_1_officer_login_works():
    """1. Officer login works and returns valid token with officer role."""
    res = client.post("/api/v1/auth/login", json={
        "email": "officer.rajesh@civicos.gov",
        "password": "demo123"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["role"] == "officer"
    assert data["user"]["department"] == "Water_Sanitation"


def test_2_invalid_login_handled():
    """2. Invalid login credentials return 401 with descriptive error message."""
    res = client.post("/api/v1/auth/login", json={
        "email": "officer.rajesh@civicos.gov",
        "password": "wrongpassword"
    })
    assert res.status_code == 401
    assert "Invalid email or password" in res.json()["detail"]


def test_3_citizen_cannot_access_officer_dashboard():
    """3. Citizen user authentication is rejected from officer endpoints with 403."""
    # Login as citizen Priya
    cit_res = client.post("/api/v1/auth/login", json={
        "email": "citizen.priya@example.com",
        "password": "demo123"
    })
    assert cit_res.status_code == 200
    cit_token = cit_res.json()["access_token"]

    # Citizen tries to access officer grievance queue
    q_res = client.get("/api/v1/officer/grievances", headers={"Authorization": f"Bearer {cit_token}"})
    assert q_res.status_code == 403
    assert "Operation not permitted for role 'citizen'" in q_res.json()["detail"]


def test_4_officer_grievance_queue_loads():
    """4. Officer grievance queue loads with department-scoped tickets and filter support."""
    # Login as Officer Anita (Public Works)
    anita_res = client.post("/api/v1/auth/login", json={
        "email": "officer.anita@civicos.gov",
        "password": "demo123"
    })
    anita_token = anita_res.json()["access_token"]

    # Fetch queue
    queue_res = client.get("/api/v1/officer/grievances", headers={"Authorization": f"Bearer {anita_token}"})
    assert queue_res.status_code == 200
    grievances = queue_res.json()
    assert isinstance(grievances, list)
    assert len(grievances) > 0
    # Every item has tracking_id, title, category, priority, status
    first = grievances[0]
    assert "tracking_id" in first
    assert "category" in first
    assert "priority" in first
    assert "status" in first


def test_5_and_6_grievance_details_and_ai_analysis_fields():
    """5 & 6. Grievance details load with complete AI analysis metadata."""
    rajesh_res = client.post("/api/v1/auth/login", json={
        "email": "officer.rajesh@civicos.gov",
        "password": "demo123"
    })
    rajesh_token = rajesh_res.json()["access_token"]

    # Retrieve pre-seeded sewage grievance
    detail_res = client.get(
        "/api/v1/officer/grievances/GRV-2026-A19F82",
        headers={"Authorization": f"Bearer {rajesh_token}"}
    )
    assert detail_res.status_code == 200
    detail = detail_res.json()

    # Grievance core
    assert detail["tracking_id"] == "GRV-2026-A19F82"
    assert "sewage" in detail["title"].lower() or "drain" in detail["description"].lower()
    
    # Citizen details
    assert detail["citizen"] is not None
    assert detail["citizen"]["name"] == "Priya Sharma"

    # AI Analysis fields
    assert detail["category"] == "Water & Sanitation"
    assert detail["department"] == "Water_Sanitation"
    assert detail["priority"] in ["HIGH", "CRITICAL"]
    assert detail["urgency_score"] is not None
    assert detail["ai_summary"] is not None
    assert isinstance(detail["updates"], list)
    assert len(detail["updates"]) >= 2


def test_7_8_9_officer_status_update_remarks_and_timeline():
    """7, 8, 9. Officer updates status, remarks are saved, and timeline reflects the update."""
    # 1. Citizen creates a fresh grievance
    priya_token = client.post("/api/v1/auth/login", json={
        "email": "citizen.priya@example.com",
        "password": "demo123"
    }).json()["access_token"]

    create_res = client.post("/api/v1/grievances", json={
        "title": "Severe water contamination near colony pump",
        "description": "Murky foul-smelling water coming from domestic supply line.",
        "location": "Indiranagar 8th Cross",
        "landmark": "Near Community Park"
    }, headers={"Authorization": f"Bearer {priya_token}"})
    assert create_res.status_code == 201
    g_data = create_res.json()
    g_id = g_data["id"]

    # 2. Officer Rajesh logs in
    rajesh_token = client.post("/api/v1/auth/login", json={
        "email": "officer.rajesh@civicos.gov",
        "password": "demo123"
    }).json()["access_token"]

    # Initial state: TRIAGED with 2 updates (SUBMITTED, TRIAGED)
    initial_detail = client.get(f"/api/v1/officer/grievances/{g_id}", headers={"Authorization": f"Bearer {rajesh_token}"}).json()
    assert initial_detail["status"] == "TRIAGED"
    assert len(initial_detail["updates"]) == 2

    # 3. Officer updates status to IN_PROGRESS with remarks
    remarks_text_1 = "BWSSB contamination testing unit dispatched to 8th Cross."
    patch_1 = client.patch(f"/api/v1/officer/grievances/{g_id}/status", json={
        "status": "IN_PROGRESS",
        "remarks": remarks_text_1
    }, headers={"Authorization": f"Bearer {rajesh_token}"})
    assert patch_1.status_code == 200
    res_1 = patch_1.json()
    assert res_1["status"] == "IN_PROGRESS"
    assert len(res_1["updates"]) == 3
    assert res_1["updates"][-1]["remarks"] == remarks_text_1
    assert res_1["updates"][-1]["officer_id"] is not None

    # 4. Officer updates status to RESOLVED with resolution remarks
    remarks_text_2 = "Cross-connection leak isolated and pipeline flushed with chlorine. Water purity tested normal."
    patch_2 = client.patch(f"/api/v1/officer/grievances/{g_id}/status", json={
        "status": "RESOLVED",
        "remarks": remarks_text_2
    }, headers={"Authorization": f"Bearer {rajesh_token}"})
    assert patch_2.status_code == 200
    res_2 = patch_2.json()
    assert res_2["status"] == "RESOLVED"
    assert len(res_2["updates"]) == 4
    assert res_2["updates"][-1]["remarks"] == remarks_text_2

    # 5. Timeline query verification
    final_view = client.get(f"/api/v1/officer/grievances/{g_id}", headers={"Authorization": f"Bearer {rajesh_token}"}).json()
    assert final_view["status"] == "RESOLVED"
    timeline_statuses = [u["status"] for u in final_view["updates"]]
    assert timeline_statuses == ["SUBMITTED", "TRIAGED", "IN_PROGRESS", "RESOLVED"]


def test_10_refresh_and_query_filters():
    """10. Filtering by status, department, and priority produces accurate subsets."""
    rajesh_token = client.post("/api/v1/auth/login", json={
        "email": "officer.rajesh@civicos.gov",
        "password": "demo123"
    }).json()["access_token"]

    # Filter resolved
    resolved_res = client.get(
        "/api/v1/officer/grievances?status=RESOLVED",
        headers={"Authorization": f"Bearer {rajesh_token}"}
    )
    assert resolved_res.status_code == 200
    for item in resolved_res.json():
        assert item["status"] == "RESOLVED"

    # Filter priority HIGH
    high_res = client.get(
        "/api/v1/officer/grievances?priority=HIGH",
        headers={"Authorization": f"Bearer {rajesh_token}"}
    )
    assert high_res.status_code == 200
    for item in high_res.json():
        assert item["priority"] == "HIGH"


def test_11_unauthorized_token_handled():
    """11. Invalid/missing JWT token returns 401 cleanly."""
    res = client.get("/api/v1/officer/grievances", headers={"Authorization": "Bearer invalid.jwt.token"})
    assert res.status_code == 401


def test_12_backend_health_check_available():
    """12. Backend health endpoint /health is 200 OK."""
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"
