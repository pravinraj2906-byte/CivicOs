from fastapi.testclient import TestClient


def test_get_citizen_profile(client: TestClient, citizen_auth_headers: dict):
    """Test getting current citizen details and Citizen Twin profile."""
    response = client.get("/api/v1/citizens/me", headers=citizen_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "citizen.priya@example.com"
    assert data["profile"] is not None
    assert data["profile"]["age"] == 32
    assert data["profile"]["occupation"] == "Self-Employed / Boutique Owner"
    assert data["profile"]["residence_type"] == "urban"


def test_update_citizen_profile(client: TestClient, citizen_auth_headers: dict):
    """Test updating citizen socio-economic parameters."""
    update_payload = {
        "age": 33,
        "occupation": "Tech Entrepreneur",
        "income_range": "5L - 10L",
        "interests": "AI, Renewable Energy, Public Health",
        "has_disability": False,
    }
    response = client.put(
        "/api/v1/citizens/me/profile",
        json=update_payload,
        headers=citizen_auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["age"] == 33
    assert data["occupation"] == "Tech Entrepreneur"
    assert data["income_range"] == "5L - 10L"
    assert "AI, Renewable Energy" in data["interests"]


def test_get_citizen_recommendations(client: TestClient, citizen_auth_headers: dict):
    """Test retrieving AI-ready scheme recommendations."""
    response = client.get("/api/v1/citizens/me/recommendations", headers=citizen_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "recommendations" in data
    assert len(data["recommendations"]) > 0
    assert "citizen_context_summary" in data
    
    first_rec = data["recommendations"][0]
    assert "scheme_name" in first_rec
    assert "match_confidence" in first_rec
    assert "why_you_qualify" in first_rec


def test_get_my_grievances(client: TestClient, citizen_auth_headers: dict):
    """Test fetching grievances filed by the logged-in citizen."""
    response = client.get("/api/v1/citizens/me/grievances", headers=citizen_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    # Priya has 2 seeded grievances
    assert len(data) >= 2
    assert any(g["title"] == "Severe sewage overflow on 12th Main Road" for g in data)
