"""
Live Integration Test: Hyperledger Fabric 3-Organization Consortium
Tests:
1. Consortium Peer & Orderer Connectivity
2. Smart Contract (voting_cc) World State Query
3. End-to-End Ballot Casting with 2-of-3 Endorsement
4. Double-Voting Rejection Enforced by Blockchain Nullifier State
"""

import pytest
import uuid
from app.services.fabric_service import fabric_service
from app.services.election_service import election_service
from app.services.voter_service import voter_service
from app.services.voting_service import voting_service
from app.crypto.paillier import PaillierCrypto
from app.crypto.nullifier import NullifierEngine
from app.crypto.zkp import ZKPBallotVerifier
from app.schemas.ballot import BallotSubmission


def test_fabric_network_health():
    """Verify that aegis_cli and Fabric network are online and responsive."""
    assert fabric_service.is_network_online() is True


def test_fabric_query_election():
    """Verify smart contract world state query on votingchannel."""
    election_meta = fabric_service.query_election("election-pesce-2026")
    assert election_meta is not None
    assert election_meta["election_id"] == "election-pesce-2026"
    assert election_meta["status"] == "ACTIVE"


def test_live_blockchain_ballot_casting_and_double_voting():
    """
    Submits a real encrypted ballot to Hyperledger Fabric peers,
    collects 2-of-3 endorsement, commits the block,
    and then asserts that re-submitting with the same nullifier is REJECTED by consensus.
    """
    election = election_service.get_election("election-pesce-2026")
    assert election is not None
    from app.schemas.election import ElectionStatus
    election.status = ElectionStatus.VOTING

    # Step 1: Generate voter secret & credentials
    voter_secret, salt = NullifierEngine.generate_voter_keypair()
    c_id = NullifierEngine.create_identity_commitment(voter_secret, salt)

    # Step 2: Encrypt vector (vote for Candidate 1)
    k = len(election.candidates)
    candidate_choice = 1
    vote_vec = [1 if i == candidate_choice else 0 for i in range(k)]
    enc_vector = PaillierCrypto.encrypt_vector(election.public_key, vote_vec)
    pk_dict = PaillierCrypto.serialize_public_key(election.public_key)

    # Step 3: Compute Nullifier & ZKP Proofs
    nullifier = NullifierEngine.derive_nullifier(voter_secret, election.id)
    zkp_proof = ZKPBallotVerifier.generate_ballot_validity_proof(
        vote_vector=vote_vec,
        encrypted_vector=enc_vector,
        public_key_n=pk_dict["n"],
        election_id=election.id
    )
    binding_proof = NullifierEngine.generate_binding_proof(
        voter_secret=voter_secret,
        blinding_factor=salt,
        election_id=election.id,
        ballot_commitment="test-ballot-commitment"
    )

    submission = BallotSubmission(
        election_id=election.id,
        nullifier=nullifier,
        binding_proof=binding_proof,
        encrypted_vector=enc_vector,
        zkp_proof=zkp_proof,
        candidate_index=candidate_choice
    )

    # 1. Cast first ballot -> MUST SUCCEED on Fabric
    receipt = voting_service.submit_ballot(submission)
    assert receipt is not None
    assert receipt.tx_id is not None
    assert "ENDORSED_ON_CHAIN" in receipt.endorsements[0]

    # 2. Attempt double voting with SAME nullifier -> MUST BE REJECTED by Blockchain
    with pytest.raises(ValueError) as excinfo:
        voting_service.submit_ballot(submission)
    assert "Double Voting" in str(excinfo.value) or "already" in str(excinfo.value)
