from datetime import datetime, timezone, timedelta
from unittest.mock import patch, MagicMock
import pytest
import httpx
from fastapi.testclient import TestClient

from app.core.config import settings
from app.services.n8n_service import (
    build_n8n_payload,
    dispatch_grievance_event,
    classify_community_impact,
    calculate_sla_status,
)
from app.db.models.grievance import Grievance


# ---------------------------------------------------------------------------
# 1. Payload Structure, Privacy, Impact Classifications & SLA Tests
# ---------------------------------------------------------------------------

def test_build_n8n_payload_sanitization():
    """Verify that payload contains all operational fields and zero sensitive citizen data."""
    mock_grievance = MagicMock(spec=Grievance)
    mock_grievance.id = 101
    mock_grievance.tracking_id = "GRV-2026-SEC001"
    mock_grievance.title = "Contaminated water pipe near main hospital"
    mock_grievance.category = "Water & Sanitation"
    mock_grievance.department = "Water_Sanitation"
    mock_grievance.priority = "CRITICAL"
    mock_grievance.urgency_score = 0.95
    mock_grievance.status = "TRIAGED"
    mock_grievance.location = "Hospital Road"
    mock_grievance.landmark = "Near Civil Hospital Gate 2"
    mock_grievance.ai_summary = "Water pipe breach creating contamination risk."
    mock_grievance.suggested_initial_action = "Dispatch water quality test team."
    mock_grievance.created_at = datetime.now(timezone.utc)
    mock_grievance.updated_at = datetime.now(timezone.utc)
    mock_grievance.confirmations = []
    mock_grievance.updates = []

    payload = build_n8n_payload(mock_grievance, event_type="GRIEVANCE_CRITICAL", community_count=3)
    payload_dict = payload.model_dump()

    # Verify required operational fields
    assert payload_dict["event"] == "GRIEVANCE_CRITICAL"
    assert payload_dict["event_id"].startswith("EVT_GRIEVANCE_CRITICAL_101_")
    assert payload_dict["grievance_id"] == 101
    assert payload_dict["tracking_id"] == "GRV-2026-SEC001"
    assert payload_dict["priority"] == "CRITICAL"
    assert payload_dict["is_critical"] is True
    assert payload_dict["is_high_priority"] is True
    assert payload_dict["community_count"] == 3
    assert payload_dict["impact_classification"] == "COMMUNITY_CONFIRMED"
    assert payload_dict["urgency_score"] == 0.95

    # Verify strict omission of sensitive credentials
    forbidden_keys = ["password", "password_hash", "token", "access_token", "jwt", "aadhaar", "secret"]
    for key in forbidden_keys:
        assert key not in payload_dict
        assert key not in str(payload_dict).lower()


def test_community_impact_classification_thresholds():
    """Verify community impact threshold categorization."""
    assert classify_community_impact(0) == "NO_CONFIRMATION"
    assert classify_community_impact(1) == "COMMUNITY_CONFIRMED"
    assert classify_community_impact(4) == "COMMUNITY_CONFIRMED"
    assert classify_community_impact(5) == "HIGH_COMMUNITY_IMPACT"
    assert classify_community_impact(9) == "HIGH_COMMUNITY_IMPACT"
    assert classify_community_impact(10) == "WIDESPREAD_IMPACT"
    assert classify_community_impact(24) == "WIDESPREAD_IMPACT"
    assert classify_community_impact(25) == "MASS_IMPACT"
    assert classify_community_impact(100) == "MASS_IMPACT"


def test_sla_status_calculation():
    """Verify SLA staleness calculation for critical, high, and standard priorities."""
    now = datetime.now(timezone.utc)
    
    # 1. Critical Priority (12h SLA)
    created_2h = now - timedelta(hours=2)
    created_9h = now - timedelta(hours=9)
    created_14h = now - timedelta(hours=14)

    age, sla = calculate_sla_status("CRITICAL", created_2h, "TRIAGED", now=now)
    assert age == 2.0 and sla == "NORMAL"

    age, sla = calculate_sla_status("CRITICAL", created_9h, "TRIAGED", now=now)
    assert age == 9.0 and sla == "APPROACHING_SLA"

    age, sla = calculate_sla_status("CRITICAL", created_14h, "IN_PROGRESS", now=now)
    assert age == 14.0 and sla == "SLA_BREACH_WARNING"

    # 2. Resolved grievance is always NORMAL SLA
    age, sla = calculate_sla_status("CRITICAL", created_14h, "RESOLVED", now=now)
    assert sla == "NORMAL"


# ---------------------------------------------------------------------------
# 2. Service Dispatch Unit Tests (Offline, Timeout, Error & Success)
# ---------------------------------------------------------------------------

def test_dispatch_when_n8n_disabled():
    """Verify dispatch returns graceful skip when N8N_ENABLED is False."""
    mock_grievance = MagicMock(spec=Grievance)
    mock_grievance.id = 1
    mock_grievance.tracking_id = "GRV-2026-DIS001"
    mock_grievance.title = "Test Grievance"
    mock_grievance.category = "Electricity"
    mock_grievance.department = "Electricity_Board"
    mock_grievance.priority = "MEDIUM"
    mock_grievance.urgency_score = 0.5
    mock_grievance.status = "TRIAGED"
    mock_grievance.location = "Main St"
    mock_grievance.landmark = None
    mock_grievance.ai_summary = "Test summary"
    mock_grievance.suggested_initial_action = "Test action"
    mock_grievance.created_at = datetime.now(timezone.utc)
    mock_grievance.updated_at = datetime.now(timezone.utc)
    mock_grievance.confirmations = []
    mock_grievance.updates = []

    with patch.object(settings, "N8N_ENABLED", False):
        result = dispatch_grievance_event(mock_grievance, event_type="GRIEVANCE_CREATED")
        assert result.success is False
        assert "disabled" in result.message.lower()


def test_dispatch_when_n8n_url_missing():
    """Verify dispatch returns graceful skip when N8N_WEBHOOK_URL is None."""
    mock_grievance = MagicMock(spec=Grievance)
    mock_grievance.id = 1
    mock_grievance.tracking_id = "GRV-2026-DIS002"
    mock_grievance.title = "Test Grievance"
    mock_grievance.category = "Electricity"
    mock_grievance.department = "Electricity_Board"
    mock_grievance.priority = "MEDIUM"
    mock_grievance.urgency_score = 0.5
    mock_grievance.status = "TRIAGED"
    mock_grievance.location = "Main St"
    mock_grievance.landmark = None
    mock_grievance.ai_summary = "Test summary"
    mock_grievance.suggested_initial_action = "Test action"
    mock_grievance.created_at = datetime.now(timezone.utc)
    mock_grievance.updated_at = datetime.now(timezone.utc)
    mock_grievance.confirmations = []
    mock_grievance.updates = []

    with patch.object(settings, "N8N_ENABLED", True), patch.object(settings, "N8N_WEBHOOK_URL", None):
        result = dispatch_grievance_event(mock_grievance, event_type="GRIEVANCE_CREATED")
        assert result.success is False
        assert "not configured" in result.message.lower()


def test_dispatch_success_with_secret_and_idempotency_headers():
    """Verify successful dispatch with headers including shared secret and event ID."""
    mock_grievance = MagicMock(spec=Grievance)
    mock_grievance.id = 50
    mock_grievance.tracking_id = "GRV-2026-SUCC01"
    mock_grievance.title = "Streetlight failure"
    mock_grievance.category = "Electricity"
    mock_grievance.department = "Electricity_Board"
    mock_grievance.priority = "HIGH"
    mock_grievance.urgency_score = 0.75
    mock_grievance.status = "TRIAGED"
    mock_grievance.location = "5th Cross"
    mock_grievance.landmark = None
    mock_grievance.ai_summary = "Power outage"
    mock_grievance.suggested_initial_action = "Inspect fuse box"
    mock_grievance.created_at = datetime.now(timezone.utc)
    mock_grievance.updated_at = datetime.now(timezone.utc)
    mock_grievance.confirmations = []
    mock_grievance.updates = []

    mock_resp = MagicMock()
    mock_resp.is_success = True
    mock_resp.status_code = 200

    with patch.object(settings, "N8N_ENABLED", True), \
         patch.object(settings, "N8N_WEBHOOK_URL", "http://localhost:5678/webhook/test"), \
         patch.object(settings, "N8N_WEBHOOK_SECRET", "test-secret-key-123"), \
         patch("httpx.Client.post", return_value=mock_resp) as mock_post:
        
        result = dispatch_grievance_event(mock_grievance, event_type="GRIEVANCE_HIGH_PRIORITY")
        assert result.success is True
        assert result.status_code == 200

        # Verify call arguments
        mock_post.assert_called_once()
        args, kwargs = mock_post.call_args
        assert kwargs["headers"]["X-CivicOS-Secret"] == "test-secret-key-123"
        assert kwargs["headers"]["X-CivicOS-Event"] == "GRIEVANCE_HIGH_PRIORITY"
        assert "X-CivicOS-Event-ID" in kwargs["headers"]
        assert kwargs["json"]["priority"] == "HIGH"
        assert kwargs["json"]["impact_classification"] == "NO_CONFIRMATION"


def test_dispatch_timeout_resilience():
    """Verify webhook timeout fails gracefully without raising an exception."""
    mock_grievance = MagicMock(spec=Grievance)
    mock_grievance.id = 60
    mock_grievance.tracking_id = "GRV-2026-TO001"
    mock_grievance.title = "Low water pressure"
    mock_grievance.category = "Water & Sanitation"
    mock_grievance.department = "Water_Sanitation"
    mock_grievance.priority = "LOW"
    mock_grievance.urgency_score = 0.3
    mock_grievance.status = "TRIAGED"
    mock_grievance.location = "Park Road"
    mock_grievance.landmark = None
    mock_grievance.ai_summary = "Low pressure issue"
    mock_grievance.suggested_initial_action = "Inspect valves"
    mock_grievance.created_at = datetime.now(timezone.utc)
    mock_grievance.updated_at = datetime.now(timezone.utc)
    mock_grievance.confirmations = []
    mock_grievance.updates = []

    with patch.object(settings, "N8N_ENABLED", True), \
         patch.object(settings, "N8N_WEBHOOK_URL", "http://localhost:5678/webhook/test"), \
         patch("httpx.Client.post", side_effect=httpx.TimeoutException("Connection timed out")):
        
        result = dispatch_grievance_event(mock_grievance, event_type="GRIEVANCE_CREATED")
        assert result.success is False
        assert "timed out" in result.message.lower()


def test_dispatch_connect_error_resilience():
    """Verify connection refused fails gracefully without raising an exception."""
    mock_grievance = MagicMock(spec=Grievance)
    mock_grievance.id = 70
    mock_grievance.tracking_id = "GRV-2026-CONN001"
    mock_grievance.title = "Garbage dump"
    mock_grievance.category = "Waste Management"
    mock_grievance.department = "Waste_Management"
    mock_grievance.priority = "LOW"
    mock_grievance.urgency_score = 0.25
    mock_grievance.status = "TRIAGED"
    mock_grievance.location = "Market Road"
    mock_grievance.landmark = None
    mock_grievance.ai_summary = "Garbage accumulation"
    mock_grievance.suggested_initial_action = "Clear bins"
    mock_grievance.created_at = datetime.now(timezone.utc)
    mock_grievance.updated_at = datetime.now(timezone.utc)
    mock_grievance.confirmations = []
    mock_grievance.updates = []

    with patch.object(settings, "N8N_ENABLED", True), \
         patch.object(settings, "N8N_WEBHOOK_URL", "http://localhost:5678/webhook/test"), \
         patch("httpx.Client.post", side_effect=httpx.ConnectError("Connection refused")):
        
        result = dispatch_grievance_event(mock_grievance, event_type="GRIEVANCE_CREATED")
        assert result.success is False
        assert "unreachable" in result.message.lower()


# ---------------------------------------------------------------------------
# 3. End-to-End API Integration Tests (Creation, Officer Status, Confirmations)
# ---------------------------------------------------------------------------

def test_api_submit_grievance_triggers_n8n(client: TestClient, citizen_auth_headers: dict):
    """Verify citizen grievance creation triggers n8n dispatch while returning HTTP 201."""
    with patch.object(settings, "N8N_ENABLED", True), \
         patch.object(settings, "N8N_WEBHOOK_URL", "http://localhost:5678/webhook/test"), \
         patch("app.api.v1.grievances.dispatch_grievance_event") as mock_dispatch:
        
        mock_dispatch.return_value = MagicMock(success=True)

        payload = {
            "title": "Severe flooding and overflowing manhole on MG Road",
            "description": "Foul-smelling drain water flooding entire commercial block. Immediate suction pump needed.",
            "location": "MG Road, Near Metro Station",
            "landmark": "Metro Pillar 45",
            "category": "Water & Sanitation",
            "priority": "HIGH",
        }
        res = client.post(
            "/api/v1/grievances",
            json=payload,
            headers=citizen_auth_headers,
        )
        assert res.status_code == 201
        data = res.json()
        assert data["tracking_id"].startswith("GRV-2026-")

        # Verify n8n dispatch was called
        mock_dispatch.assert_called_once()
        call_args, call_kwargs = mock_dispatch.call_args
        target_grievance = call_args[0] if call_args else call_kwargs.get("grievance")
        assert target_grievance.id == data["id"]


def test_api_officer_status_update_triggers_n8n(client: TestClient, officer_auth_headers: dict, citizen_auth_headers: dict):
    """Verify officer status update triggers GRIEVANCE_STATUS_CHANGED / GRIEVANCE_RESOLVED."""
    # 1. Create a test grievance
    res_create = client.post(
        "/api/v1/grievances",
        json={
            "title": "Broken road asphalt near school",
            "description": "Large deep potholes creating hazard for school buses.",
            "category": "Public Works (Roads)",
            "priority": "MEDIUM",
        },
        headers=citizen_auth_headers,
    )
    assert res_create.status_code == 201
    g_id = res_create.json()["id"]

    # 2. Officer sets to IN_PROGRESS
    with patch.object(settings, "N8N_ENABLED", True), \
         patch.object(settings, "N8N_WEBHOOK_URL", "http://localhost:5678/webhook/test"), \
         patch("app.api.v1.officer.dispatch_grievance_event") as mock_dispatch:
        
        res_patch = client.patch(
            f"/api/v1/officer/grievances/{g_id}/status",
            json={"status": "IN_PROGRESS", "remarks": "Road repair team dispatched."},
            headers=officer_auth_headers,
        )
        assert res_patch.status_code == 200
        mock_dispatch.assert_called_once()
        _, call_kwargs = mock_dispatch.call_args
        assert call_kwargs["event_type"] == "GRIEVANCE_STATUS_CHANGED"

    # 3. Officer resolves grievance
    with patch.object(settings, "N8N_ENABLED", True), \
         patch.object(settings, "N8N_WEBHOOK_URL", "http://localhost:5678/webhook/test"), \
         patch("app.api.v1.officer.dispatch_grievance_event") as mock_dispatch:
        
        res_resolve = client.patch(
            f"/api/v1/officer/grievances/{g_id}/status",
            json={"status": "RESOLVED", "remarks": "Asphalt patch completed."},
            headers=officer_auth_headers,
        )
        assert res_resolve.status_code == 200
        mock_dispatch.assert_called_once()
        _, call_kwargs = mock_dispatch.call_args
        assert call_kwargs["event_type"] == "GRIEVANCE_RESOLVED"


def test_api_community_confirmation_triggers_n8n(client: TestClient, citizen_auth_headers: dict):
    """Verify community confirmation triggers COMMUNITY_IMPACT_CHANGED."""
    # 1. Create a test grievance
    res_create = client.post(
        "/api/v1/grievances",
        json={
            "title": "Low water pressure in 2nd phase",
            "description": "Entire apartment block has zero water pressure since morning.",
            "category": "Water & Sanitation",
        },
        headers=citizen_auth_headers,
    )
    assert res_create.status_code == 201
    g_id = res_create.json()["id"]

    # 2. Confirm problem
    with patch.object(settings, "N8N_ENABLED", True), \
         patch.object(settings, "N8N_WEBHOOK_URL", "http://localhost:5678/webhook/test"), \
         patch("app.api.v1.feed.dispatch_grievance_event") as mock_dispatch:
        
        res_conf = client.post(
            f"/api/v1/feed/{g_id}/confirm",
            headers=citizen_auth_headers,
        )
        assert res_conf.status_code == 200
        mock_dispatch.assert_called_once()
        _, call_kwargs = mock_dispatch.call_args
        assert call_kwargs["event_type"] == "COMMUNITY_IMPACT_CHANGED"
        assert call_kwargs["community_count"] == 1
