from fastapi.testclient import TestClient


def test_create_grievance_success(client: TestClient, citizen_auth_headers: dict):
    """Test citizen submitting a new grievance with AI triage."""
    payload = {
        "title": "Streetlight pole broken near 5th cross",
        "description": "The pole was hit by a truck and wires are exposed, posing danger to pedestrians.",
        "location": "5th Cross, Indiranagar",
        "landmark": "Near Children Park",
        "category": "Electricity & Energy",
    }
    response = client.post("/api/v1/grievances", json=payload, headers=citizen_auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == payload["title"]
    assert data["status"] == "TRIAGED"
    assert data["department"] == "Electricity_Board"
    assert data["priority"] in ["HIGH", "CRITICAL"]
    assert data["urgency_score"] is not None
    assert data["ai_summary"] is not None
    assert data["tracking_id"].startswith("GRV-2026-")
    assert len(data["updates"]) == 2
    assert data["updates"][0]["status"] == "SUBMITTED"
    assert data["updates"][1]["status"] == "TRIAGED"



def test_get_grievance_by_tracking_id(client: TestClient, citizen_auth_headers: dict):
    """Test retrieving a grievance with tracking ID."""
    # Retrieve pre-seeded grievance
    response = client.get("/api/v1/grievances/GRV-2026-A19F82", headers=citizen_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["tracking_id"] == "GRV-2026-A19F82"
    assert data["title"] == "Severe sewage overflow on 12th Main Road"
    assert len(data["updates"]) >= 2


def test_citizen_cannot_view_other_citizen_grievance(client: TestClient, citizen_auth_headers: dict):
    """Test that a citizen cannot view another citizen's grievance."""
    # GRV-2026-C44D91 belongs to Ramesh (citizen 2), while headers are for Priya (citizen 1)
    response = client.get("/api/v1/grievances/GRV-2026-C44D91", headers=citizen_auth_headers)
    assert response.status_code == 403
    assert "permission" in response.json()["detail"]


def test_get_nonexistent_grievance_returns_404(client: TestClient, citizen_auth_headers: dict):
    """Test that querying a missing grievance returns 404."""
    response = client.get("/api/v1/grievances/GRV-NONEXISTENT", headers=citizen_auth_headers)
    assert response.status_code == 404
