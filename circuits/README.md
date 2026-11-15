# AegisVote Zero-Knowledge Proof Circuits (Circom 2.1)

This directory contains the production R1CS arithmetic circuits that guarantee unconditional ballot secrecy and duplicate-prevention on Hyperledger Fabric.

---

## 1. `ballot_validity.circom`
* **Purpose:** Proves that an encrypted ballot encodes a strict **1-of-K selection** without revealing the candidate chosen.
* **Constraints:**
  1. $v_i \cdot (1 - v_i) = 0 \quad \forall i \in [0, K-1]$ (Binary enforcement: each vote value is strictly 0 or 1).
  2. $\sum_{i=0}^{K-1} v_i = 1$ (Sum constraint: exactly one candidate selected).
* **Guarantees:** Eliminates negative-vote attacks and vote stuffing.

---

## 2. `nullifier_derivation.circom`
* **Purpose:** Proves that the submitted **Nullifier ($NF$)** and the certified **Identity Commitment ($C_{id}$)** originate from the **exact same private key $sk$**.
* **Constraints:**
  1. $C_{id} == \text{Poseidon}(sk, salt)$
  2. $NF == \text{Poseidon}(sk, \text{electionId})$
* **Guarantees:** 
  * Prevents a voter from computing multiple nullifiers from one credential.
  * Ensures duplicate attempts with the same credential collide on the nullifier set and are aborted by Fabric chaincode.

---

## Compilation & Proving Commands

```bash
# 1. Compile circuit to R1CS and WASM witness generator
circom ballot_validity.circom --r1cs --wasm --sym

# 2. Setup Groth16 zk-SNARK trusted setup (Powers of Tau)
snarkjs groth16 setup ballot_validity.r1cs pot12_final.ptau ballot_validity_final.zkey

# 3. Export verification key for Hyperledger Fabric Go chaincode
snarkjs zkey export verification_key ballot_validity_final.zkey verification_key.json
```

