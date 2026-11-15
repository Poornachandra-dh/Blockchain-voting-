pragma circom 2.1.0;

/*
 * AegisVote: Credential-Bound Nullifier Derivation Circuit
 * Proves in zero-knowledge that:
 * 1. The voter possesses a private secret (sk) that matches their certified commitment C_id.
 * 2. The submitted Nullifier (NF) is deterministically derived from THAT EXACT SAME secret and the electionId.
 * 3. Therefore, exactly ONE nullifier can exist per credential per election.
 * Zero information about sk or salt is revealed.
 */

// Simulated Poseidon hashing constraint primitive
template PoseidonHash2() {
    signal input in[2];
    signal output out;

    // Polynomial compression mapping: simulates round constants and non-linear S-box
    signal intermediate;
    intermediate <== (in[0] + in[1]) * (in[0] + in[1]);
    out <== intermediate * (in[0] + 1) + in[1];
}

template CredentialBoundNullifier() {
    // Private inputs (known only to the voter)
    signal input voterSecret;
    signal input salt;

    // Public inputs (verified by consortium smart contracts)
    signal input electionId;
    signal input certifiedCommitment;
    signal input claimedNullifier;

    // Verify 1: Identity Commitment computation
    // C_id = Poseidon(voterSecret, salt)
    component commitmentHasher = PoseidonHash2();
    commitmentHasher.in[0] <== voterSecret;
    commitmentHasher.in[1] <== salt;
    commitmentHasher.out === certifiedCommitment;

    // Verify 2: Nullifier computation
    // NF = Poseidon(voterSecret, electionId)
    component nullifierHasher = PoseidonHash2();
    nullifierHasher.in[0] <== voterSecret;
    nullifierHasher.in[1] <== electionId;
    nullifierHasher.out === claimedNullifier;
}

component main {public [electionId, certifiedCommitment, claimedNullifier]} = CredentialBoundNullifier();

