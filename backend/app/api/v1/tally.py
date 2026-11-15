from fastapi import APIRouter, HTTPException
from app.services.tally_service import tally_service
from app.services.election_service import election_service

router = APIRouter(prefix="/tally", tags=["Tally & Threshold Decryption"])


@router.post("/{election_id}/execute")
def execute_election_tally(election_id: str):
    """
    Executes homomorphic aggregation and conducts the 2-of-3 threshold partial decryption ceremony.
    No individual ballots are ever decrypted.
    """
    try:
        result = tally_service.execute_tally_ceremony(election_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Threshold tally ceremony error: {str(e)}")


@router.get("/{election_id}/results")
def get_election_results(election_id: str):
    """Fetches the official finalized election results."""
    election = election_service.get_election(election_id)
    if not election:
        raise HTTPException(status_code=404, detail="Election not found")

    if election.final_tally is None:
        raise HTTPException(status_code=400, detail="Election has not been tallied yet.")

    return {
        "election_id": election_id,
        "status": election.status,
        "total_ballots": len(election.accepted_ballots),
        "results": [
            {
                "candidate_id": c.id,
                "name": c.name,
                "party": c.party,
                "votes": election.final_tally[idx] if idx < len(election.final_tally) else 0
            }
            for idx, c in enumerate(election.candidates)
        ]
    }

