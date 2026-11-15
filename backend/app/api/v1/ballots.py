from fastapi import APIRouter, HTTPException, status
from typing import List, Dict, Any
from app.schemas.ballot import BallotSubmission, BallotReceipt
from app.services.voting_service import voting_service
from app.services.election_service import election_service

router = APIRouter(prefix="/ballots", tags=["Ballots & Ledger"])


@router.post("/submit", response_model=BallotReceipt, status_code=status.HTTP_201_CREATED)
def cast_ballot(submission: BallotSubmission):
    """
    Casts an encrypted ballot:
    1. Validates credential binding proof
    2. Enforces nullifier uniqueness (double-voting prevention)
    3. Verifies zero-knowledge 1-of-K selection proof
    4. Collects 2-of-3 consortium endorsements
    5. Appends to Merkle tree and issues cryptographic receipt
    """
    try:
        receipt = voting_service.submit_ballot(submission)
        return receipt
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal ledger error: {str(e)}")


@router.get("/{election_id}/bulletin")
def get_public_bulletin_board(election_id: str):
    """
    Public Bulletin Board:
    Exposes list of accepted ballots, nullifiers, leaf hashes, and timestamps
    for universal verifiability without revealing voter identities or plaintext choices.
    """
    election = election_service.get_election(election_id)
    if not election:
        raise HTTPException(status_code=404, detail="Election not found")

    bulletin = [
        {
            "tx_id": b["tx_id"],
            "block_number": b["block_number"],
            "nullifier": b["nullifier"],
            "leaf_hash": b["leaf_hash"],
            "timestamp": b["timestamp"],
            "ciphertext_count": len(b["encrypted_vector"])
        }
        for b in election.accepted_ballots
    ]

    return {
        "election_id": election_id,
        "total_ballots": len(bulletin),
        "merkle_root": election.merkle_root,
        "bulletin_entries": bulletin
    }

