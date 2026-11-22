"""
AegisVote Research Benchmark: Tallying Decryption Complexity
Compares Exponential ElGamal (Jung et al., MDPI 2026) vs. Paillier Additive Homomorphism (AegisVote, 2026-27).
Empirically demonstrates the elimination of the O(sqrt(N)) discrete logarithm bottleneck.
"""

import time
import math
import json
import random
import phe.paillier as paillier

# ==============================================================================
# 1. Exponential ElGamal Implementation (as in Jung et al., 2026)
# ==============================================================================
class ExponentialElGamal:
    def __init__(self):
        # RFC 3526 MODP group 14 (2048-bit prime) or safe benchmark prime
        self.p = 0xFFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E088A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7EDEE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3DC2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F83655D23DCA3AD961C62F356208552BB9ED529077096966D670C354E4ABC9804F1746C08CA18217C32905E462E36CE3BE39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9DE2BCBF6955817183995497CEA956AE515D2261898FA051015728E5A8AACAA68FFFFFFFFFFFFFFFF
        self.g = 2
        self.q = (self.p - 1) // 2
        self.x = random.randint(2, 100000)      # Private key
        self.y = pow(self.g, self.x, self.p)    # Public key

    def encrypt(self, m: int):
        r = random.randint(2, 100000)
        c1 = pow(self.g, r, self.p)
        c2 = (pow(self.g, m, self.p) * pow(self.y, r, self.p)) % self.p
        return c1, c2

    def homomorphic_multiply(self, ciphertexts):
        agg_c1 = 1
        agg_c2 = 1
        for c1, c2 in ciphertexts:
            agg_c1 = (agg_c1 * c1) % self.p
            agg_c2 = (agg_c2 * c2) % self.p
        return agg_c1, agg_c2

    def decrypt_and_solve_discrete_log(self, agg_c1: int, agg_c2: int, upper_bound: int):
        # 1. Standard ElGamal decryption produces g^M
        s = pow(agg_c1, self.x, self.p)
        s_inv = pow(s, self.p - 2, self.p)
        g_m = (agg_c2 * s_inv) % self.p

        # 2. Baby-step Giant-step (BSGS) algorithm to find M in O(sqrt(upper_bound))
        m_step = math.isqrt(upper_bound) + 1
        table = {}
        cur = 1
        for j in range(m_step):
            table[cur] = j
            cur = (cur * self.g) % self.p

        # Giant steps: factor = g^(-m_step)
        g_inv = pow(self.g, self.p - 2, self.p)
        factor = pow(g_inv, m_step, self.p)

        gamma = g_m
        for i in range(m_step):
            if gamma in table:
                return i * m_step + table[gamma]
            gamma = (gamma * factor) % self.p

        return -1


# ==============================================================================
# 2. Paillier Implementation (AegisVote Production phe)
# ==============================================================================
class PaillierHomomorphic:
    def __init__(self):
        self.pub_key, self.priv_key = paillier.generate_paillier_keypair(n_length=1024)

    def encrypt(self, m: int):
        return self.pub_key.encrypt(m)

    def homomorphic_multiply(self, ciphertexts):
        # Additive homomorphism: sum(c) = Prod(c_i)
        agg = ciphertexts[0]
        for c in ciphertexts[1:]:
            agg = agg + c
        return agg

    def decrypt(self, agg_ciphertext) -> int:
        # Direct O(1) modular inversion: NO discrete log search!
        return self.priv_key.decrypt(agg_ciphertext)


# ==============================================================================
# 3. Benchmark Execution Runner
# ==============================================================================
def run_benchmark():
    print("=" * 78)
    print("🔬 AegisVote Research Benchmarking: Homomorphic Tally Decryption")
    print("   Comparing Exponential ElGamal (BSGS) vs. Paillier Additive Homomorphism")
    print("=" * 78)

    print("🔑 Initializing cryptographic keypairs (Paillier 1024-bit, ElGamal RFC 3526)...")
    elgamal = ExponentialElGamal()
    paillier_crypto = PaillierHomomorphic()
    print("✅ Key generation complete.\n")

    test_sizes = [100, 500, 1000, 5000, 10000, 25000, 50000]
    results = []

    print(f"{'Voter Count (N)':<15} | {'ElGamal Tally (ms)':<20} | {'Paillier Tally (ms)':<20} | {'Speedup':<10}")
    print("-" * 75)

    for n in test_sizes:
        # Generate binary votes (0 or 1)
        votes = [1 if random.random() < 0.6 else 0 for _ in range(n)]
        expected_total = sum(votes)

        # 1. ElGamal Benchmark
        eg_ciphers = [elgamal.encrypt(v) for v in votes]
        t0 = time.perf_counter()
        agg_c1, agg_c2 = elgamal.homomorphic_multiply(eg_ciphers)
        recovered_eg = elgamal.decrypt_and_solve_discrete_log(agg_c1, agg_c2, upper_bound=n + 10)
        t_elgamal = (time.perf_counter() - t0) * 1000  # ms
        assert recovered_eg == expected_total, f"ElGamal error: {recovered_eg} != {expected_total}"

        # 2. Paillier Benchmark
        p_ciphers = [paillier_crypto.encrypt(v) for v in votes]
        t0 = time.perf_counter()
        agg_p = paillier_crypto.homomorphic_multiply(p_ciphers)
        recovered_p = paillier_crypto.decrypt(agg_p)
        t_paillier = (time.perf_counter() - t0) * 1000  # ms
        assert recovered_p == expected_total, f"Paillier error: {recovered_p} != {expected_total}"

        speedup = t_elgamal / max(t_paillier, 0.0001)

        print(f"{n:<15} | {t_elgamal:<20.3f} | {t_paillier:<20.3f} | {speedup:<10.2f}x")

        results.append({
            "voters": n,
            "elgamal_tally_ms": round(t_elgamal, 3),
            "paillier_tally_ms": round(t_paillier, 3),
            "speedup_factor": round(speedup, 2)
        })

    print("=" * 78)
    print("✅ Benchmark complete. All tally sums matched mathematical ground truth.")

    with open("backend/benchmarks/tally_benchmark_results.json", "w") as f:
        json.dump(results, f, indent=2)
    print("📁 Output saved to backend/benchmarks/tally_benchmark_results.json")

if __name__ == "__main__":
    run_benchmark()
