pragma circom 2.1.0;

/*
 * AegisVote: 1-of-K Selection Ballot Validity Circuit
 * Proves in zero-knowledge that:
 * 1. The voter selected exactly one candidate (sum of vector == 1).
 * 2. Every element in the selection vector is strictly binary (v_i * (1 - v_i) == 0).
 * Prevents negative votes, multiple votes, or candidate vote inflation.
 */

template IsZero() {
    signal input in;
    signal output out;
    signal inv;

    inv <-- in != 0 ? 1 / in : 0;
    out <== -in * inv + 1;
    in * out === 0;
}

template BallotValidity(kCandidates) {
    // Private inputs (the voter's plaintext choice vector)
    signal input voteVector[kCandidates];

    // Public inputs
    signal input electionId;
    signal output isValid;

    signal binaryCheck[kCandidates];
    var sum = 0;

    for (var i = 0; i < kCandidates; i++) {
        // Constraint: v_i * (1 - v_i) === 0 (Enforces v_i in {0, 1})
        binaryCheck[i] <== voteVector[i] * (1 - voteVector[i]);
        binaryCheck[i] === 0;

        sum += voteVector[i];
    }

    // Constraint: sum of choices MUST be exactly 1
    sum === 1;

    isValid <== 1;
}

component main {public [electionId]} = BallotValidity(4);

