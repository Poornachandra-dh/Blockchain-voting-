"""
AegisVote Paillier Homomorphic Encryption Engine
Implements additive homomorphic encryption for ballots:
- Enc(m1) * Enc(m2) mod n^2 = Enc(m1 + m2 mod n)
- Allows aggregation of thousands of votes without decrypting individual choices.
"""

from typing import List, Tuple, Dict, Any
import phe.paillier as paillier


class PaillierCrypto:
    @staticmethod
    def generate_keypair(n_length: int = 1024) -> Tuple[paillier.PaillierPublicKey, paillier.PaillierPrivateKey]:
        """Generate a Paillier keypair with specified bit length."""
        public_key, private_key = paillier.generate_paillier_keypair(n_length=n_length)
        return public_key, private_key

    @staticmethod
    def serialize_public_key(public_key: paillier.PaillierPublicKey) -> Dict[str, Any]:
        """Serialize public key for distribution to voters and authorities."""
        return {
            "n": str(public_key.n),
            "g": str(public_key.g)
        }

    @staticmethod
    def deserialize_public_key(data: Dict[str, Any]) -> paillier.PaillierPublicKey:
        """Reconstruct public key from serialized data."""
        n = int(data["n"])
        return paillier.PaillierPublicKey(n=n)

    @staticmethod
    def serialize_ciphertext(encrypted_number: paillier.EncryptedNumber) -> Dict[str, Any]:
        """Serialize EncryptedNumber to JSON-compatible dictionary."""
        return {
            "ciphertext": str(encrypted_number.ciphertext()),
            "exponent": encrypted_number.exponent
        }

    @staticmethod
    def deserialize_ciphertext(public_key: paillier.PaillierPublicKey, data: Dict[str, Any]) -> paillier.EncryptedNumber:
        """Deserialize EncryptedNumber using the corresponding public key."""
        ciphertext_int = int(data["ciphertext"])
        exponent = int(data.get("exponent", 0))
        return paillier.EncryptedNumber(public_key, ciphertext_int, exponent)

    @classmethod
    def encrypt_vector(cls, public_key: paillier.PaillierPublicKey, vector: List[int]) -> List[Dict[str, Any]]:
        """
        Encrypt a 1-of-K selection vector, e.g. [0, 1, 0, 0].
        Each element is encrypted independently so they can be homomorphically summed.
        """
        encrypted_vector = []
        for val in vector:
            enc = public_key.encrypt(val)
            encrypted_vector.append(cls.serialize_ciphertext(enc))
        return encrypted_vector

    @classmethod
    def aggregate_ciphertexts(
        cls,
        public_key: paillier.PaillierPublicKey,
        ciphertexts: List[List[Dict[str, Any]]]
    ) -> List[Dict[str, Any]]:
        """
        Homomorphically aggregates candidate vote vectors.
        ciphertexts: List of encrypted vectors from all accepted ballots.
        Returns: The homomorphic sum vector.
        """
        if not ciphertexts:
            raise ValueError("No ciphertexts provided for aggregation.")

        num_candidates = len(ciphertexts[0])
        # Initialize accumulator with first ballot
        accumulators = [cls.deserialize_ciphertext(public_key, c) for c in ciphertexts[0]]

        # Multiply remaining ciphertexts (which adds the underlying plaintexts)
        for ballot in ciphertexts[1:]:
            if len(ballot) != num_candidates:
                raise ValueError("Mismatch in candidate vector dimensions across ballots.")
            for k in range(num_candidates):
                enc_num = cls.deserialize_ciphertext(public_key, ballot[k])
                accumulators[k] = accumulators[k] + enc_num  # phe library overloads '+' to multiply ciphertexts

        return [cls.serialize_ciphertext(acc) for acc in accumulators]

    @classmethod
    def decrypt_vector(
        cls,
        private_key: paillier.PaillierPrivateKey,
        encrypted_vector: List[Dict[str, Any]]
    ) -> List[int]:
        """Decrypts an aggregated encrypted vector to obtain final candidate totals."""
        results = []
        for item in encrypted_vector:
            enc_num = cls.deserialize_ciphertext(private_key.public_key, item)
            plain_val = private_key.decrypt(enc_num)
            results.append(int(plain_val))
        return results

