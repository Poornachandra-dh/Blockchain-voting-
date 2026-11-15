from fastapi import APIRouter
from typing import Dict, Any
from app.services.anomaly_detector import anomaly_detector
from app.services.election_service import election_service

router = APIRouter(prefix="/telemetry", tags=["Telemetry & AI Anomaly Detection"])


@router.get("/{election_id}")
def get_election_telemetry(election_id: str) -> Dict[str, Any]:
    election = election_service.get_election(election_id)
    if not election:
        return {"error": "Election not found"}

    timestamps = [b["timestamp"] for b in election.accepted_ballots]
    anomaly_report = anomaly_detector.analyze_ballot_flow(timestamps)

    return {
        "election_id": election_id,
        "status": election.status,
        "current_block_height": len(election.accepted_ballots),
        "total_nullifiers_registered": len(election.nullifiers_set),
        "merkle_root": election.merkle_root,
        "consortium_nodes": [
            {"org": "EC_ORG1", "role": "Orderer / Peer", "status": "ONLINE", "latency_ms": 14},
            {"org": "OBSERVER_ORG2", "role": "Endorsing Peer", "status": "ONLINE", "latency_ms": 22},
            {"org": "CIVIL_SOCIETY_ORG3", "role": "Auditing Peer", "status": "ONLINE", "latency_ms": 19}
        ],
        "ai_threat_intelligence": anomaly_report
    }

