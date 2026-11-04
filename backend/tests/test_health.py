from fastapi.testclient import TestClient


def test_health_check(client: TestClient):
    """Test the /health endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "CivicOS API"


def test_root_endpoint(client: TestClient):
    """Test the root endpoint /."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "CivicOS API" in data["message"]
    assert data["docs"] == "/docs"
