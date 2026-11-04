from fastapi.testclient import TestClient


def test_citizen_forbidden_from_officer_endpoints(client: TestClient, citizen_auth_headers: dict):
    """Test that a regular citizen cannot access officer queue endpoints."""
    response = client.get("/api/v1/officer/grievances", headers=citizen_auth_headers)
    assert response.status_code == 403
    assert "Operation not permitted" in response.json()["detail"]


def test_officer_can_list_grievances(client: TestClient, officer_auth_headers: dict):
    """Test that an authenticated officer can view the departmental queue."""
    response = client.get("/api/v1/officer/grievances", headers=officer_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0


def test_officer_can_filter_grievances(client: TestClient, officer_auth_headers: dict):
    """Test officer filtering grievances by status."""
    response = client.get(
        "/api/v1/officer/grievances?status=IN_PROGRESS",
        headers=officer_auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    for item in data:
        assert item["status"] == "IN_PROGRESS"


def test_officer_can_view_any_grievance_detail(client: TestClient, officer_auth_headers: dict):
    """Test officer can view any grievance regardless of who submitted it."""
    response = client.get(
        "/api/v1/officer/grievances/GRV-2026-C44D91",
        headers=officer_auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["tracking_id"] == "GRV-2026-C44D91"
    assert len(data["updates"]) >= 1


def test_officer_update_grievance_status(client: TestClient, officer_auth_headers: dict):
    """Test officer updating status to RESOLVED with remarks."""
    patch_payload = {
        "status": "RESOLVED",
        "remarks": "Pipe repair completed and water pressure restored."
    }
    response = client.patch(
        "/api/v1/officer/grievances/GRV-2026-A19F82/status",
        json=patch_payload,
        headers=officer_auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "RESOLVED"
    
    # Check that a new update record was appended to timeline
    last_update = data["updates"][-1]
    assert last_update["status"] == "RESOLVED"
    assert "Pipe repair completed" in last_update["remarks"]
    assert last_update["officer_id"] is not None


def test_officer_invalid_status_rejected(client: TestClient, officer_auth_headers: dict):
    """Test that an invalid status is rejected with 400."""
    patch_payload = {
        "status": "MAGIC_STATUS",
        "remarks": "Testing invalid status"
    }
    response = client.patch(
        "/api/v1/officer/grievances/GRV-2026-A19F82/status",
        json=patch_payload,
        headers=officer_auth_headers,
    )
    assert response.status_code == 400
    assert "Invalid status" in response.json()["detail"]
