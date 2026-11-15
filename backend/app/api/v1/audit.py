from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict
from app.schemas.audit import ElectionAuditReport
from app.services.audit_service import audit_service
from app.crypto.merkle import MerkleTree
from app.services.election_service import election_service

router = APIRouter(prefix="/audit", tags=["3-Authority Independent Audit"])


class VerifyReceiptRequest(BaseModel):
    election_id: str
    leaf_hash: str
    inclusion_proof: List[Dict[str, str]]


@router.get("/{election_id}", response_model=ElectionAuditReport)
def run_consortium_audit(election_id: str):
    """
    Triggers the 3 independent authorities (Org 1, Org 2, Org 3) to execute all 6 verification checks
    over the immutable blockchain records and Merkle evidence.
    """
    try:
        report = audit_service.run_full_consortium_audit(election_id)
        return report
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audit execution failure: {str(e)}")


@router.post("/verify-receipt")
def verify_voter_inclusion_receipt(req: VerifyReceiptRequest):
    """
    Universal / Individual Verifiability:
    Verifies that a voter's receipt (leaf hash + Merkle path) is mathematically included
    in the final election Merkle Root.
    """
    election = election_service.get_election(req.election_id)
    if not election:
        raise HTTPException(status_code=404, detail="Election not found")

    is_valid = MerkleTree.verify_inclusion_proof(
        leaf_hash=req.leaf_hash,
        proof=req.inclusion_proof,
        expected_root=election.merkle_root
    )

    return {
        "election_id": req.election_id,
        "leaf_hash": req.leaf_hash,
        "expected_merkle_root": election.merkle_root,
        "mathematically_included": is_valid,
        "verification_status": "CONFIRMED_IN_LEDGER" if is_valid else "FAILED_NOT_FOUND"
    }

