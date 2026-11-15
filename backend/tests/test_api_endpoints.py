from fastapi.testclient import TestClient
from main import app
from app.crypto.nullifier import NullifierEngine
from app.crypto.paillier import PaillierCrypto
from app.crypto.zkp import ZKPBallotVerifier

client = TestClient(app)


def test_health_check_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "OPERATIONAL"
    assert len(data["consortium_orgs"]) == 3


def test_elections_endpoints():
    response = client.get("/api/v1/elections")
    assert response.status_code == 200
    elections = response.json()
    assert len(elections) >= 1
    assert elections[0]["id"] == "election-pesce-2026"


def test_voter_auth_and_credential_issuance():
    # Login as synthetic voter
    login_resp = client.post("/api/v1/voters/login", json={
        "voter_id": "VOTER-002",
        "password": "password123"
    })
    assert login_resp.status_code == 200
    assert "access_token" in login_resp.json()

    # Generate commitment
    secret, salt = NullifierEngine.generate_voter_keypair()
    c_id = NullifierEngine.create_identity_commitment(secret, salt)

    # Request anonymous credential
    cred_resp = client.post("/api/v1/voters/credential", json={
        "voter_id": "VOTER-002",
        "election_id": "election-pesce-2026",
        "identity_commitment": c_id
    })
    assert cred_resp.status_code == 200
    assert cred_resp.json()["status"] == "VALID"


def test_chaos_simulation_endpoint():
    chaos_resp = client.post("/api/v1/chaos/simulate", json={
        "election_id": "election-pesce-2026",
        "attack_type": "DOUBLE_VOTE_REPLAY"
    })
    assert chaos_resp.status_code == 200
    data = chaos_resp.json()
    assert data["attack_prevented"] is True
    assert data["resilience_rating"] == "100% SECURE"


def test_telemetry_endpoint():
    resp = client.get("/api/v1/telemetry/election-pesce-2026")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["consortium_nodes"]) == 3
    assert data["ai_threat_intelligence"]["risk_level"] in ("LOW", "NORMAL", "MEDIUM")

