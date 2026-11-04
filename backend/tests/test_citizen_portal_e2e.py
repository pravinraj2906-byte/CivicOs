import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_1_citizen_login_and_token():
    """1. Citizen login returns access_token and user info for demo account Priya."""
    res = client.post("/api/v1/auth/login", json={
        "email": "citizen.priya@example.com",
        "password": "demo123"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["role"] == "citizen"
    assert data["user"]["email"] == "citizen.priya@example.com"
    assert data["user"]["name"] == "Priya Sharma"


def test_2_citizen_registration():
    """2. Citizen registration creates a valid new user with citizen role."""
    unique_email = "newcitizen.anand@example.com"
    res = client.post("/api/v1/auth/register", json={
        "name": "Anand V",
        "email": unique_email,
        "password": "password123",
        "role": "citizen",
        "state": "Karnataka",
        "district": "Bengaluru Urban",
        "preferred_language": "en"
    })
    assert res.status_code in [201, 400] # 400 if already exists in test run
    if res.status_code == 201:
        assert res.json()["email"] == unique_email
        assert res.json()["role"] == "citizen"


def test_3_and_4_unauthenticated_and_rbac():
    """3 & 4. Unauthenticated requests fail (401) and citizen cannot access officer endpoints (403)."""
    # 401 unauthenticated
    res_unauth = client.get("/api/v1/citizens/me")
    assert res_unauth.status_code == 401

    # Login as citizen
    priya_token = client.post("/api/v1/auth/login", json={
        "email": "citizen.priya@example.com",
        "password": "demo123"
    }).json()["access_token"]

    # 403 Forbidden on officer endpoint
    res_officer = client.get("/api/v1/officer/grievances", headers={"Authorization": f"Bearer {priya_token}"})
    assert res_officer.status_code == 403
    assert "Operation not permitted for role 'citizen'" in res_officer.json()["detail"]


def test_5_and_6_citizen_twin_profile_and_update():
    """5 & 6. Citizen profile loads with Citizen Twin and can be updated via PUT."""
    priya_token = client.post("/api/v1/auth/login", json={
        "email": "citizen.priya@example.com",
        "password": "demo123"
    }).json()["access_token"]

    # GET profile
    get_res = client.get("/api/v1/citizens/me", headers={"Authorization": f"Bearer {priya_token}"})
    assert get_res.status_code == 200
    cit_data = get_res.json()
    assert cit_data["email"] == "citizen.priya@example.com"
    assert "profile" in cit_data

    # PUT update profile
    put_res = client.put("/api/v1/citizens/me/profile", json={
        "occupation": "Boutique Business Owner & Designer",
        "income_range": "2.5L - 5L",
        "residence_type": "urban",
        "interests": "Rooftop Solar, Urban Drainage, Women Entrepreneurship"
    }, headers={"Authorization": f"Bearer {priya_token}"})
    assert put_res.status_code == 200
    updated = put_res.json()
    assert updated["occupation"] == "Boutique Business Owner & Designer"
    assert updated["residence_type"] == "urban"


def test_7_grievance_submission_with_gemini_ai_triage():
    """7. Citizen submits grievance; backend automatically triggers Gemini AI triage."""
    priya_token = client.post("/api/v1/auth/login", json={
        "email": "citizen.priya@example.com",
        "password": "demo123"
    }).json()["access_token"]

    submit_res = client.post("/api/v1/grievances", json={
        "title": "Severe drain leakage and foul sewage odor near market",
        "description": "The underground sewage line has ruptured, flooding the main pedestrian walkway with waste water.",
        "location": "Indiranagar 100ft Road",
        "landmark": "Near Metro Station Pillar 42"
    }, headers={"Authorization": f"Bearer {priya_token}"})
    assert submit_res.status_code == 201
    g = submit_res.json()

    # Verify AI Triage fields
    assert g["tracking_id"].startswith("GRV-2026-")
    assert g["status"] == "TRIAGED"
    assert g["category"] == "Water & Sanitation"
    assert g["department"] == "Water_Sanitation"
    assert g["priority"] in ["HIGH", "CRITICAL", "MEDIUM"]
    assert g["urgency_score"] is not None
    assert g["ai_summary"] is not None
    assert g["suggested_initial_action"] is not None
    assert len(g["updates"]) == 2  # SUBMITTED and TRIAGED audit entries


def test_8_and_9_my_grievances_and_detail_timeline():
    """8 & 9. Citizen can list their grievances and inspect chronological timeline."""
    priya_token = client.post("/api/v1/auth/login", json={
        "email": "citizen.priya@example.com",
        "password": "demo123"
    }).json()["access_token"]

    list_res = client.get("/api/v1/citizens/me/grievances", headers={"Authorization": f"Bearer {priya_token}"})
    assert list_res.status_code == 200
    my_list = list_res.json()
    assert len(my_list) > 0
    sample_id = my_list[0]["id"]

    detail_res = client.get(f"/api/v1/grievances/{sample_id}", headers={"Authorization": f"Bearer {priya_token}"})
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["id"] == sample_id
    assert "updates" in detail
    assert len(detail["updates"]) >= 2


def test_10_and_11_schemes_catalog_and_ai_recommendations():
    """10 & 11. Schemes catalog and personalized AI recommendations load with justifications."""
    priya_token = client.post("/api/v1/auth/login", json={
        "email": "citizen.priya@example.com",
        "password": "demo123"
    }).json()["access_token"]

    # Public catalog
    cat_res = client.get("/api/v1/schemes")
    assert cat_res.status_code == 200
    schemes = cat_res.json()
    assert len(schemes) >= 5

    # AI Personalized recommendations
    recs_res = client.get("/api/v1/citizens/me/recommendations", headers={"Authorization": f"Bearer {priya_token}"})
    assert recs_res.status_code == 200
    recs = recs_res.json()
    assert "recommendations" in recs
    assert len(recs["recommendations"]) > 0
    top = recs["recommendations"][0]
    assert "match_confidence" in top
    assert "why_you_qualify" in top
    assert len(top["why_you_qualify"]) > 0


def test_12_cross_portal_sync_workflow():
    """12. Full end-to-end sync between Citizen App and Officer Dashboard."""
    # 1. Citizen Priya files a complaint
    priya_token = client.post("/api/v1/auth/login", json={
        "email": "citizen.priya@example.com",
        "password": "demo123"
    }).json()["access_token"]

    g_created = client.post("/api/v1/grievances", json={
        "title": "Broken main water valve gushing clean water onto road",
        "description": "High pressure supply pipe burst, flooding street and wasting drinking water.",
        "location": "Indiranagar 5th Cross",
        "landmark": "Near Water Tank"
    }, headers={"Authorization": f"Bearer {priya_token}"}).json()
    g_id = g_created["id"]

    # 2. Officer Rajesh (Water_Sanitation) logs in
    rajesh_token = client.post("/api/v1/auth/login", json={
        "email": "officer.rajesh@civicos.gov",
        "password": "demo123"
    }).json()["access_token"]

    # Officer sees ticket in queue
    officer_queue = client.get("/api/v1/officer/grievances", headers={"Authorization": f"Bearer {rajesh_token}"}).json()
    matching_in_queue = [item for item in officer_queue if item["id"] == g_id]
    assert len(matching_in_queue) == 1

    # Officer updates status to IN_PROGRESS
    client.patch(f"/api/v1/officer/grievances/{g_id}/status", json={
        "status": "IN_PROGRESS",
        "remarks": "BWSSB emergency response van dispatched with pipe repair kit."
    }, headers={"Authorization": f"Bearer {rajesh_token}"})

    # Officer marks RESOLVED
    client.patch(f"/api/v1/officer/grievances/{g_id}/status", json={
        "status": "RESOLVED",
        "remarks": "Main valve gasket replaced and pipeline pressure tested normal."
    }, headers={"Authorization": f"Bearer {rajesh_token}"})

    # 3. Citizen checks tracking timeline and sees all 4 updates in real-time
    citizen_view = client.get(f"/api/v1/grievances/{g_id}", headers={"Authorization": f"Bearer {priya_token}"}).json()
    assert citizen_view["status"] == "RESOLVED"
    statuses = [u["status"] for u in citizen_view["updates"]]
    assert statuses == ["SUBMITTED", "TRIAGED", "IN_PROGRESS", "RESOLVED"]
    assert citizen_view["updates"][-1]["remarks"] == "Main valve gasket replaced and pipeline pressure tested normal."
