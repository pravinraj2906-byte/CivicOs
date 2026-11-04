import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.db.models.grievance import Grievance
from app.db.models.user import User
from app.core.security import hash_password


def test_get_civic_feed_public(client: TestClient):
    """Test retrieving public civic feed without authentication."""
    response = client.get("/api/v1/feed")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert "page" in data
    assert "limit" in data
    assert data["total"] >= 3
    assert len(data["items"]) >= 3

    # Verify first item structure
    item = data["items"][0]
    assert "id" in item
    assert "grievance_id" in item
    assert "tracking_id" in item
    assert "title" in item
    assert "description" in item
    assert "category" in item
    assert "department" in item
    assert "priority" in item
    assert "status" in item
    assert "community_count" in item
    assert "confirmed_by_current_user" in item
    assert item["confirmed_by_current_user"] is False
    assert "timeline" in item
    assert len(item["timeline"]) >= 1


def test_feed_privacy_protection(client: TestClient):
    """Test that public feed strictly protects citizen privacy."""
    response = client.get("/api/v1/feed")
    assert response.status_code == 200
    items = response.json()["items"]
    
    for item in items:
        author = item["author"]
        assert "display_name" in author
        assert "avatar_url" in author
        # Must NEVER leak private fields
        assert "email" not in author
        assert "phone" not in author
        assert "password" not in author
        assert "password_hash" not in author
        assert "token" not in author
        assert "aadhaar" not in author


def test_feed_pagination(client: TestClient):
    """Test pagination parameters."""
    res1 = client.get("/api/v1/feed?page=1&limit=2")
    assert res1.status_code == 200
    data1 = res1.json()
    assert len(data1["items"]) == 2
    assert data1["page"] == 1
    assert data1["limit"] == 2
    assert data1["has_more"] is True

    res2 = client.get("/api/v1/feed?page=2&limit=2")
    assert res2.status_code == 200
    data2 = res2.json()
    assert len(data2["items"]) >= 1
    assert data2["page"] == 2


def test_feed_filtering(client: TestClient):
    """Test filtering feed by status, department, and priority."""
    # Filter by department
    res_dept = client.get("/api/v1/feed?department=Water_Sanitation")
    assert res_dept.status_code == 200
    for item in res_dept.json()["items"]:
        assert item["department"] == "Water_Sanitation"

    # Filter by priority
    res_prio = client.get("/api/v1/feed?priority=CRITICAL")
    assert res_prio.status_code == 200
    for item in res_prio.json()["items"]:
        assert item["priority"] == "CRITICAL"


def test_get_single_feed_item(client: TestClient):
    """Test retrieving a single feed item by integer ID or tracking ID."""
    # By ID
    res = client.get("/api/v1/feed/1")
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == 1
    assert data["tracking_id"] == "GRV-2026-A19F82"
    assert len(data["timeline"]) >= 2

    # By Tracking ID
    res_track = client.get("/api/v1/feed/GRV-2026-A19F82")
    assert res_track.status_code == 200
    assert res_track.json()["id"] == 1


def test_get_feed_item_not_found(client: TestClient):
    """Test 404 response for non-existent grievance."""
    res = client.get("/api/v1/feed/999999")
    assert res.status_code == 404


def test_community_confirmation_flow(client: TestClient, citizen_auth_headers: dict[str, str]):
    """Test citizen confirming 'I have this problem too'."""
    grv_id = 1
    
    # 1. Unconfirmed initial state
    res_before = client.get("/api/v1/feed/1", headers=citizen_auth_headers)
    assert res_before.status_code == 200
    assert res_before.json()["community_count"] == 0
    assert res_before.json()["confirmed_by_current_user"] is False

    # 2. Confirm problem
    res_confirm = client.post(f"/api/v1/feed/{grv_id}/confirm", headers=citizen_auth_headers)
    assert res_confirm.status_code == 200
    assert res_confirm.json()["confirmed"] is True
    assert res_confirm.json()["community_count"] == 1

    # 3. Check feed reflects confirmation
    res_after = client.get(f"/api/v1/feed/{grv_id}", headers=citizen_auth_headers)
    assert res_after.status_code == 200
    assert res_after.json()["community_count"] == 1
    assert res_after.json()["confirmed_by_current_user"] is True

    # 4. Duplicate confirmation idempotency (does not increase count)
    res_dup = client.post(f"/api/v1/feed/{grv_id}/confirm", headers=citizen_auth_headers)
    assert res_dup.status_code == 200
    assert res_dup.json()["community_count"] == 1

    # 5. Remove confirmation
    res_del = client.delete(f"/api/v1/feed/{grv_id}/confirm", headers=citizen_auth_headers)
    assert res_del.status_code == 200
    assert res_del.json()["confirmed"] is False
    assert res_del.json()["community_count"] == 0


def test_multiple_citizens_confirmation(client: TestClient, db_session: Session):
    """Test multiple distinct citizens confirming the same issue."""
    # Create second citizen
    user2 = User(
        name="Sunil Rao",
        email="citizen.sunil@example.com",
        password_hash=hash_password("demo123"),
        role="citizen",
        state="Karnataka",
        district="Bengaluru Urban",
    )
    db_session.add(user2)
    db_session.commit()

    # Login Priya (Citizen 1)
    login1 = client.post("/api/v1/auth/login", json={"email": "citizen.priya@example.com", "password": "demo123"})
    headers1 = {"Authorization": f"Bearer {login1.json()['access_token']}"}

    # Login Sunil (Citizen 2)
    login2 = client.post("/api/v1/auth/login", json={"email": "citizen.sunil@example.com", "password": "demo123"})
    headers2 = {"Authorization": f"Bearer {login2.json()['access_token']}"}

    grv_id = 2

    # Citizen 1 confirms
    r1 = client.post(f"/api/v1/feed/{grv_id}/confirm", headers=headers1)
    assert r1.status_code == 200
    assert r1.json()["community_count"] == 1

    # Citizen 2 confirms
    r2 = client.post(f"/api/v1/feed/{grv_id}/confirm", headers=headers2)
    assert r2.status_code == 200
    assert r2.json()["community_count"] == 2

    # Check feed for Citizen 1 vs Citizen 2
    f1 = client.get(f"/api/v1/feed/{grv_id}", headers=headers1).json()
    assert f1["community_count"] == 2
    assert f1["confirmed_by_current_user"] is True

    f2 = client.get(f"/api/v1/feed/{grv_id}", headers=headers2).json()
    assert f2["community_count"] == 2
    assert f2["confirmed_by_current_user"] is True


def test_unauthenticated_confirmation_fails(client: TestClient):
    """Test confirming without authentication fails with 401."""
    res = client.post("/api/v1/feed/1/confirm")
    assert res.status_code == 401


def test_officer_cannot_confirm_as_citizen(client: TestClient, officer_auth_headers: dict[str, str]):
    """Test that officers cannot call citizen confirmation endpoint."""
    res = client.post("/api/v1/feed/1/confirm", headers=officer_auth_headers)
    assert res.status_code == 403


def test_feed_bilingual_timeline_labels(client: TestClient):
    """Test Tamil and English timeline labels in feed."""
    # English
    res_en = client.get("/api/v1/feed/1?language=en")
    assert res_en.status_code == 200
    tl_en = res_en.json()["timeline"]
    assert tl_en[0]["label"] == "Citizen Report"

    # Tamil
    res_ta = client.get("/api/v1/feed/1?language=ta")
    assert res_ta.status_code == 200
    tl_ta = res_ta.json()["timeline"]
    assert tl_ta[0]["label"] == "குடிமக்கள் புகார்"


def test_living_timeline_status_propagation(client: TestClient, officer_auth_headers: dict[str, str]):
    """Test that officer status updates propagate to the single canonical feed item."""
    grv_id = 2  # Currently SUBMITTED

    # Check feed before
    res1 = client.get(f"/api/v1/feed/{grv_id}")
    assert res1.json()["status"] == "SUBMITTED"

    # Officer marks IN_PROGRESS
    client.patch(
        f"/api/v1/officer/grievances/{grv_id}/status",
        json={"status": "IN_PROGRESS", "remarks": "Road repair team dispatched."},
        headers=officer_auth_headers
    )

    # Check feed reflects IN_PROGRESS on SAME canonical item
    res2 = client.get(f"/api/v1/feed/{grv_id}")
    assert res2.json()["status"] == "IN_PROGRESS"
    assert any(t["status"] == "IN_PROGRESS" for t in res2.json()["timeline"])

    # Officer marks RESOLVED
    client.patch(
        f"/api/v1/officer/grievances/{grv_id}/status",
        json={"status": "RESOLVED", "remarks": "Potholes filled with asphalt."},
        headers=officer_auth_headers
    )

    # Check feed reflects RESOLVED with public resolution event
    res3 = client.get(f"/api/v1/feed/{grv_id}")
    assert res3.json()["status"] == "RESOLVED"
    res_events = [t for t in res3.json()["timeline"] if t["status"] == "RESOLVED"]
    assert len(res_events) == 1
    assert res_events[0]["stage"] == "RESOLUTION"
    assert res_events[0]["label"] == "Public Resolution"


def test_officer_impact_visibility(client: TestClient, citizen_auth_headers: dict[str, str], officer_auth_headers: dict[str, str]):
    """Test that officer queries see the real community impact count."""
    grv_id = 3

    # Citizen confirms
    client.post(f"/api/v1/feed/{grv_id}/confirm", headers=citizen_auth_headers)

    # Officer lists grievances
    res = client.get("/api/v1/officer/grievances", headers=officer_auth_headers)
    assert res.status_code == 200
    matching = [g for g in res.json() if g["id"] == grv_id]
    assert len(matching) == 1
    assert matching[0]["community_count"] == 1
