from pydantic import BaseModel
from typing import List, Dict, Any, Optional


class AuthorityAuditCheck(BaseModel):
    org_id: str
    ballot_validity_passed: bool
    nullifier_uniqueness_passed: bool
    accepted_ballot_count_matched: bool
    ledger_integrity_verified: bool
    zkp_proofs_valid: bool
    tally_consistency_confirmed: bool
    signature: str
    timestamp: str


class CandidateResult(BaseModel):
    candidate_id: int
    name: str
    party: str
    votes: int
    percentage: float


class ElectionAuditReport(BaseModel):
    election_id: str
    election_title: str
    total_accepted_ballots: int
    merkle_root: str
    encrypted_aggregate_vector: List[Dict[str, Any]]
    candidate_results: List[CandidateResult]
    winner: Optional[str]
    authority_audits: List[AuthorityAuditCheck]
    universal_verifiability_status: str  # "VERIFIED", "DISPUTED", "PENDING"
    audit_notes: List[str]

