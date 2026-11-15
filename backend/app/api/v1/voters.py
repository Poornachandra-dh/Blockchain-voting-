from fastapi import APIRouter, HTTPException, status
from app.schemas.voter import VoterRegister, VoterLogin, CredentialRequest, AnonymousCredentialOut
from app.services.voter_service import voter_service
from app.core.security import create_access_token

router = APIRouter(prefix="/voters", tags=["Voters & Credentials"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_voter(data: VoterRegister):
    """NIST SP 800-63-3 compliant voter enrollment."""
    try:
        voter = voter_service.register_voter(data)
        return {
            "status": "REGISTERED",
            "voter_id": voter.voter_id,
            "district": voter.district,
            "national_id_hash": voter.national_id_hash
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login")
def login_voter(data: VoterLogin):
    """Authenticate voter and issue session JWT."""
    voter = voter_service.authenticate_voter(data.voter_id, data.password)
    if not voter:
        raise HTTPException(status_code=401, detail="Invalid voter credentials.")
    token = create_access_token(voter.voter_id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "voter_id": voter.voter_id,
        "full_name": voter.full_name,
        "district": voter.district
    }


@router.post("/credential", response_model=AnonymousCredentialOut)
def request_anonymous_credential(data: CredentialRequest):
    """
    Issue an election-specific anonymous credential.
    Authority verifies eligibility and signs C_id without learning voter's secret.
    """
    try:
        return voter_service.issue_anonymous_credential(
            voter_id=data.voter_id,
            election_id=data.election_id,
            identity_commitment=data.identity_commitment
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

