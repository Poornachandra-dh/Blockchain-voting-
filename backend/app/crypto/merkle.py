"""
AegisVote Merkle Audit Engine
Builds cryptographic audit trees over accepted ballots and nullifiers.
Enables:
1. Universal Verifiability: Any third party can independently verify ledger integrity.
2. Individual Verifiability: A voter can verify their ballot was included in the tally
   using an O(log N) Merkle inclusion proof without revealing their vote.
"""

import hashlib
from typing import List, Dict, Any, Optional


class MerkleTree:
    def __init__(self, leaves: Optional[List[str]] = None):
        """
        leaves: List of transaction or ballot hashes (hex strings).
        """
        self.leaves: List[str] = leaves or []
        self.layers: List[List[str]] = []
        if self.leaves:
            self._build_tree()

    @staticmethod
    def hash_pair(left: str, right: str) -> str:
        """Computes SHA-256(left || right) for two child node hashes."""
        combined = (left + right).encode("utf-8")
        return hashlib.sha256(combined).hexdigest()

    def add_leaf(self, leaf_hash: str) -> None:
        """Appends a new ballot hash to the tree and updates layers."""
        self.leaves.append(leaf_hash)
        self._build_tree()

    def _build_tree(self) -> None:
        """Constructs the complete binary Merkle tree up to the root."""
        if not self.leaves:
            self.layers = [[]]
            return

        current_layer = list(self.leaves)
        self.layers = [current_layer]

        while len(current_layer) > 1:
            next_layer = []
            for i in range(0, len(current_layer), 2):
                left = current_layer[i]
                if i + 1 < len(current_layer):
                    right = current_layer[i + 1]
                else:
                    right = left  # Duplicate last element if odd number of leaves
                next_layer.append(self.hash_pair(left, right))
            current_layer = next_layer
            self.layers.append(current_layer)

    @property
    def root(self) -> str:
        """Returns the Merkle root hash, or empty string if no leaves."""
        if not self.layers or not self.layers[-1]:
            return "0000000000000000000000000000000000000000000000000000000000000000"
        return self.layers[-1][0]

    def get_inclusion_proof(self, leaf_index: int) -> List[Dict[str, str]]:
        """
        Generates an audit path (inclusion proof) for the leaf at leaf_index.
        Returns a list of sibling nodes with directions ('left' or 'right').
        """
        if leaf_index < 0 or leaf_index >= len(self.leaves):
            raise IndexError("Leaf index out of bounds.")

        proof = []
        idx = leaf_index
        for layer in self.layers[:-1]:
            is_right_child = (idx % 2 == 1)
            sibling_idx = idx - 1 if is_right_child else idx + 1
            if sibling_idx < len(layer):
                sibling_hash = layer[sibling_idx]
            else:
                sibling_hash = layer[idx]  # Duplicated odd node

            proof.append({
                "direction": "left" if is_right_child else "right",
                "hash": sibling_hash
            })
            idx = idx // 2

        return proof

    @classmethod
    def verify_inclusion_proof(cls, leaf_hash: str, proof: List[Dict[str, str]], expected_root: str) -> bool:
        """
        Verifies that leaf_hash belongs to the tree represented by expected_root
        by computing the path through the proof.
        """
        current_hash = leaf_hash
        for step in proof:
            sibling = step["hash"]
            if step["direction"] == "left":
                current_hash = cls.hash_pair(sibling, current_hash)
            else:
                current_hash = cls.hash_pair(current_hash, sibling)
        return current_hash.lower() == expected_root.lower()

