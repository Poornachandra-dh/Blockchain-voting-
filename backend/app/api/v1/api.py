from fastapi import APIRouter
from app.api.v1.elections import router as elections_router
from app.api.v1.voters import router as voters_router
from app.api.v1.ballots import router as ballots_router
from app.api.v1.tally import router as tally_router
from app.api.v1.audit import router as audit_router
from app.api.v1.chaos import router as chaos_router
from app.api.v1.telemetry import router as telemetry_router

api_router = APIRouter()

api_router.include_router(elections_router)
api_router.include_router(voters_router)
api_router.include_router(ballots_router)
api_router.include_router(tally_router)
api_router.include_router(audit_router)
api_router.include_router(chaos_router)
api_router.include_router(telemetry_router)

