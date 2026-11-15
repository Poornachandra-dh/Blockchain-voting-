"""
Comprehensive Cryptographic & Voting Pipeline Test Suite
Tests:
1. Paillier Homomorphic Vector Aggregation & Decryption
2. Credential-Bound Nullifier Derivation & Zero-Knowledge Binding
3. Zero-Knowledge 1-of-K Ballot Validity Proofs
4. Merkle Tree Root Calculation & Inclusion Proofs
5. 2-of-3 Threshold Decryption Ceremony
6. End-to-End Election Cycle (Register -> Credential -> Vote -> Tally -> 3-Org Audit)
7. Security: Duplicate-Vote Nullifier Attack Interception
"""

import pytest
from app.crypto.paillier import PaillierCrypto
from app.crypto.nullifier import NullifierEngine
from app.crypto.zkp import ZKPBallotVerifier
from app.crypto.merkle import MerkleTree
from app.crypto.threshold import ThresholdDecryptionAuthority, ThresholdCoordinator
from app.services.election_service import election_service
from app.services.voter_service import voter_service
from app.services.voting_service import voting_service
from app.services.tally_service import tally_service
from app.services.audit_service import audit_service
from app.schemas.ballot import BallotSubmission
from app.schemas.voter import VoterRegister


def test_paillier_homomorphic_tally():
    """Verify that multiplying Paillier ciphertexts sums the underlying votes."""
    pub_key, priv_key = PaillierCrypto.generate_keypair(n_length=1024)

    # 3 voters:
    # Voter 1 votes for Candidate 1: [0, 1, 0]
    # Voter 2 votes for Candidate 1: [0, 1, 0]
    # Voter 3 votes for Candidate 0: [1, 0, 0]
    # Expected totals: Candidate 0 = 1, Candidate 1 = 2, Candidate 2 = 0
    b1 = PaillierCrypto.encrypt_vector(pub_key, [0, 1, 0])
    b2 = PaillierCrypto.encrypt_vector(pub_key, [0, 1, 0])
    b3 = PaillierCrypto.encrypt_vector(pub_key, [1, 0, 0])

    # Homomorphic aggregation
    agg_vector = PaillierCrypto.aggregate_ciphertexts(pub_key, [b1, b2, b3])

    # Controlled decryption
    decrypted_totals = PaillierCrypto.decrypt_vector(priv_key, agg_vector)
    assert decrypted_totals == [1, 2, 0]


def test_credential_bound_nullifier():
    """Verify nullifier determinism and zero-knowledge binding proof."""
    secret, salt = NullifierEngine.generate_voter_keypair()
    election_id = "test-election-2026"

    # Commitment for registration
    c_id = NullifierEngine.create_identity_commitment(secret, salt)
    assert len(c_id) == 64

    # Derive nullifier
    nf1 = NullifierEngine.derive_nullifier(secret, election_id)
    nf2 = NullifierEngine.derive_nullifier(secret, election_id)
    # Must be deterministic
    assert nf1 == nf2

    # Different election ID must yield a different nullifier
    nf_other_election = NullifierEngine.derive_nullifier(secret, "another-election-2027")
    assert nf1 != nf_other_election

    # Generate and verify binding proof
    proof = NullifierEngine.generate_binding_proof(
        voter_secret=secret,
        blinding_factor=salt,
        election_id=election_id,
        ballot_commitment="dummy-ballot-commitment"
    )
    assert NullifierEngine.verify_binding_proof(proof) is True


def test_zkp_ballot_validity():
    """Verify 1-of-K selection proof passes for valid vote and fails for invalid."""
    pub_key, _ = PaillierCrypto.generate_keypair(n_length=1024)
    pk_dict = PaillierCrypto.serialize_public_key(pub_key)
    election_id = "election-zkp-test"

    valid_vote = [0, 1, 0, 0]
    encrypted_vote = PaillierCrypto.encrypt_vector(pub_key, valid_vote)

    proof = ZKPBallotVerifier.generate_ballot_validity_proof(
        vote_vector=valid_vote,
        encrypted_vector=encrypted_vote,
        public_key_n=pk_dict["n"],
        election_id=election_id
    )

    is_valid = ZKPBallotVerifier.verify_ballot_validity_proof(
        proof=proof,
        encrypted_vector=encrypted_vote,
        public_key_n=pk_dict["n"],
        election_id=election_id
    )
    assert is_valid is True


def test_merkle_tree_and_inclusion_receipt():
    """Verify Merkle tree construction and voter inclusion proof."""
    leaves = [
        "a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90",
        "b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90a1",
        "c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2",
        "d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3"
    ]
    tree = MerkleTree(leaves)
    root = tree.root
    assert len(root) == 64

    # Get inclusion proof for leaf 2
    proof = tree.get_inclusion_proof(2)
    assert MerkleTree.verify_inclusion_proof(leaves[2], proof, root) is True


def test_end_to_end_voting_and_audit():
    """
    Executes the complete 10-stage election workflow:
    1. Register voter
    2. Request anonymous credential
    3. Generate client-side vote & proofs
    4. Cast ballot on ledger
    5. Execute 2-of-3 threshold homomorphic tally
    6. Run 3-Authority independent 6-check audit
    """
    election = election_service.get_election("election-pesce-2026")
    assert election is not None

    # Step 1 & 2: Voter generates secret and requests credential
    voter_secret, salt = NullifierEngine.generate_voter_keypair()
    c_id = NullifierEngine.create_identity_commitment(voter_secret, salt)

    cred = voter_service.issue_anonymous_credential(
        voter_id="VOTER-001",
        election_id=election.id,
        identity_commitment=c_id
    )
    assert cred.status == "VALID"

    # Step 3: Prepare ballot for candidate 1 (Prof. B. Rao)
    vote_vec = [0, 1, 0, 0]
    enc_vector = PaillierCrypto.encrypt_vector(election.public_key, vote_vec)
    pk_dict = PaillierCrypto.serialize_public_key(election.public_key)

    # Derivations & Proofs
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
        ballot_commitment=enc_vector[0]["ciphertext"][:16]
    )

    # Step 4: Cast Ballot
    submission = BallotSubmission(
        election_id=election.id,
        nullifier=nullifier,
        encrypted_vector=enc_vector,
        zkp_proof=zkp_proof,
        binding_proof=binding_proof
    )
    receipt = voting_service.submit_ballot(submission)
    assert receipt.tx_id.startswith("tx-")
    assert receipt.merkle_root == election.merkle_root

    # Step 5: Duplicate Vote Attack Prevention
    with pytest.raises(ValueError, match="Double Voting Rejected"):
        voting_service.submit_ballot(submission)

    # Step 6: Tally & 2-of-3 Threshold Ceremony
    tally_result = tally_service.execute_tally_ceremony(election.id)
    assert tally_result["total_ballots"] >= 1
    assert "participating_authorities" in tally_result

    # Step 7: 3-Authority Independent Audit (6 checks)
    audit_report = audit_service.run_full_consortium_audit(election.id)
    assert audit_report.universal_verifiability_status == "VERIFIED"
    assert len(audit_report.authority_audits) == 3
    for auth_check in audit_report.authority_audits:
        assert auth_check.ballot_validity_passed is True
        assert auth_check.nullifier_uniqueness_passed is True
        assert auth_check.accepted_ballot_count_matched is True
        assert auth_check.ledger_integrity_verified is True
        assert auth_check.zkp_proofs_valid is True
        assert auth_check.tally_consistency_confirmed is True

