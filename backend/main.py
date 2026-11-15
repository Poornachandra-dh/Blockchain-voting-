import asyncio
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router
from app.services.election_service import election_service

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "Production-Grade Privacy-Preserving E-Voting Infrastructure on Hyperledger Fabric. "
        "Implements Credential-Bound Nullifiers, Homomorphic Paillier Vector Tallying, "
        "Zero-Knowledge 1-of-K Ballot Proofs, and 3-Authority Independent Universal Verifiability."
    ),
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Cross-Origin Resource Sharing (CORS) Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits Next.js dev server (localhost:3000) & cloud deployments
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount REST API
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Health"])
def health_check():
    return {
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "OPERATIONAL",
        "consortium_orgs": settings.ORGS,
        "endorsement_policy": f"{settings.REQUIRED_ENDORSEMENTS}-of-{len(settings.ORGS)}",
        "documentation": "/docs"
    }


# Real-time WebSocket connection manager for live block updates & voting ticker
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception:
                pass


ws_manager = ConnectionManager()


@app.websocket("/ws/live/{election_id}")
async def websocket_live_ticker(websocket: WebSocket, election_id: str):
    """
    Streams real-time block generation, newly accepted nullifiers,
    and endorsement logs to the client interface.
    """
    await ws_manager.connect(websocket)
    try:
        while True:
            election = election_service.get_election(election_id)
            if election:
                payload = {
                    "election_id": election_id,
                    "block_height": len(election.accepted_ballots),
                    "accepted_ballots": len(election.accepted_ballots),
                    "merkle_root": election.merkle_root,
                    "status": election.status
                }
                await websocket.send_text(json.dumps(payload))
            await asyncio.sleep(2)  # Emit status update every 2 seconds
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

