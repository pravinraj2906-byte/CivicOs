from fastapi.testclient import TestClient


def test_user_registration(client: TestClient):
    """Test registering a new citizen."""
    payload = {
        "name": "Kavita Rao",
        "email": "kavita.rao@example.com",
        "password": "SecretPassword99!",
        "role": "citizen",
        "state": "Karnataka",
        "district": "Mysuru",
        "preferred_language": "kn",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "kavita.rao@example.com"
    assert data["name"] == "Kavita Rao"
    assert data["role"] == "citizen"
    assert "id" in data


def test_duplicate_registration_fails(client: TestClient):
    """Test that registering with an existing email returns 400."""
    payload = {
        "name": "Priya Duplicate",
        "email": "citizen.priya@example.com",  # Already in seed data
        "password": "anyPassword123",
        "role": "citizen",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_login_success(client: TestClient):
    """Test successful login returns a valid JWT token."""
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "citizen.priya@example.com", "password": "demo123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "citizen.priya@example.com"
    assert data["user"]["role"] == "citizen"


def test_login_invalid_password(client: TestClient):
    """Test that invalid password returns 401 Unauthorized."""
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "citizen.priya@example.com", "password": "WrongPassword!"},
    )
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]


def test_get_current_user_me(client: TestClient, citizen_auth_headers: dict):
    """Test /api/v1/auth/me returns current user info."""
    response = client.get("/api/v1/auth/me", headers=citizen_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "citizen.priya@example.com"
    assert data["role"] == "citizen"


def test_unauthenticated_request_fails(client: TestClient):
    """Test that requesting protected route without token returns 401."""
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401
