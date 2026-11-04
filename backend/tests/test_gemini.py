import json
import pytest
import httpx
from unittest.mock import patch, MagicMock
from pydantic import ValidationError
from fastapi.testclient import TestClient

from app.core.config import settings
from app.schemas.ai import (
    AllowedCategory,
    AllowedDepartment,
    AllowedPriority,
    GrievanceTriageResult,
    AITriageRequest,
    AITriageResponse,
)
from app.services.gemini_service import (
    classify_grievance_fallback,
    triage_grievance,
)


# =====================================================================
# 1. Pydantic Schema Validation Tests
# =====================================================================

def test_triage_result_valid_schema():
    """Verify valid GrievanceTriageResult creation and field access."""
    result = GrievanceTriageResult(
        category="Water & Sanitation",
        assigned_department="Water_Sanitation",
        priority="HIGH",
        urgency_score=0.85,
        summary="Water main burst on 5th main road.",
        suggested_initial_action="Dispatch emergency repair team to isolate main line.",
        key_entities=["5th Main Road", "water main"],
    )
    assert result.category == "Water & Sanitation"
    assert result.assigned_department == "Water_Sanitation"
    assert result.priority == "HIGH"
    assert result.urgency_score == 0.85
    assert len(result.key_entities) == 2


def test_triage_result_invalid_category_rejected():
    """Verify that completely unrecognised category raises ValidationError."""
    with pytest.raises(ValidationError):
        GrievanceTriageResult(
            category="Unrecognized Nonexistent Category 123",
            assigned_department="Water_Sanitation",
            priority="HIGH",
            urgency_score=0.5,
            summary="Test summary",
            suggested_initial_action="Test action",
            key_entities=[],
        )


def test_triage_result_invalid_department_rejected():
    """Verify that invalid department string raises ValidationError."""
    with pytest.raises(ValidationError):
        GrievanceTriageResult(
            category="Roads & Infrastructure",
            assigned_department="Finance_Dept",
            priority="LOW",
            urgency_score=0.3,
            summary="Test summary",
            suggested_initial_action="Test action",
            key_entities=[],
        )


def test_triage_result_invalid_priority_rejected():
    """Verify that invalid priority level raises ValidationError."""
    with pytest.raises(ValidationError):
        GrievanceTriageResult(
            category="Electricity & Energy",
            assigned_department="Electricity_Board",
            priority="SUPER_URGENT_NOT_ALLOWED",
            urgency_score=0.9,
            summary="Test summary",
            suggested_initial_action="Test action",
            key_entities=[],
        )


def test_triage_result_urgency_score_clamping():
    """Verify urgency score clamping between 0.0 and 1.0."""
    result = GrievanceTriageResult(
        category="Public Health",
        assigned_department="Health_Dept",
        priority="MEDIUM",
        urgency_score=0.724,
        summary="Test summary",
        suggested_initial_action="Test action",
        key_entities=[],
    )
    assert result.urgency_score == 0.72


# =====================================================================
# 2. Deterministic Fallback Classifier Tests
# =====================================================================

def test_fallback_waste_management():
    """Verify fallback categorizes waste/garbage correctly."""
    result = classify_grievance_fallback(
        title="Uncollected garbage pile",
        description="Foul smell and overflowing trash bin on our residential corner for 3 days.",
        location="Indiranagar",
    )
    assert result.category == "Waste Management"
    assert result.assigned_department == "Municipal_Corp"
    assert result.priority in ["HIGH", "CRITICAL", "MEDIUM"]
    assert "Indiranagar" in result.key_entities


def test_fallback_water_sanitation():
    """Verify fallback categorizes water leakage/drainage correctly."""
    result = classify_grievance_fallback(
        title="Severe sewage overflow",
        description="Drainage pipe is leaking contaminated sewage onto street.",
        location="Koramangala",
    )
    assert result.category == "Water & Sanitation"
    assert result.assigned_department == "Water_Sanitation"
    assert result.priority in ["HIGH", "CRITICAL"]


def test_fallback_roads_infrastructure():
    """Verify fallback categorizes potholes/roads correctly."""
    result = classify_grievance_fallback(
        title="Deep pothole on main road",
        description="Vehicle traffic damaged asphalt and pothole is causing difficulty.",
        location="MG Road",
    )
    assert result.category == "Roads & Infrastructure"
    assert result.assigned_department == "Public_Works"


def test_fallback_electricity_energy():
    """Verify fallback categorizes electricity/transformer issues correctly."""
    result = classify_grievance_fallback(
        title="Transformer failure and blackout",
        description="Exposed electrical wires and power outage across entire street.",
        location="HSR Layout",
    )
    assert result.category == "Electricity & Energy"
    assert result.assigned_department == "Electricity_Board"
    assert result.priority in ["HIGH", "CRITICAL"]


def test_fallback_public_health():
    """Verify fallback categorizes public health/mosquito issues correctly."""
    result = classify_grievance_fallback(
        title="Dengue fever outbreak risk",
        description="Mosquito larvae breeding in stagnant water near health clinic.",
        location="Jayanagar",
    )
    assert result.category == "Public Health"
    assert result.assigned_department == "Health_Dept"


# =====================================================================
# 3. Gemini Service Unit & Integration Tests (Mocked API)
# =====================================================================

def test_gemini_service_valid_ai_response():
    """Requirement 1: Valid Gemini response -> source == 'GEMINI'."""
    mock_gemini_json = {
        "candidates": [
            {
                "content": {
                    "parts": [
                        {
                            "text": json.dumps({
                                "category": "Water & Sanitation",
                                "assigned_department": "Water_Sanitation",
                                "priority": "HIGH",
                                "urgency_score": 0.88,
                                "summary": "Main water pipeline burst flooding residential area.",
                                "suggested_initial_action": "Dispatch emergency water board valve engineers.",
                                "key_entities": ["Indiranagar", "water pipe"]
                            })
                        }
                    ]
                }
            }
        ]
    }

    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = mock_gemini_json

    with patch.object(settings, "GEMINI_API_KEY", "fake-test-key"):
        with patch("app.services.gemini_service.httpx.Client.post", return_value=mock_resp):
            result, source = triage_grievance(
                title="Water pipe burst",
                description="A main water pipe has burst and water is flooding the road near school.",
                location="Indiranagar",
            )
            assert source == "GEMINI"
            assert result.category == "Water & Sanitation"
            assert result.assigned_department == "Water_Sanitation"
            assert result.priority == "HIGH"
            assert result.urgency_score == 0.88
            assert "water pipe" in result.key_entities


def test_gemini_service_timeout_uses_fallback():
    """Requirement 2: Gemini timeout -> source == 'FALLBACK'."""
    with patch.object(settings, "GEMINI_API_KEY", "fake-test-key"):
        with patch("app.services.gemini_service.httpx.Client.post", side_effect=httpx.TimeoutException("Read timed out")):
            result, source = triage_grievance(
                title="Water pipe burst",
                description="A main water pipe has burst and water is flooding the road near school.",
                location="Indiranagar",
            )
            assert source == "FALLBACK"
            assert result.category == "Water & Sanitation"
            assert result.assigned_department == "Water_Sanitation"


def test_gemini_service_http_api_error_uses_fallback():
    """Requirement 3: Gemini HTTP/API error (500, 403, 400) -> source == 'FALLBACK'."""
    mock_resp = MagicMock()
    mock_resp.status_code = 500
    mock_resp.text = "Internal Server Error"

    with patch.object(settings, "GEMINI_API_KEY", "fake-test-key"):
        with patch("app.services.gemini_service.httpx.Client.post", return_value=mock_resp):
            result, source = triage_grievance(
                title="Garbage accumulation",
                description="Trash has not been cleared for days.",
            )
            assert source == "FALLBACK"
            assert result.category == "Waste Management"
            assert result.assigned_department == "Municipal_Corp"


def test_gemini_service_malformed_json_uses_fallback():
    """Requirement 4: Malformed Gemini response (corrupt JSON) -> source == 'FALLBACK'."""
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {
        "candidates": [
            {
                "content": {
                    "parts": [
                        {"text": "This is raw unstructured text with no JSON."}
                    ]
                }
            }
        ]
    }

    with patch.object(settings, "GEMINI_API_KEY", "fake-test-key"):
        with patch("app.services.gemini_service.httpx.Client.post", return_value=mock_resp):
            result, source = triage_grievance(
                title="Pothole problem",
                description="Large pothole on the main street.",
            )
            assert source == "FALLBACK"
            assert result.category == "Roads & Infrastructure"
            assert result.assigned_department == "Public_Works"


def test_gemini_service_empty_candidates_uses_fallback():
    """Requirement 4b: Malformed response with empty candidates -> source == 'FALLBACK'."""
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {"candidates": []}

    with patch.object(settings, "GEMINI_API_KEY", "fake-test-key"):
        with patch("app.services.gemini_service.httpx.Client.post", return_value=mock_resp):
            result, source = triage_grievance(
                title="Pothole problem",
                description="Large pothole on the main street.",
            )
            assert source == "FALLBACK"
            assert result.category == "Roads & Infrastructure"


def test_gemini_service_missing_or_empty_api_key_uses_fallback():
    """Requirement 5: Missing or empty API key -> source == 'FALLBACK'."""
    # Test None
    with patch.object(settings, "GEMINI_API_KEY", None):
        result, source = triage_grievance(
            title="Broken drainage pipe",
            description="Sewage water spilling on road.",
        )
        assert source == "FALLBACK"
        assert result.category == "Water & Sanitation"

    # Test Empty string
    with patch.object(settings, "GEMINI_API_KEY", ""):
        result, source = triage_grievance(
            title="Broken drainage pipe",
            description="Sewage water spilling on road.",
        )
        assert source == "FALLBACK"

    # Test Whitespace
    with patch.object(settings, "GEMINI_API_KEY", "   "):
        result, source = triage_grievance(
            title="Broken drainage pipe",
            description="Sewage water spilling on road.",
        )
        assert source == "FALLBACK"


def test_gemini_service_invalid_ai_fields_uses_fallback():
    """Requirement 6: Invalid AI fields (unsupported enum/schema) -> source == 'FALLBACK'."""
    mock_gemini_json = {
        "candidates": [
            {
                "content": {
                    "parts": [
                        {
                            "text": json.dumps({
                                "category": "Totally Invalid Nonexistent Category",
                                "assigned_department": "Invalid_Department",
                                "priority": "NONEXISTENT_PRIORITY",
                                "urgency_score": "not_a_number",
                                "summary": "Invalid summary",
                                "suggested_initial_action": "Invalid action",
                                "key_entities": []
                            })
                        }
                    ]
                }
            }
        ]
    }

    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = mock_gemini_json

    with patch.object(settings, "GEMINI_API_KEY", "fake-test-key"):
        with patch("app.services.gemini_service.httpx.Client.post", return_value=mock_resp):
            result, source = triage_grievance(
                title="Dengue fever outbreak risk",
                description="Mosquito breeding in stagnant water near clinic.",
            )
            assert source == "FALLBACK"
            assert result.category == "Public Health"
            assert result.assigned_department == "Health_Dept"


# =====================================================================
# 4. Standalone AI Analysis Endpoint Tests
# =====================================================================

def test_ai_analyze_endpoint_gemini_source(client: TestClient, citizen_auth_headers: dict):
    """Verify POST /api/v1/ai/analyze-grievance returns source == 'GEMINI' when Gemini succeeds."""
    mock_triage = GrievanceTriageResult(
        category="Water & Sanitation",
        assigned_department="Water_Sanitation",
        priority="HIGH",
        urgency_score=0.90,
        summary="Severe water contamination in domestic pipeline.",
        suggested_initial_action="Isolate supply line and conduct bacteriological tests.",
        key_entities=["Indiranagar", "pipeline"],
    )

    payload = {
        "title": "Severe water contamination",
        "description": "Murky foul-smelling water coming from supply line.",
        "location": "Indiranagar",
    }

    with patch("app.api.v1.ai.triage_grievance", return_value=(mock_triage, "GEMINI")):
        response = client.post("/api/v1/ai/analyze-grievance", json=payload, headers=citizen_auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["source"] == "GEMINI"
        assert data["category"] == "Water & Sanitation"
        assert data["assigned_department"] == "Water_Sanitation"
        assert data["priority"] == "HIGH"
        assert data["urgency_score"] == 0.90


def test_ai_analyze_endpoint_fallback_source(client: TestClient, citizen_auth_headers: dict):
    """Verify POST /api/v1/ai/analyze-grievance returns source == 'FALLBACK' when key missing."""
    payload = {
        "title": "Broken water pipe",
        "description": "A water pipe has been leaking for two days near our street.",
        "location": "Indiranagar 12th Main",
        "landmark": "Near BDA Complex",
    }
    with patch.object(settings, "GEMINI_API_KEY", None):
        response = client.post("/api/v1/ai/analyze-grievance", json=payload, headers=citizen_auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["source"] == "FALLBACK"
        assert data["category"] == "Water & Sanitation"
        assert data["assigned_department"] == "Water_Sanitation"


def test_ai_analyze_endpoint_unauthenticated_fails(client: TestClient):
    """Verify POST /api/v1/ai/analyze-grievance requires Bearer JWT authentication."""
    payload = {
        "title": "Broken water pipe",
        "description": "A water pipe has been leaking for two days near our street.",
    }
    response = client.post("/api/v1/ai/analyze-grievance", json=payload)
    assert response.status_code == 401


def test_ai_analyze_endpoint_invalid_payload(client: TestClient, citizen_auth_headers: dict):
    """Verify short title / empty description fails validation with 422."""
    payload = {
        "title": "No",
        "description": "Hi",
    }
    response = client.post("/api/v1/ai/analyze-grievance", json=payload, headers=citizen_auth_headers)
    assert response.status_code == 422


# =====================================================================
# 5. Grievance Creation with AI Triage Integration Tests
# =====================================================================

def test_grievance_creation_stores_all_ai_fields(client: TestClient, citizen_auth_headers: dict):
    """Requirement 7: Verify grievance creation sets status TRIAGED and persists all AI triage metadata."""
    mock_triage = GrievanceTriageResult(
        category="Electricity & Energy",
        assigned_department="Electricity_Board",
        priority="CRITICAL",
        urgency_score=0.95,
        summary="Hazardous transformer sparks posing immediate electrocution risk.",
        suggested_initial_action="Emergency power cutoff and dispatch high-voltage crew.",
        key_entities=["4th Block", "transformer"],
    )

    payload = {
        "title": "Hazardous transformer sparks and power failure",
        "description": "Street transformer is throwing sparks and power is completely out on 4th block.",
        "location": "4th Block Koramangala",
        "landmark": "Opposite Petrol Pump",
    }

    with patch("app.api.v1.grievances.triage_grievance", return_value=(mock_triage, "GEMINI")):
        response = client.post("/api/v1/grievances", json=payload, headers=citizen_auth_headers)
        assert response.status_code == 201
        data = response.json()

        # Core AI triage persistence verification
        assert data["status"] == "TRIAGED"
        assert data["category"] == "Electricity & Energy"
        assert data["department"] == "Electricity_Board"
        assert data["priority"] == "CRITICAL"
        assert data["urgency_score"] == 0.95
        assert data["ai_summary"] is not None
        assert data["suggested_initial_action"] is not None
        assert data["ai_source"] == "GEMINI"

        # Audit log verification: 2 records (SUBMITTED then TRIAGED)
        assert len(data["updates"]) == 2
        assert data["updates"][0]["status"] == "SUBMITTED"
        assert data["updates"][1]["status"] == "TRIAGED"
        assert "Automated AI triage (GEMINI)" in data["updates"][1]["remarks"]


def test_officer_workflow_with_ai_triaged_grievance(
    client: TestClient,
    citizen_auth_headers: dict,
    officer_auth_headers: dict
):
    """Verify officer can filter, inspect, and update status of AI-triaged grievance."""
    # 1. Citizen creates grievance
    create_res = client.post("/api/v1/grievances", json={
        "title": "Water valve leak flooding avenue",
        "description": "Continuous water leakage flooding pedestrian footpath.",
        "location": "Indiranagar",
    }, headers=citizen_auth_headers)
    assert create_res.status_code == 201
    g_id = create_res.json()["id"]

    # 2. Officer views details
    detail_res = client.get(f"/api/v1/officer/grievances/{g_id}", headers=officer_auth_headers)
    assert detail_res.status_code == 200
    g_detail = detail_res.json()
    assert g_detail["status"] == "TRIAGED"
    assert g_detail["department"] == "Water_Sanitation"

    # 3. Officer updates status to IN_PROGRESS
    patch_res = client.patch(
        f"/api/v1/officer/grievances/{g_id}/status",
        json={"status": "IN_PROGRESS", "remarks": "Team BWSSB assigned to valve repair."},
        headers=officer_auth_headers
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "IN_PROGRESS"
    assert len(patch_res.json()["updates"]) == 3


# =====================================================================
# 6. Manual Demo Test Cases Verification
# =====================================================================

def test_demo_case_1_garbage():
    """Demo Case 1: Garbage not collected."""
    result = classify_grievance_fallback(
        title="Garbage not collected",
        description="Garbage has not been collected from our street for four days and there is a strong smell."
    )
    assert result.category == "Waste Management"
    assert result.assigned_department == "Municipal_Corp"
    assert result.priority in ["HIGH", "CRITICAL"]


def test_demo_case_2_water_pipe():
    """Demo Case 2: Water pipe burst."""
    result = classify_grievance_fallback(
        title="Water pipe burst",
        description="A main water pipe has burst and water is flooding the road near the school."
    )
    assert result.category == "Water & Sanitation"
    assert result.assigned_department == "Water_Sanitation"
    assert result.priority in ["HIGH", "CRITICAL"]


def test_demo_case_3_pothole():
    """Demo Case 3: Large pothole."""
    result = classify_grievance_fallback(
        title="Large pothole",
        description="There is a large pothole on the main road causing difficulty for vehicles."
    )
    assert result.category == "Roads & Infrastructure"
    assert result.assigned_department == "Public_Works"


def test_demo_case_4_power_failure():
    """Demo Case 4: Power failure."""
    result = classify_grievance_fallback(
        title="Power failure",
        description="The street transformer appears damaged and the entire area has no electricity."
    )
    assert result.category == "Electricity & Energy"
    assert result.assigned_department == "Electricity_Board"
    assert result.priority in ["HIGH", "CRITICAL"]
