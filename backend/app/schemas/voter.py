from pydantic import BaseModel, Field
from typing import Optional


class VoterRegister(BaseModel):
    voter_id: str = Field(..., json_schema_extra={"example": "VOTER-2026-9041"})
    full_name: str = Field(..., json_schema_extra={"example": "Poorna Chandra"})
    national_id: str = Field(..., json_schema_extra={"example": "IND-KA-571401-9988"})
    district: str = Field(..., json_schema_extra={"example": "Mandya"})
    password: str = Field(..., min_length=6)


class VoterLogin(BaseModel):
    voter_id: str
    password: str


class CredentialRequest(BaseModel):
    voter_id: str
    election_id: str
    identity_commitment: str = Field(..., description="C_id = H(Prefix || secret || salt)")


class AnonymousCredentialOut(BaseModel):
    credential_id: str
    election_id: str
    identity_commitment: str
    issuer_org: str
    authority_signature: str
    issued_at: str
    status: str = "VALID"
