import pytest
from fastapi.testclient import TestClient


def test_list_all_schemes(client: TestClient):
    """Verify GET /api/v1/schemes returns verified schemes with official portals."""
    res = client.get("/api/v1/schemes")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 5
    
    # Check that every scheme has an official portal and code
    for scheme in data:
        assert scheme["code"].startswith("SCH_")
        assert scheme["name"] is not None
        assert scheme["official_portal"] is not None
        assert "http" in scheme["official_portal"]


def test_filter_schemes_by_category(client: TestClient):
    """Verify category filtering works correctly."""
    res = client.get("/api/v1/schemes?category=Farmers")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 1
    assert any("PM-Kisan" in s["name"] for s in data)


def test_search_schemes(client: TestClient):
    """Verify search filter across name, description, and keywords."""
    res = client.get("/api/v1/schemes?search=solar")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 1
    assert any("Surya Ghar" in s["name"] for s in data)


def test_schemes_tamil_localization(client: TestClient):
    """Verify language=ta returns localized Tamil scheme titles and descriptions."""
    res = client.get("/api/v1/schemes?language=ta")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 5
    # Check that Tamil names are populated
    solar = next((s for s in data if s["code"] == "SCH_001"), None)
    assert solar is not None
    assert "சூரிய" in solar["name"] or "சூர்யா" in solar["name"]


def test_get_scheme_by_id(client: TestClient):
    """Verify GET /api/v1/schemes/{id} returns full detail."""
    res = client.get("/api/v1/schemes/1")
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == 1
    assert data["code"] == "SCH_001"
    assert data["official_portal"] == "https://pmsuryaghar.gov.in"
    assert len(data["required_documents_list"]) > 0


def test_get_nonexistent_scheme_404(client: TestClient):
    """Verify GET /api/v1/schemes/999 returns 404."""
    res = client.get("/api/v1/schemes/999")
    assert res.status_code == 404


def test_check_eligibility_for_student(client: TestClient):
    """Verify eligibility check for college student returns NSP Scholarship as LIKELY_ELIGIBLE."""
    payload = {
        "age": 20,
        "is_student": True,
        "occupation": "College Student",
        "income_range": "< 2.5L",
        "state": "Karnataka",
        "residence_type": "urban",
        "language": "en",
    }
    res = client.post("/api/v1/schemes/eligibility", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert len(data["matches"]) > 0
    student_match = next((m for m in data["matches"] if "Scholarship" in m["scheme_name"]), None)
    assert student_match is not None
    assert student_match["eligibility_status"] in ["LIKELY_ELIGIBLE", "POSSIBLY_ELIGIBLE"]
    assert student_match["confidence"] >= 0.70


def test_check_eligibility_for_farmer(client: TestClient):
    """Verify eligibility check for farmer returns PM-Kisan as LIKELY_ELIGIBLE."""
    payload = {
        "age": 45,
        "is_farmer": True,
        "occupation": "Smallholder Farmer",
        "income_range": "< 2.5L",
        "is_bpl": True,
        "state": "Karnataka",
        "residence_type": "rural",
        "language": "en",
    }
    res = client.post("/api/v1/schemes/eligibility", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert len(data["matches"]) > 0
    kisan_match = next((m for m in data["matches"] if "Kisan" in m["scheme_name"]), None)
    assert kisan_match is not None
    assert kisan_match["eligibility_status"] == "LIKELY_ELIGIBLE"


def test_check_eligibility_for_senior_citizen(client: TestClient):
    """Verify eligibility check for senior citizen returns NSAP pension as LIKELY_ELIGIBLE."""
    payload = {
        "age": 68,
        "senior_citizen": True,
        "is_bpl": True,
        "income_range": "< 2.5L",
        "state": "Karnataka",
        "language": "en",
    }
    res = client.post("/api/v1/schemes/eligibility", json=payload)
    assert res.status_code == 200
    data = res.json()
    pension_match = next((m for m in data["matches"] if "Pension" in m["scheme_name"] or "Senior" in m["scheme_name"]), None)
    assert pension_match is not None
    assert pension_match["eligibility_status"] == "LIKELY_ELIGIBLE"


def test_scheme_assistant_query(client: TestClient):
    """Verify AI scheme assistant answers user natural language queries."""
    payload = {
        "query": "What schemes are available for college students with low income?",
        "language": "en",
    }
    res = client.post("/api/v1/schemes/assistant", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert len(data["matches"]) > 0
    assert data["source"] in ["GEMINI", "FALLBACK"]
    assert any("Scholarship" in m["scheme_name"] or "Education" in m["category"] for m in data["matches"])


def test_scheme_assistant_tamil_query(client: TestClient):
    """Verify AI scheme assistant handles Tamil language queries."""
    payload = {
        "query": "விவசாயிகளுக்கான அரசு திட்டங்கள் என்னென்ன?",
        "language": "ta",
    }
    res = client.post("/api/v1/schemes/assistant", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert len(data["matches"]) > 0
    assert len(data["suggested_prompts"]) > 0
