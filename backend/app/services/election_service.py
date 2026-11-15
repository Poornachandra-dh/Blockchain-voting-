"""
AegisVote Election Service
Manages election lifecycles, key ceremonies, and consortium state.
"""

import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional
from app.crypto.paillier import PaillierCrypto
from app.schemas.election import ElectionCreate, ElectionOut, ElectionStatus, Candidate


class ElectionRecord:
    def __init__(self, election_id: str, title: str, description: str, candidates: List[Candidate]):
        self.id = election_id
        self.title = title
        self.description = description
        self.candidates = candidates
        self.status = ElectionStatus.SETUP
        self.created_at = datetime.now(timezone.utc).isoformat()
        
        # Paillier Cryptographic Parameters (Consortium Master Keypair)
        self.public_key, self.private_key = PaillierCrypto.generate_keypair(n_length=1024)
        
        # Accepted Ballots & State
        self.accepted_ballots: List[Dict] = []
        self.nullifiers_set: set = set()
        self.merkle_root: str = "0000000000000000000000000000000000000000000000000000000000000000"
        
        # 3-Authority Partial Decryption Shares
        self.authority_shares: List[Dict] = []
        self.final_tally: Optional[List[int]] = None
        self.audit_report: Optional[Dict] = None

    def to_out_schema(self) -> ElectionOut:
        return ElectionOut(
            id=self.id,
            title=self.title,
            description=self.description,
            candidates=self.candidates,
            status=self.status,
            public_key=PaillierCrypto.serialize_public_key(self.public_key),
            accepted_ballot_count=len(self.accepted_ballots),
            merkle_root=self.merkle_root,
            created_at=self.created_at
        )


class ElectionService:
    def __init__(self):
        self._elections: Dict[str, ElectionRecord] = {}
        self._init_default_election()

    def _init_default_election(self):
        """Creates an initial demo election so the system is ready immediately."""
        default_id = "election-pesce-2026"
        candidates = [
            Candidate(id=0, name="Dr. A. Sharma", party="Progressive Alliance", avatar="/avatars/cand1.png"),
            Candidate(id=1, name="Prof. B. Rao", party="Tech & Integrity Forum", avatar="/avatars/cand2.png"),
            Candidate(id=2, name="Ms. C. Patel", party="Democratic Youth Front", avatar="/avatars/cand3.png"),
            Candidate(id=3, name="NOTA (None of the Above)", party="Independent", avatar="/avatars/nota.png")
        ]
        rec = ElectionRecord(
            election_id=default_id,
            title="PESCE Annual Consortium Election 2026",
            description="Privacy-Preserving & Verifiable Student Senate Remote Ballot on Hyperledger Fabric",
            candidates=candidates
        )
        rec.status = ElectionStatus.VOTING  # Open for immediate interactive voting
        self._elections[default_id] = rec

        try:
            from app.services.supabase_service import supabase_service
            supabase_service.save_or_update_election(
                election_id=default_id,
                title=rec.title,
                description=rec.description,
                status=rec.status.value if hasattr(rec.status, "value") else str(rec.status),
                public_key_n=str(rec.public_key.n)
            )
        except Exception:
            pass

    def create_election(self, data: ElectionCreate) -> ElectionOut:
        election_id = f"election-{uuid.uuid4().hex[:8]}"
        rec = ElectionRecord(
            election_id=election_id,
            title=data.title,
            description=data.description,
            candidates=data.candidates
        )
        self._elections[election_id] = rec
        return rec.to_out_schema()

    def get_election(self, election_id: str) -> Optional[ElectionRecord]:
        return self._elections.get(election_id)

    def list_elections(self) -> List[ElectionOut]:
        return [rec.to_out_schema() for rec in self._elections.values()]

    def update_status(self, election_id: str, new_status: ElectionStatus) -> ElectionOut:
        rec = self.get_election(election_id)
        if not rec:
            raise ValueError(f"Election {election_id} not found.")
        rec.status = new_status
        return rec.to_out_schema()

    def reset_election(self, election_id: str) -> ElectionOut:
        rec = self.get_election(election_id)
        if not rec:
            raise ValueError(f"Election {election_id} not found.")
        rec.accepted_ballots = []
        rec.nullifiers_set = set()
        rec.merkle_root = "0000000000000000000000000000000000000000000000000000000000000000"
        rec.final_tally = None
        rec.authority_shares = []
        rec.status = ElectionStatus.VOTING

        # Reset voter credential issued state for this election so users can vote again
        from app.services.voter_service import voter_service
        for v in voter_service._voters.values():
            v.issued_elections.discard(election_id)

        # Clear Merkle tree in voting service
        from app.services.voting_service import voting_service
        if election_id in voting_service._merkle_trees:
            from app.crypto.merkle import MerkleTree
            voting_service._merkle_trees[election_id] = MerkleTree()

        return rec.to_out_schema()


election_service = ElectionService()

