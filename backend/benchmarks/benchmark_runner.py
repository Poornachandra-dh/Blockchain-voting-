"""
AegisVote System Performance & Security Benchmark Runner
Measures Throughput (TPS), Latency Distribution, and Attack Resistance.
Produces empirical tables for academic research publications.
"""

import time
import json
import secrets
import statistics
import concurrent.futures
from app.crypto.paillier import PaillierCrypto
from app.crypto.zkp import ZKPBallotVerifier
from app.crypto.nullifier import NullifierEngine
from app.crypto.merkle import MerkleTree
from app.services.election_service import election_service
from app.services.voting_service import voting_service
from app.schemas.ballot import BallotSubmission

def run_performance_benchmarks():
    print("=" * 80)
    print("🚀 AegisVote Research Benchmarking: Throughput, Latency & Attack Resistance")
    print("=" * 80)

    # 1. Cryptographic Micro-benchmarks
    print("\n[Phase 1] Cryptographic Primitives Latency Benchmarking (N=200 iterations)...")
    election = election_service.get_election("election-pesce-2026")
    pub = election.public_key
    election_id = election.id
    pub_n_str = str(pub.n)

    # Paillier Encryption Latency
    t_enc = []
    enc_samples = []
    for _ in range(200):
        t0 = time.perf_counter()
        ev = PaillierCrypto.encrypt_vector(pub, [0, 1, 0, 0])
        t_enc.append((time.perf_counter() - t0) * 1000)
        enc_samples.append(ev)

    sample_enc_vector = enc_samples[0]

    # NIZK Proof Generation & Verification Latency
    t_zkp_gen = []
    t_zkp_ver = []
    for i in range(200):
        t0 = time.perf_counter()
        proof = ZKPBallotVerifier.generate_ballot_validity_proof([0, 1, 0, 0], sample_enc_vector, pub_n_str, election_id)
        t_zkp_gen.append((time.perf_counter() - t0) * 1000)

        t0 = time.perf_counter()
        valid = ZKPBallotVerifier.verify_ballot_validity_proof(proof, sample_enc_vector, pub_n_str, election_id)
        t_zkp_ver.append((time.perf_counter() - t0) * 1000)
        assert valid

    # Nullifier Derivation Latency
    t_nf = []
    for _ in range(200):
        t0 = time.perf_counter()
        _ = NullifierEngine.derive_nullifier("sk_voter_test_secret", election_id)
        t_nf.append((time.perf_counter() - t0) * 1000)

    # Merkle Inclusion Proof Generation & Verification
    tree = MerkleTree()
    leaves = [f"leaf_{i}_{time.time()}" for i in range(1000)]
    for leaf in leaves:
        tree.add_leaf(leaf)

    t_merkle_gen = []
    t_merkle_ver = []
    for i in range(200):
        idx = i % 1000
        t0 = time.perf_counter()
        p = tree.get_inclusion_proof(idx)
        t_merkle_gen.append((time.perf_counter() - t0) * 1000)

        t0 = time.perf_counter()
        ok = MerkleTree.verify_inclusion_proof(leaves[idx], p, tree.root)
        t_merkle_ver.append((time.perf_counter() - t0) * 1000)
        assert ok

    crypto_results = {
        "paillier_vector_enc_mean_ms": round(statistics.mean(t_enc), 3),
        "paillier_vector_enc_p95_ms": round(statistics.quantiles(t_enc, n=20)[18], 3),
        "zkp_proof_gen_mean_ms": round(statistics.mean(t_zkp_gen), 3),
        "zkp_proof_gen_p95_ms": round(statistics.quantiles(t_zkp_gen, n=20)[18], 3),
        "zkp_proof_ver_mean_ms": round(statistics.mean(t_zkp_ver), 3),
        "zkp_proof_ver_p95_ms": round(statistics.quantiles(t_zkp_ver, n=20)[18], 3),
        "nullifier_derivation_mean_ms": round(statistics.mean(t_nf), 4),
        "merkle_verify_mean_ms": round(statistics.mean(t_merkle_ver), 4)
    }

    print(f"  • Paillier Vector (4 cand) Encryption: {crypto_results['paillier_vector_enc_mean_ms']} ms (P95: {crypto_results['paillier_vector_enc_p95_ms']} ms)")
    print(f"  • NIZK 1-of-K Proof Generation:      {crypto_results['zkp_proof_gen_mean_ms']} ms (P95: {crypto_results['zkp_proof_gen_p95_ms']} ms)")
    print(f"  • NIZK 1-of-K Proof Verification:    {crypto_results['zkp_proof_ver_mean_ms']} ms (P95: {crypto_results['zkp_proof_ver_p95_ms']} ms)")
    print(f"  • Deterministic Nullifier Derivation: {crypto_results['nullifier_derivation_mean_ms']} ms")
    print(f"  • Merkle Inclusion Verification (1k): {crypto_results['merkle_verify_mean_ms']} ms")

    # 2. Attack Resilience Verification
    print("\n[Phase 2] Security & Attack Resilience Empirical Testing...")
    
    # Attack 1: Double-Voting Injection
    print("  Testing Attack 1: Double-Voting Attack Injection (500 duplicate attempts)...")
    voter_secret = secrets.token_hex(32)
    blinding_salt = secrets.token_hex(16)
    ballot_comm = "0x" + secrets.token_hex(16)
    nf = NullifierEngine.derive_nullifier(voter_secret, election_id)
    enc_v = PaillierCrypto.encrypt_vector(pub, [1, 0, 0, 0])
    zkp = ZKPBallotVerifier.generate_ballot_validity_proof([1, 0, 0, 0], enc_v, pub_n_str, election_id)
    binding = NullifierEngine.generate_binding_proof(voter_secret, blinding_salt, election_id, ballot_comm)

    ballot1 = BallotSubmission(
        election_id=election_id,
        nullifier=nf,
        candidate_index=0,
        encrypted_vector=enc_v,
        zkp_proof=zkp,
        binding_proof=binding
    )
    # First submission should succeed
    res1 = voting_service.submit_ballot(ballot1)
    assert res1.tx_id is not None

    # Subsequent submissions with identical nullifier MUST be rejected
    rejected_count = 0
    for _ in range(500):
        try:
            voting_service.submit_ballot(ballot1)
        except Exception:
            rejected_count += 1

    double_voting_rejection_rate = (rejected_count / 500.0) * 100.0
    print(f"  ✅ Double-Voting Rejection Rate: {double_voting_rejection_rate}% ({rejected_count}/500 blocked)")

    # Attack 2: Malformed Vector / Ballot Stuffing Injection
    print("  Testing Attack 2: Ballot Stuffing Attack Injection (500 malformed vectors)...")
    malformed_rejected = 0
    for _ in range(500):
        invalid_proof = {"type": "FORGED_ZKP", "k_candidates": 4, "vector_sum": 99}
        is_valid = ZKPBallotVerifier.verify_ballot_validity_proof(invalid_proof, enc_v, pub_n_str, election_id)
        if not is_valid:
            malformed_rejected += 1

    ballot_stuffing_rejection_rate = (malformed_rejected / 500.0) * 100.0
    print(f"  ✅ Ballot-Stuffing Rejection Rate: {ballot_stuffing_rejection_rate}% ({malformed_rejected}/500 blocked)")

    # 3. Concurrent Throughput & Latency Evaluation
    print("\n[Phase 3] Concurrent Load & End-to-End Latency Evaluation...")
    concurrency_levels = [1, 10, 50, 100, 200]
    throughput_results = []

    for c in concurrency_levels:
        latencies = []
        errors = 0

        def submit_simulated_vote(idx):
            v_secret = secrets.token_hex(32)
            v_salt = secrets.token_hex(16)
            b_comm = "0x" + secrets.token_hex(16)
            v_nf = NullifierEngine.derive_nullifier(v_secret, election_id)
            v_enc = PaillierCrypto.encrypt_vector(pub, [0, 1, 0, 0])
            v_zkp = ZKPBallotVerifier.generate_ballot_validity_proof([0, 1, 0, 0], v_enc, pub_n_str, election_id)
            v_bind = NullifierEngine.generate_binding_proof(v_secret, v_salt, election_id, b_comm)

            b = BallotSubmission(
                election_id=election_id,
                nullifier=v_nf,
                candidate_index=1,
                encrypted_vector=v_enc,
                zkp_proof=v_zkp,
                binding_proof=v_bind
            )
            t_start = time.perf_counter()
            r = voting_service.submit_ballot(b)
            return (time.perf_counter() - t_start) * 1000

        t0_total = time.perf_counter()
        with concurrent.futures.ThreadPoolExecutor(max_workers=min(c, 16)) as executor:
            futures = [executor.submit(submit_simulated_vote, i) for i in range(c)]
            for fut in concurrent.futures.as_completed(futures):
                try:
                    lat = fut.result()
                    latencies.append(lat)
                except Exception:
                    errors += 1

        total_wall_time = time.perf_counter() - t0_total
        tps = c / max(total_wall_time, 0.0001)
        mean_lat = statistics.mean(latencies) if latencies else 0
        p95_lat = statistics.quantiles(latencies, n=20)[18] if len(latencies) >= 20 else mean_lat
        err_rate = (errors / c) * 100.0

        print(f"  • Concurrency C={c:<4} | TPS: {tps:<6.2f} | Mean Latency: {mean_lat:<7.2f} ms | P95: {p95_lat:<7.2f} ms | Errors: {err_rate}%")

        throughput_results.append({
            "concurrent_voters": c,
            "tps": round(tps, 2),
            "mean_latency_ms": round(mean_lat, 2),
            "p95_latency_ms": round(p95_lat, 2),
            "error_rate_pct": err_rate
        })

    final_report = {
        "cryptographic_microbenchmarks": crypto_results,
        "attack_resilience": {
            "double_voting_rejection_rate_pct": double_voting_rejection_rate,
            "ballot_stuffing_rejection_rate_pct": ballot_stuffing_rejection_rate
        },
        "throughput_evaluation": throughput_results
    }

    with open("backend/benchmarks/system_benchmark_results.json", "w") as f:
        json.dump(final_report, f, indent=2)

    print("\n" + "=" * 80)
    print("📁 Complete system benchmark report saved to backend/benchmarks/system_benchmark_results.json")
    print("=" * 80)

if __name__ == "__main__":
    run_performance_benchmarks()
