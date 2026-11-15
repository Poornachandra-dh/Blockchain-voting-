from fastapi import APIRouter, HTTPException, status
from typing import List
from app.schemas.election import ElectionCreate, ElectionOut, ElectionStatus
from app.crypto.paillier import PaillierCrypto
from app.services.election_service import election_service

router = APIRouter(prefix="/elections", tags=["Elections"])


@router.get("", response_model=List[ElectionOut])
def get_all_elections():
    """List all registered elections in the consortium."""
    return election_service.list_elections()


@router.post("", response_model=ElectionOut, status_code=status.HTTP_201_CREATED)
def create_election(data: ElectionCreate):
    """Setup a new election and initialize the Paillier master keypair."""
    return election_service.create_election(data)


@router.get("/{election_id}", response_model=ElectionOut)
def get_election(election_id: str):
    """Retrieve detailed state of a specific election."""
    record = election_service.get_election(election_id)
    if not record:
        raise HTTPException(status_code=404, detail="Election not found")
    return record.to_out_schema()


@router.patch("/{election_id}/status", response_model=ElectionOut)
def update_election_status(election_id: str, new_status: ElectionStatus):
    """Advance the election lifecycle (SETUP -> REGISTRATION -> VOTING -> CLOSED -> TALLIED -> VERIFIED)."""
    try:
        return election_service.update_status(election_id, new_status)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{election_id}/reset", response_model=ElectionOut)
def reset_election_cycle(election_id: str):
    """Resets the demo election cycle back to VOTING and clears state for repeated testing."""
    try:
        return election_service.reset_election(election_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{election_id}/encrypt-vector")
def encrypt_ballot_vector(election_id: str, candidate_index: int):
    """
    Client-side encryption assistance: generates a 1-of-K selection vector 
    and encrypts each element with the election's official Paillier public key.
    """
    rec = election_service.get_election(election_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Election not found")
    
    total_candidates = len(rec.candidates)
    if candidate_index < 0 or candidate_index >= total_candidates:
        raise HTTPException(status_code=400, detail="Invalid candidate index")
        
    vector = [0] * total_candidates
    vector[candidate_index] = 1
    
    encrypted_vector = PaillierCrypto.encrypt_vector(rec.public_key, vector)
    return {
        "candidate_index": candidate_index,
        "vector": vector,
        "encrypted_vector": encrypted_vector
    }

