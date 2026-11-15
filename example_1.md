# 📘 AegisVote: The Complete 0-to-100 Illustrated Walkthrough

> **How a Bulletproof, Privacy-Preserving Blockchain Vote Works — Explained in Simple English & Deep Cryptographic Mechanics.**

---

## 🌟 The Big Picture: What Are We Trying to Solve?

Imagine you are holding an election for your college or country. You want three things that normally contradict each other:
1. **Total Secrecy**: No one (not the principal, not the IT admin, not even the government) should know who you voted for.
2. **Double-Voting Prevention**: You can only vote once.
3. **100% Proof of Honesty**: You can independently prove your vote was counted in the final tally, and anyone in the public can audit the election results without decrypting anyone's secret choice.

**AegisVote** solves this using advanced mathematics and permissioned blockchain technology.

---

## 🎭 The Cast of Characters in Our Example

To understand every single step, let's follow one concrete story from start to finish:

- **The Voter**: **Poorna** (Student at PESCE Mandya, USN: `4PS23IS039`).
- **The Election**: `election-pesce-2026` (*Student Senate President*).
- **The Candidates**:
  - `[Index 0]`: **Dr. A. Sharma**
  - `[Index 1]`: **Prof. B. Rao** *(Poorna's preferred candidate!)*
  - `[Index 2]`: **Ms. C. Patel**
  - `[Index 3]`: **NOTA** (*None of the Above*)
- **The 3 Consortium Trustees (Holders of the Master Key)**:
  - **Trustee 1**: PESCE Election Commission
  - **Trustee 2**: Independent Cyber Oversight / Government Observer
  - **Trustee 3**: Public Civil Watchdog / Student Council NGO

---

# 🚀 The 10-Step Journey: From Login to Certified Results

```
 [Poorna's Laptop]
       │
       ▼  Step 1: Login & Verify Identity (Supabase KYC)
       │
       ▼  Step 2: Generate Secret Key & Anonymous Credential
       │
       ▼  Step 3: One-Hot Selection [0, 1, 0, 0] & Paillier Encryption
       │
       ▼  Step 4: Generate Zero-Knowledge (ZKP) Proof & Deterministic Nullifier
       │
       ▼  Step 5: Broadcast to 3-Org Blockchain Consortium
 [Hyperledger Fabric Network]
       │
       ▼  Step 6: Consensus 2-of-3 Endorsement & Merkle Tree Ingestion
       │
       ▼  Step 7: Cloud Audit Sync (Supabase) & Voter Cryptographic Receipt Issued
       │
 [Election Closes]
       │
       ▼  Step 8: Homomorphic Aggregation (Summing without decrypting!)
       │
       ▼  Step 9: 2-of-3 Threshold Decryption Ceremony (Lagrange Interpolation)
       │
 [Public Verifier]
       ▼  Step 10: Universal Audit & Poorna Verifies His Receipt
```

---

## Step 1: Login & Identity Verification (Who are you?)

### 💡 Simple Explanation:
Before Poorna can vote, the system must verify he is a real, registered student at PESCE Mandya who hasn't voted yet.

### ⚙️ Deep Technical Details:
1. Poorna opens `http://localhost:3000/login` and enters his USN `4PS23IS039` and passphrase.
2. The backend queries the external **Supabase Cloud Database**:
   ```sql
   SELECT * FROM voters WHERE voter_id = 'VOTER-001';
   ```
3. Supabase confirms Poorna is eligible and has `has_voted = false`.
4. An optional **FIDO2 / WebAuthn** hardware token attestation is verified to prevent automated bots.

---

## Step 2: The Digital Mask (Anonymous Credential Issuance)

### 💡 Simple Explanation:
If the election authority knows Poorna's identity, how do we stop them from spying on his vote?  
**Solution**: Poorna's computer creates a secret "digital mask" (a cryptographic commitment). The authority signs this mask without ever knowing what secret is inside it!

### ⚙️ Deep Technical Details:
1. In Poorna's browser (using the Web Crypto API), two random 256-bit numbers are generated:
   - **Voter Secret ($sk_v$)**: `0x7f8a...` (stays on Poorna's laptop forever)
   - **Blinding Salt ($r$)**: `0x3b1c...`
2. The browser computes an **Identity Commitment** ($\mathcal{C}_{id}$):
   $$\mathcal{C}_{id} = \text{SHA256}(\text{"AEGIS-ID:"} \mathbin{\Vert} sk_v \mathbin{\Vert} r)$$
3. Poorna submits $\mathcal{C}_{id}$ to the Election Commission.
4. The Commission verifies Poorna's eligibility and digital-signs $\mathcal{C}_{id}$.
   > **Key Insight**: The Commission knows *Poorna was issued a credential*, but they have **no idea** what secret $sk_v$ created it.

---

## Step 3: Inside the Voting Booth (One-Hot Vector & Paillier Encryption)

### 💡 Simple Explanation:
Poorna wants to vote for **Prof. B. Rao** (Candidate #1).  
Instead of sending the text `"Prof. B. Rao"` over the internet, Poorna's device turns his choice into a row of 4 slots:  
`[0, 1, 0, 0]`.  
Then, each number is locked inside a special mathematical safe using **Paillier Homomorphic Encryption**.

### ⚙️ Deep Technical Details:
- **Vector Representation**:
  $$\vec{V} = [v_0=0,\; v_1=1,\; v_2=0,\; v_3=0]$$
- **The Paillier Cryptosystem**:
  The election has a public key $(n, g)$ where $n$ is a 1024-bit modulus.
  For each slot $k \in \{0, 1, 2, 3\}$, Poorna's browser picks a random number $r_k$ and computes:
  $$c_k = g^{v_k} \cdot r_k^n \pmod{n^2}$$
  - For $v_0 = 0$: $c_0 = g^0 \cdot r_0^n = 1 \cdot r_0^n \pmod{n^2} = \text{"94827104..."}$
  - For $v_1 = 1$: $c_1 = g^1 \cdot r_1^n = g \cdot r_1^n \pmod{n^2} = \text{"20394817..."}$
  - For $v_2 = 0$: $c_2 = g^0 \cdot r_2^n = \text{"88192043..."}$
  - For $v_3 = 0$: $c_3 = g^0 \cdot r_3^n = \text{"19283741..."}$

> **Why Paillier?**  
> If an attacker, hacker, or server admin looks at $[c_0, c_1, c_2, c_3]$, each one looks like an identical string of 600 random numbers. It is mathematically impossible to know which slot contains the `1` without the private key.

### ❓ Crucial Question: "Did you use ElGamal Algorithm? Why Paillier instead?"

Many research papers use the **ElGamal Cryptosystem** for voting. Here is the exact reason why **AegisVote chose Paillier over ElGamal**, and how they compare:

| Property | Standard ElGamal | Exponential ElGamal | Paillier Cryptosystem (Used in AegisVote) |
| :--- | :--- | :--- | :--- |
| **Homomorphic Type** | **Multiplicatively Homomorphic** | **Additively Homomorphic** | **Natively Additively Homomorphic** |
| **Equation** | $\mathcal{E}(m_1) \cdot \mathcal{E}(m_2) = \mathcal{E}(m_1 \cdot m_2)$ | $\mathcal{E}(m_1) \cdot \mathcal{E}(m_2) = \mathcal{E}(m_1 + m_2)$ | $\mathcal{E}(m_1) \cdot \mathcal{E}(m_2) = \mathcal{E}(m_1 + m_2)$ |
| **Tally Decryption** | Reveals product $m_1 \times m_2$ (useless for counting votes) | Decrypts to $g^{\sum m}$. **Must solve Discrete Logarithm!** | Decrypts directly to integer sum $\sum m$ in **$\mathcal{O}(1)$ time**! |
| **Computation Bottleneck** | Fast | **Extremely slow for large populations**: Solving $g^M = \text{result}$ requires Baby-Step Giant-Step ($\mathcal{O}(\sqrt{M})$). | **Zero discrete log search required**: Uses $L(u) = (u-1)/n$ linear division. |
| **Primary Industry Use** | Mix-net shuffling (Helios Voting) | Small-scale toy voting | **Large-scale additive tallying (AegisVote)** |

#### In Plain English:
- **Standard ElGamal** multiplies numbers. If Poorna votes 1 and Vikas votes 1, ElGamal gives $1 \times 1 = 1$. That does NOT count votes!
- **Exponential ElGamal** can add votes, but when you decrypt the final result, you don't get the number `2`—you get $g^2$. To find the real vote count with 100,000 voters, the server has to guess and brute-force the discrete logarithm: *"Is it $g^1$? $g^2$? $g^3$ ... $g^{100000}$?"* This is computationally expensive.
- **Paillier** solves this natively! It is designed from the ground up so that multiplying ciphertexts adds the underlying integers, and decrypting reveals the exact count immediately in milliseconds without solving any discrete logarithm.

---

## Step 4: The Honesty Test (Zero-Knowledge 1-of-K Proof)

### 💡 Simple Explanation:
What if a malicious voter tries to hack the system by encrypting `[0, 100, 0, 0]` to give their candidate 100 votes?  
The system demands a **Zero-Knowledge Proof (ZKP)**:  
*"Prove to us that exactly one slot has a 1 and the other slots have 0, without telling us which one is 1!"*

### ⚙️ Deep Technical Details:
- **Algorithm**: Non-Interactive Zero-Knowledge (NIZK) Chaum-Pedersen / Fiat-Shamir transformation.
- The voter generates commitments to each bit $v_k$ and proves the linear relation:
  $$\sum_{k=0}^{3} v_k = 1 \quad \text{and} \quad v_k \in \{0, 1\} \quad \forall k$$
- The consortium verifier checks this mathematical proof in under **5 milliseconds**. If someone tries to cheat with 100 votes, the proof fails and the ballot is immediately thrown out.

---

## Step 5: The Anti-Double-Voting Fingerprint (Deterministic Nullifier)

### 💡 Simple Explanation:
How do we stop Poorna from voting again 5 minutes later?  
We cannot track his name (that would destroy privacy). Instead, his secret $sk_v$ produces a unique **Nullifier** that acts like a single-use voting stamp.

### ⚙️ Deep Technical Details:
$$\mathcal{NF} = \text{SHA256}(\text{"AEGIS-NULLIFIER:"} \mathbin{\Vert} \text{election-pesce-2026} \mathbin{\Vert} sk_v)$$

1. **Deterministic**: If Poorna votes once, $\mathcal{NF} = \text{"d81f88a2..."}$.
2. If Poorna tries to vote again, his computer produces the **exact same** $\mathcal{NF}$.
3. The blockchain checks: *"Have we seen `d81f88a2...` before?"*
   - First time: **Accepted**.
   - Second time: **REJECTED with `Double-Voting Attempt Intercepted`**.
4. **Zero Linkability**: Nobody can reverse $\mathcal{NF}$ to find Poorna's name or USN.

---

## Step 6: Consortium Consensus (Hyperledger Fabric 2-of-3 Endorsement)

### 💡 Simple Explanation:
In traditional elections, one central database admin could silently delete votes.  
In AegisVote, **3 independent organizations** run the network together. For a ballot to be accepted, at least **2 out of the 3** must verify and sign it.

```
       [Poorna's Ballot Payload]
                   │
      ┌────────────┼────────────┐
      ▼            ▼            ▼
  [Org 1: EC]  [Org 2: Cyber]  [Org 3: NGO]
   Endorsed!    Endorsed!       Endorsed!
      └────────────┬────────────┘
                   │
      (2-of-3 Endorsement Policy MET)
                   │
                   ▼
     [Committed to Blockchain Ledger]
```

### ⚙️ Deep Technical Details: Hyperledger Fabric Architecture

Many people ask: *"Why did you use Hyperledger Fabric instead of public blockchains like Ethereum or Solana?"*

| Metric | Public Blockchains (Ethereum / Polygon) | Hyperledger Fabric (Used in AegisVote) |
| :--- | :--- | :--- |
| **Transaction Fees (Gas)** | Voters must pay crypto gas (\$0.50 – \$15.00/vote) | **₹0 (Zero Gas Fees)** — permissioned consortium model |
| **Throughput & Speed** | 15–30 TPS, probabilistic finality (minutes) | **2,000+ TPS**, deterministic 1-second finality |
| **Consensus Model** | Proof-of-Stake / Proof-of-Work (wasteful mining) | **Raft Consensus** (Crash Fault Tolerant cluster) |
| **Data Privacy** | Everything is public on Etherscan | **Private Permissioned Channels** with Membership Service Providers (MSP) |
| **Vulnerability to Attacks** | Miners can front-run / censor transactions (MEV) | Endorsement policies guarantee multi-org agreement |

#### The 3-Phase Fabric Transaction Lifecycle (Execute -> Order -> Validate):

```
 1. PROPOSE & EXECUTE          2. ORDER (RAFT)               3. VALIDATE & COMMIT
┌─────────────────────┐     ┌─────────────────────┐     ┌────────────────────────┐
│ Voter submits       │     │ Raft Ordering Node  │     │ Each Peer verifies:    │
│ ballot to Endorsing │────>│ sequences endorsed  │────>│ • 2-of-3 signatures    │
│ Peers (Org 1, 2, 3) │     │ transactions into a │     │ • No nullifier conflict│
│ Peers simulate in Go│     │ cryptographic block │     │ Appends block to log & │
│ chaincode & sign    │     │ (Block #1)          │     │ updates CouchDB State  │
└─────────────────────┘     └─────────────────────┘     └────────────────────────┘
```

1. **Phase 1: Simulation & Endorsement (Execute)**:
   - Poorna's ballot is sent as a `Transaction Proposal` to the endorsing peer nodes:
     - `peer0.org1.ec.gov` (Election Commission)
     - `peer0.org2.observer.org` (Electoral Oversight)
     - `peer0.org3.civilsociety.ngo` (Civil Watchdog)
   - Each peer independently executes the Go smart contract (`voting_contract.go`):
     ```go
     // Real chaincode execution from blockchain/chaincode/voting/voting_contract.go
     nullifierKey := fmt.Sprintf("NULLIFIER_%s_%s", electionID, nullifier)
     existingNullifier, err := ctx.GetStub().GetState(nullifierKey)
     if existingNullifier != nil {
         return fmt.Errorf("DOUBLE_VOTING_ERROR: Nullifier %s already recorded", nullifier)
     }
     ```
   - Each peer validates the Zero-Knowledge 1-of-K proof, confirms the nullifier is unspent, and signs an endorsement response containing the **Read-Write (RW) Set**.

2. **Phase 2: Ordering (Consensus via Raft)**:
   - Once Poorna's client collects at least 2 matching endorsements (satisfying the `OutOf(2, 'Org1MSP.peer', 'Org2MSP.peer', 'Org3MSP.peer')` policy), the transaction is submitted to the **Raft Ordering Service** (`orderer.aegis.election:7050`).
   - The Raft cluster acts as a decentralized sequencer, packaging validated transactions into immutable blocks.

3. **Phase 3: Validation & Ledger Commit**:
   - The Orderer broadcasts the newly minted block to all peers in the consortium channel.
   - Each peer independently performs **Multi-Version Concurrency Control (MVCC)** validation:
     - Verifies that the nullifier was not spent by another concurrent transaction during ordering.
     - Commits the block to the **Immutable Blockchain File Ledger**.
     - Updates the **CouchDB World State** to atomically record: `NULLIFIER_election-pesce-2026_d81f... = SPENT`.
   - The peer appends the transaction leaf to the **Merkle Tree**, computes the new **Merkle Root Hash**, and fires an event back to the client.

#### The Dual-Store Blockchain Ledger Architecture:
Hyperledger Fabric maintains two distinct storage layers:
- **World State Database (CouchDB)**: Represents the *current snapshot* of the election (e.g., fast $O(1)$ lookup to check if a nullifier is spent, or the current ballot count).
- **Blockchain Block Log (Append-Only Filesystem Ledger)**: The *unalterable historical ledger* storing every cryptographic block, hash pointer, endorsement certificate, and Merkle tree root since the genesis block. Even if an attacker modified CouchDB, the blockchain hash chain would immediately detect the tampering and reject it!

---

## Step 7: Cloud Audit Trail & The Voter's Receipt

### 💡 Simple Explanation:
Once the vote is committed, two things happen:
1. The transaction is backed up in the cloud **Supabase** database for public transparency.
2. Poorna's screen displays his **Cryptographic Receipt** with a QR code.

### ⚙️ What Poorna's Receipt Looks Like:
```json
{
  "tx_id": "tx-8f2b719c2a10",
  "election_id": "election-pesce-2026",
  "block_number": 1,
  "nullifier": "d81f88a2e519c724...",
  "merkle_root": "c901fa4b7721e03a...",
  "timestamp": "2026-11-15T12:00:00Z",
  "status": "CONFIRMED_ON_LEDGER"
}
```
> **Notice what is MISSING from the receipt**:  
> The receipt does **NOT** say "Prof. B. Rao". It contains only mathematical hashes. This makes **voter coercion or vote buying impossible**—if someone tries to bribe Poorna, Poorna cannot prove to them who he voted for!

---

## Step 8: The Magic Count (Homomorphic Tallying without Decryption)

### 💡 Simple Explanation:
Voting ends. Suppose 3 students voted:
- **Poorna**: Voted for Candidate 1 (`Prof. B. Rao`) $\rightarrow [0, 1, 0, 0]$
- **Vikas**: Voted for Candidate 1 (`Prof. B. Rao`) $\rightarrow [0, 1, 0, 0]$
- **Darshan**: Voted for Candidate 0 (`Dr. A. Sharma`) $\rightarrow [1, 0, 0, 0]$

Normally, a human or database would open each envelope.  
**In AegisVote, the envelopes are NEVER opened!**  
Instead, the blockchain **multiplies the encrypted numbers together**.

### ⚙️ The Mathematics:
Remember Paillier's rule: $\mathcal{E}(a) \cdot \mathcal{E}(b) = \mathcal{E}(a + b)$.

For Candidate 0 (Dr. A. Sharma):
$$C_{\text{total}}[0] = c_{\text{Poorna}}[0] \cdot c_{\text{Vikas}}[0] \cdot c_{\text{Darshan}}[0] = \mathcal{E}(0 + 0 + 1) = \mathcal{E}(1)$$

For Candidate 1 (Prof. B. Rao):
$$C_{\text{total}}[1] = c_{\text{Poorna}}[1] \cdot c_{\text{Vikas}}[1] \cdot c_{\text{Darshan}}[1] = \mathcal{E}(1 + 1 + 0) = \mathcal{E}(2)$$

For Candidate 2 (Ms. C. Patel):
$$C_{\text{total}}[2] = \mathcal{E}(0 + 0 + 0) = \mathcal{E}(0)$$

For Candidate 3 (NOTA):
$$C_{\text{total}}[3] = \mathcal{E}(0 + 0 + 0) = \mathcal{E}(0)$$

**The result is an encrypted total**: $[\mathcal{E}(1), \mathcal{E}(2), \mathcal{E}(0), \mathcal{E}(0)]$.  
Nobody has decrypted a single voter's ballot!

---

## Step 9: The Threshold Ceremony (Unlocking the Result Together)

### 💡 Simple Explanation:
Who holds the key to unlock the final total $[\mathcal{E}(1), \mathcal{E}(2), \mathcal{E}(0), \mathcal{E}(0)]$?  
**No single person!**  
The master key was sliced into 3 pieces like a bank vault that needs 2 keys to open.

```
       [Encrypted Sum: E(1), E(2), E(0), E(0)]
                          │
             ┌────────────┴────────────┐
             ▼                         ▼
      [Trustee 1: EC]           [Trustee 2: Cyber]
   Submits Key Share s_1     Submits Key Share s_2
             └────────────┬────────────┘
                          │
              (Lagrange Reconstruction)
                          │
                          ▼
            [Dr. A. Sharma: 1 Vote]
            [Prof. B. Rao:  2 Votes] 🏆 WINNER
            [Ms. C. Patel:  0 Votes]
            [NOTA:          0 Votes]
```

### ⚙️ Deep Technical Details:
- **Algorithm**: Shamir's Secret Sharing over polynomial $f(x) = S + a_1 x \pmod{\lambda}$.
- Trustee 1 computes partial decryption using share $s_1 = f(1)$.
- Trustee 2 computes partial decryption using share $s_2 = f(2)$.
- The Threshold Coordinator combines both shares using **Lagrange Interpolation**:
  $$S = s_1 \cdot \left(\frac{0 - 2}{1 - 2}\right) + s_2 \cdot \left(\frac{0 - 1}{2 - 1}\right) \pmod{\lambda}$$
- The master exponent is reconstructed, revealing the exact integer counts without ever having possessed the private key during voting!

---

## Step 10: Universal Public Verifier (Anyone Can Audit)

### 💡 Simple Explanation:
How does Poorna know the election wasn't rigged?  
He opens the **Universal Verifier** (`/verifier`) in his browser and pastes his receipt nullifier `d81f88a2...`.

### ⚙️ What the Verifier Proves:
1. **Merkle Inclusion Proof**:
   - The verifier fetches the sibling hash path from the public blockchain bulletin board.
   - It hashes Poorna's receipt with the sibling hashes up to the root:
     $$\text{Hash}(\text{Hash}(\text{Poorna's Leaf}, H_1), H_2) \stackrel{?}{=} \text{Published Merkle Root}$$
   - The result matches! Poorna gets a green **"Verified Included in Ledger"** checkmark.
2. **Homomorphic Proof**:
   - Auditors verify that the encrypted total equals the mathematical product of all published ballot ciphertexts on the bulletin board.
   - Result: **100% mathematical certainty that every valid vote was counted correctly.**

---

# 🎓 Quick Examiner & Viva Cheat Sheet

When presenting this project, professors or evaluators may ask these questions:

| Question Asked | The Perfect Technical Answer |
| :--- | :--- |
| **"Where are the votes stored?"** | "Encrypted ciphertexts are stored on the **Hyperledger Fabric** blockchain ledger as immutable transaction leaves, and mirrored to **Supabase Postgres** for fast indexing and public bulletin auditing." |
| **"Can the database admin read my vote?"** | "No. All database rows contain only Paillier ciphertexts $c = g^m \cdot r^n \pmod{n^2}$. Decrypting requires 2-of-3 consortium authorities to cooperate." |
| **"What prevents someone from voting twice?"** | "The **Credential-Bound Deterministic Nullifier** $\mathcal{NF} = \text{SHA256}(\text{Domain} \mathbin{\Vert} \text{ElectionID} \mathbin{\Vert} sk_v)$. If a voter submits a second ballot, the exact same nullifier is produced, and chaincode consensus rejects it immediately." |
| **"What if a hacker submits a vote count of 999?"** | "The browser must attach a **Non-Interactive Zero-Knowledge (NIZK) 1-of-K selection proof**. The peers verify that $\sum v_k = 1$ and each $v_k \in \{0, 1\}$. Any tampering causes instant rejection." |
| **"What if one trustee's server gets hacked?"** | "The system uses a **2-of-3 Shamir Threshold Scheme**. A single compromised trustee holds only a partial key share $s_1$, which is mathematically useless for decrypting votes." |

---

*Authored by the AegisVote Engineering Team | PESCE Mandya (2026–27)*  
*Poorna Chandra DH • Vikas B • Darshan C • Karthik S*
