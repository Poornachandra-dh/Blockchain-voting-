from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum


class ElectionStatus(str, Enum):
    SETUP = "SETUP"
    REGISTRATION = "REGISTRATION"
    VOTING = "VOTING"
    CLOSED = "CLOSED"
    TALLIED = "TALLIED"
    VERIFIED = "VERIFIED"


class Candidate(BaseModel):
    id: int
    name: str
    party: Optional[str] = "Independent"
    avatar: Optional[str] = None


class ElectionCreate(BaseModel):
    title: str = Field(..., json_schema_extra={"example": "National General Election 2026"})
    description: str = Field(..., json_schema_extra={"example": "Privacy-Preserving Consortium Remote Ballot"})
    candidates: List[Candidate]


class ElectionOut(BaseModel):
    id: str
    title: str
    description: str
    candidates: List[Candidate]
    status: ElectionStatus
    public_key: Dict[str, Any]
    accepted_ballot_count: int
    merkle_root: str
    created_at: str
