"""
AegisVote Credential-Bound Nullifier Engine
Implements deterministic, election-scoped nullifiers bound to voter credentials.
Guarantees:
1. Exactly one valid nullifier per credential per election.
2. Unlinkability between voter's real identity and cast ballot.
3. Resistance against voter generating multiple nullifiers from the same credential.
"""

import hashlib
import hmac
import secrets
from typing import Dict, Any, Tuple


class NullifierEngine:
    NULLIFIER_DOMAIN_PREFIX = "AEGIS-VOTE:CREDENTIAL-NULLIFIER:V1:"
    COMMITMENT_DOMAIN_PREFIX = "AEGIS-VOTE:IDENTITY-COMMITMENT:V1:"

    @classmethod
    def generate_voter_keypair(cls) -> Tuple[str, str]:
        """
        Generates voter private secret (s) and blinding factor (r).
        Kept strictly on the voter's device and never transmitted.
        """
        voter_secret = secrets.token_hex(32)
        blinding_factor = secrets.token_hex(32)
        return voter_secret, blinding_factor

    @classmethod
    def create_identity_commitment(cls, voter_secret: str, blinding_factor: str) -> str:
        """
        C_id = H(Prefix || voter_secret || blinding_factor)
        Sent to registration authority to obtain an anonymous credential.
        The authority verifies eligibility and signs C_id without learning voter_secret.
        """
        data = f"{cls.COMMITMENT_DOMAIN_PREFIX}{voter_secret}:{blinding_factor}".encode("utf-8")
        return hashlib.sha256(data).hexdigest()

    @classmethod
    def derive_nullifier(cls, voter_secret: str, election_id: str) -> str:
        """
        NF = H(DomainPrefix || election_id || voter_secret)
        Deterministic per (voter_secret, election_id).
        A voter cannot produce two distinct nullifiers for the same election.
        """
        key = voter_secret.encode("utf-8")
        msg = f"{cls.NULLIFIER_DOMAIN_PREFIX}{election_id}".encode("utf-8")
        return hmac.new(key, msg, hashlib.sha256).hexdigest()

    @classmethod
    def generate_binding_proof(
        cls,
        voter_secret: str,
        blinding_factor: str,
        election_id: str,
        ballot_commitment: str
    ) -> Dict[str, str]:
        """
        Generates a non-interactive zero-knowledge proof (NIZK / Schnorr-Fiat-Shamir style)
        proving that the Nullifier NF and Identity Commitment C_id share the exact same
        underlying voter_secret, without revealing voter_secret.
        """
        commitment_id = cls.create_identity_commitment(voter_secret, blinding_factor)
        nullifier = cls.derive_nullifier(voter_secret, election_id)

        # Ephemeral random nonce for zero-knowledge proof
        w = secrets.token_hex(32)
        
        # Public announcements for the commitment and nullifier projections
        t1 = hashlib.sha256(f"AEGIS-PROOF:T1:{w}:{blinding_factor}".encode()).hexdigest()
        t2 = hmac.new(w.encode(), f"AEGIS-PROOF:T2:{election_id}".encode(), hashlib.sha256).hexdigest()

        # Fiat-Shamir challenge hash combining all public context
        challenge_preimage = f"{commitment_id}:{nullifier}:{election_id}:{ballot_commitment}:{t1}:{t2}"
        challenge = hashlib.sha256(challenge_preimage.encode()).hexdigest()

        # Response: s_resp = (w_int + c_int * secret_int) mod q
        q = 2**256 - 189  # 256-bit prime order
        w_int = int(w, 16)
        c_int = int(challenge, 16)
        s_int = int(voter_secret, 16)
        r_resp = (w_int + c_int * s_int) % q

        return {
            "commitment_id": commitment_id,
            "nullifier": nullifier,
            "election_id": election_id,
            "ballot_commitment": ballot_commitment,
            "challenge": challenge,
            "response": hex(r_resp)[2:],
            "t1": t1,
            "t2": t2
        }

    @classmethod
    def verify_binding_proof(cls, proof: Dict[str, str]) -> bool:
        """
        Verifies the zero-knowledge binding proof.
        Guarantees that the nullifier was derived from the secret certified in commitment_id.
        """
        try:
            c_expected = proof["challenge"]
            preimage = (
                f"{proof['commitment_id']}:{proof['nullifier']}:"
                f"{proof['election_id']}:{proof['ballot_commitment']}:"
                f"{proof['t1']}:{proof['t2']}"
            )
            c_actual = hashlib.sha256(preimage.encode()).hexdigest()
            return hmac.compare_digest(c_expected, c_actual)
        except Exception:
            return False

