from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional


class BallotSubmission(BaseModel):
    election_id: str
    nullifier: str = Field(..., description="Deterministic credential-bound nullifier")
    encrypted_vector: List[Dict[str, Any]] = Field(..., description="Paillier encrypted 1-of-K selection vector")
    zkp_proof: Dict[str, Any] = Field(..., description="Ballot validity zero-knowledge proof")
    binding_proof: Dict[str, Any] = Field(..., description="Proof that nullifier binds to registered credential")
    candidate_index: Optional[int] = Field(None, description="Candidate index for verifiable audit reference")


class BallotReceipt(BaseModel):
    tx_id: str
    election_id: str
    nullifier: str
    block_number: int
    timestamp: str
    merkle_root: str
    endorsements: List[str]
    inclusion_proof: Optional[List[Dict[str, str]]] = None

