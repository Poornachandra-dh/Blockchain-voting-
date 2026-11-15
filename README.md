# AegisVote: Enterprise Privacy-Preserving Blockchain E-Voting Infrastructure

> **Institutional-Grade, Zero-Knowledge, Homomorphic E-Voting Architecture on Hyperledger Fabric with Multi-Organization Consensus & CouchDB World State.**  
> Built for the Final Year Engineering Project (2026–27) | Department of Information Science & Engineering, P.E.S. College of Engineering, Mandya.

---

## 👥 Academic & Engineering Credits

- **Institution**: P.E.S. College of Engineering (PESCE), Mandya – 571401  
- **Department**: Department of Information Science & Engineering  
- **Faculty Project Guide**: **Dr. Rakshith N**, Associate Professor, Dept. of IS&E, PESCE Mandya  
- **Student Development Team**:
  1. **Poorna Chandra DH** (USN: `4PS23IS039`) — *Lead Cryptographic Architect & Core Backend*
  2. **Vikas B** (USN: `4PS23IS064`) — *Smart Contracts & Hyperledger Consensus Lead*
  3. **Darshan C** (USN: `4PS23IS007`) — *Cloud Infrastructure & Persistence Lead*
  4. **Karthik S** (USN: `4PS23IS027`) — *Enterprise Frontend & UI/UX Systems*

---

## 🏛️ Executive Summary & The E-Voting Trilemma

Remote electronic elections have historically suffered from the fundamental **E-Voting Trilemma**:
1. **Unconditional Ballot Secrecy**: No party (not even the election commission, government, cloud provider, or system administrator) can tie a cast ballot back to a voter's real-world identity.
2. **Individual Verifiability**: A voter can mathematically verify that their ballot was cast as intended and immutably recorded on the ledger (*"Cast as intended, recorded as cast"*).
3. **Universal Verifiability**: Any third-party auditor, journalist, or public observer can verify that the final tally equals the exact sum of all valid ballots without decrypting any individual ballot (*"Tallied as recorded"*).

### How AegisVote Solves the Trilemma:
- **Zero Exposure via Paillier Homomorphism**: Ballots are encrypted client-side using Paillier additive homomorphic encryption. The tally is computed homomorphically by multiplying ciphertexts together—individual votes are **never decrypted**.
- **No Single Point of Failure (SPoF)**: Employs a **2-of-3 Threshold Decryption Ceremony** split across 3 sovereign consortium trustees:
  - **Trustee 1**: Election Commission of India / PESCE EC (`Org1MSP`)
  - **Trustee 2**: Independent Electoral Oversight / Cyber Cell (`Org2MSP`)
  - **Trustee 3**: Public Civil Watchdog NGO (`Org3MSP`)
- **Sybil & Double-Voting Immunity**: Enforces **Credential-Bound Deterministic Nullifiers** ($NF = \text{HMAC-SHA256}(sk_v, \text{"NULLIFIER:"} \mathbin{\Vert} \text{election\_id})$) with zero-knowledge binding proofs.
- **Client-Side Proofs**: Non-Interactive Zero-Knowledge (NIZK) proofs demonstrate ballots satisfy 1-of-K selection constraints without revealing the chosen candidate.
- **Live Multi-Org Hyperledger Fabric Consortium**: A 3-organization Dockerized Fabric network with Raft ordering, per-peer CouchDB world state databases, and 2-of-3 endorsement policies.

---

## 🏗️ In-Depth System Architecture

AegisVote is engineered as a **7-tier sovereign enterprise system** spanning browser cryptography, asynchronous application gateways, Byzantine-resilient permissioned blockchain consensus, smart contract microservices, dual-store persistence, threshold cryptographic ceremonies, and universal audit verifiers.

```mermaid
flowchart TD
    subgraph Tier1["Tier 1: Client Edge & Cryptographic Co-Processor (Browser WebCrypto / WASM)"]
        direction TB
        T1_Auth["1. Institutional Auth (NIST SP 800-63-3)"]
        T1_Keys["2. Generate Secret Key sk_v & Blinding Salt r"]
        T1_Comm["3. Identity Commitment: C_id = SHA256(sk_v || r)"]
        T1_Cred["4. Certified Anonymous Voting Credential (Blind Sig)"]
        T1_Vec["5. One-Hot Vector: v = [0, 1, 0, 0] (Sum = 1)"]
        T1_Enc["6. Paillier Encryption: c_k = g^(v_k) * r_k^n mod n^2"]
        T1_ZKP["7. Generate NIZK 1-of-K Proof (Fiat-Shamir)"]
        T1_NF["8. Nullifier: NF = HMAC-SHA256(sk_v, election_id)"]
        T1_Auth --> T1_Keys --> T1_Comm --> T1_Cred --> T1_Vec --> T1_Enc --> T1_ZKP --> T1_NF
    end

    subgraph Tier2["Tier 2: Asynchronous API Gateway & Fabric Gateway Dispatcher (FastAPI :8000)"]
        direction TB
        T2_Route["REST Ingestion & Pre-Flight Validation"]
        T2_Pool["gRPC Connection Pool & TLS Dispatcher"]
        T2_Endorse["Endorsement Aggregator (2-of-3 Threshold)"]
        T2_Broadcast["Raft Orderer Broadcast Envelope Client"]
        T2_Merkle["Merkle Tree Indexer & Inclusion Proof Generator"]
        T2_Route --> T2_Pool --> T2_Endorse --> T2_Broadcast --> T2_Merkle
    end

    subgraph Tier3["Tier 3: Distributed Ledger & Consensus Tier (Hyperledger Fabric v2.5 / v3.0)"]
        direction TB
        T3_Channel["Consortium Channel: votingchannel"]
        T3_Orderer["Raft Consensus Orderer: orderer.aegis.election:7050 (Batch: 2s, 10 txs)"]
        subgraph Peers["Endorsing & Committing Peer Nodes"]
            T3_Org1["Org 1: peer0.org1.ec.gov:7051 (Election Commission - Org1MSP)"]
            T3_Org2["Org 2: peer0.org2.observer.org:8051 (Party Observer - Org2MSP)"]
            T3_Org3["Org 3: peer0.org3.civilsociety.ngo:9051 (Civil Society - Org3MSP)"]
        end
        T3_Policy["Endorsement Policy: OutOf(2, 'Org1MSP.member', 'Org2MSP.member', 'Org3MSP.member')"]
        T3_Orderer --> T3_Channel
        T3_Channel --> T3_Org1 & T3_Org2 & T3_Org3
        T3_Org1 & T3_Org2 & T3_Org3 --- T3_Policy
    end

    subgraph Tier4["Tier 4: Smart Contract Microservices (Go Chaincode voting_cc v1.0)"]
        direction TB
        T4_Atomic["Atomic Execution & MVCC Conflict Guard"]
        T4_NullCheck{"Nullifier Check: Exists(NF)?"}
        T4_Reject["REJECT: Double Voting Detected"]
        T4_ZKPCheck{"ZKP 1-of-K Verification"}
        T4_Tamper["REJECT: Invalid Vector / Tampering"]
        T4_Commit["WRITE: Set NULLIFIER_<NF>=SPENT & BALLOT_<TxID>=Ciphertext"]
        T4_Atomic --> T4_NullCheck
        T4_NullCheck -->|Yes - Duplicate| T4_Reject
        T4_NullCheck -->|No - Fresh| T4_ZKPCheck
        T4_ZKPCheck -->|Failed| T4_Tamper
        T4_ZKPCheck -->|Valid| T4_Commit
    end

    subgraph Tier5["Tier 5: Dual-Store Persistence & Ledger State Architecture"]
        direction TB
        T5_Blocks["Block Store (LevelDB): Append-Only Cryptographic Block Sequence"]
        subgraph CouchDBs["Distributed World State Databases"]
            T5_CDB0["couchdb0:5984 (Org 1 Replicated State)"]
            T5_CDB1["couchdb1:6984 (Org 2 Replicated State)"]
            T5_CDB2["couchdb2:7984 (Org 3 Replicated State)"]
        end
        T5_Blocks --- CouchDBs
    end

    subgraph Tier6["Tier 6: Homomorphic Tally & Threshold Decryption Ceremony"]
        direction TB
        T6_Hom["Homomorphic Aggregation: C_agg[k] = Prod(c_i,k) mod n^2 = E(Sum v_i,k)"]
        T6_Share1["Trustee 1 Partial Share: S_1 = C_agg^(2*Delta*s_1) mod n^2"]
        T6_Share2["Trustee 2 Partial Share: S_2 = C_agg^(2*Delta*s_2) mod n^2"]
        T6_Lagrange["Lagrange Polynomial Interpolation: Recover Plaintext Totals"]
        T6_Cert["Certified Outcome & Official Election Results (Zero Vote Decryption)"]
        T6_Hom --> T6_Share1 & T6_Share2 --> T6_Lagrange --> T6_Cert
    end

    subgraph Tier7["Tier 7: Universal Verifier & Independent 3-Authority Audit"]
        direction TB
        T7_Ind["Individual Verifier: Cryptographic Merkle Path (Receipt Leaf -> Block Root)"]
        T7_Univ["Universal Verifier: 6-Point Automated Consortium Audit"]
        T7_Report["Cryptographically Signed Audit Certificates (EC + Observer + NGO)"]
        T7_Ind --- T7_Univ --> T7_Report
    end

    Tier1 -->|POST /ballot/cast (TLS)| Tier2
    Tier2 -->|Proposal Simulation gRPC| Tier3
    Tier3 -->|Execute Go Contract| Tier4
    Tier4 -->|Write R/W Set| Tier5
    Tier5 -->|Query Accepted Ciphertexts| Tier6
    Tier5 & Tier6 -->|Audit Ingestion| Tier7
```

---

### 🔄 End-to-End Cryptographic & Ledger Transaction Flow

The sequence diagram below details every cryptographic operation and network transaction from the moment a voter clicks "Seal & Cast Ballot" to block finality, receipt generation, homomorphic tallying, and independent audit:

```mermaid
sequenceDiagram
    autonumber
    actor Voter as Voter (Browser)
    participant Edge as WebCrypto Co-Processor
    participant API as FastAPI Gateway (:8000)
    participant Peer1 as Org1 Peer (EC :7051)
    participant Peer2 as Org2 Peer (Observer :8051)
    participant Peer3 as Org3 Peer (NGO :9051)
    participant Orderer as Raft Orderer (:7050)
    participant CouchDB as CouchDB World State (:5984)
    actor Auditor as Independent Auditor

    Note over Voter,Edge: STAGE 1: Client-Side Preparation & Encryption
    Voter->>Edge: Select Candidate k (e.g., k=2)
    Edge->>Edge: Encode One-Hot Vector: v = [0, 1, 0, 0]
    Edge->>Edge: Paillier Encrypt: c_k = g^(v_k) * r_k^n mod n^2
    Edge->>Edge: Compute NIZK 1-of-K Proof (CDS94 + Fiat-Shamir)
    Edge->>Edge: Compute Deterministic Nullifier: NF = HMAC-SHA256(sk_v, election_id)
    Edge-->>Voter: Sealed Ballot Proposal Payload

    Note over Voter,API: STAGE 2: Ballot Submission & Dispatch
    Voter->>API: POST /api/v1/ballots/cast {election_id, NF, ciphertexts, ZKP, credential}
    API->>API: Validate Request Schema & Ephemeral Token

    Note over API,Peer3: STAGE 3: Consortium 2-of-3 Endorsement Simulation
    par Dispatch Proposal to Endorsers
        API->>Peer1: ProcessProposal(votingchannel, voting_cc, CastBallot)
        API->>Peer2: ProcessProposal(votingchannel, voting_cc, CastBallot)
        API->>Peer3: ProcessProposal(votingchannel, voting_cc, CastBallot)
    end
    Note over Peer1,Peer3: Each Peer Executes voting_contract.go in Docker Container
    Peer1->>Peer1: Verify: Nullifier NF is UNSPENT & ZKP is Valid
    Peer2->>Peer2: Verify: Nullifier NF is UNSPENT & ZKP is Valid
    Peer3->>Peer3: Verify: Nullifier NF is UNSPENT & ZKP is Valid
    Peer1-->>API: ProposalResponse (Endorsement Signature 1)
    Peer2-->>API: ProposalResponse (Endorsement Signature 2)
    Peer3-->>API: ProposalResponse (Endorsement Signature 3)

    Note over API,Orderer: STAGE 4: Consensus & Block Sequencing
    API->>API: Assemble Transaction Envelope (Payload + Endorsements >= 2-of-3)
    API->>Orderer: Broadcast(TransactionEnvelope)
    Orderer->>Orderer: Order Envelope into Raft Log & Cut Block
    Orderer-->>Peer1: Deliver(Block N)
    Orderer-->>Peer2: Deliver(Block N)
    Orderer-->>Peer3: Deliver(Block N)

    Note over Peer1,CouchDB: STAGE 5: Validation & World State Commit
    Peer1->>Peer1: Validate MVCC & Check Policy (2-of-3 satisfied)
    Peer1->>CouchDB: Commit Key: NULLIFIER_<election_id>_<NF> = "SPENT"
    Peer1->>CouchDB: Commit Key: BALLOT_<election_id>_<TxID> = {ciphertexts, NF, time}
    Peer1->>Peer1: Append Block N to LevelDB Ledger Chain

    Note over API,Voter: STAGE 6: Receipt & Merkle Proof Issuance
    API->>API: Calculate Merkle Inclusion Path (Leaf TxID -> Block Root)
    API-->>Voter: 200 OK + BallotReceipt {tx_id, NF, block_num, merkle_proof, timestamp}

    Note over Voter,Auditor: STAGE 7: Universal Verifiability & Tally Ceremony
    Auditor->>API: POST /api/v1/consortium/tally
    API->>CouchDB: Query all BALLOT_* ciphertexts
    API->>API: Homomorphic Sum: C_agg[k] = Prod(c_i,k) mod n^2
    API->>Peer1: Request Decryption Share 1
    API->>Peer2: Request Decryption Share 2
    Peer1-->>API: Share S1 = C_agg^(2*Delta*s1) mod n^2
    Peer2-->>API: Share S2 = C_agg^(2*Delta*s2) mod n^2
    API->>API: Lagrange Reconstruction: Recover Tally Vector [T_1, T_2, ..., T_K]
    API-->>Auditor: Certified Tally Results (Zero Individual Ballots Decrypted!)
    Auditor->>API: GET /api/v1/audit/verify-consortium (Run 6-Point Audit)
    API-->>Auditor: Audit Verdict: PASSED (Org 1, Org 2, Org 3 cryptographically signed)
```

---

### 🔬 Deep Technical Breakdown of the 7 Tiers

#### Tier 1: Client Edge & Cryptographic Co-Processor
- **Host**: Voter Web Browser (Chrome, Safari, Firefox, Edge).
- **Core Engine**: HTML5 WebCrypto API, SubtleCrypto, and WebAssembly (WASM).
- **Cryptographic Operations**:
  1. **Key Generation**: Generates an ephemeral voter secret key $sk_v \xleftarrow{\$} \mathbb{Z}_q$ and cryptographic blinding salt $r \xleftarrow{\$} \{0,1\}^{256}$ using standard CSPRNG (`crypto.getRandomValues`).
  2. **Identity Commitment**: Derives the identity commitment:
     $$C_{\text{id}} = \text{SHA256}(\text{"COMMITMENT:"} \mathbin{\Vert} sk_v \mathbin{\Vert} r)$$
  3. **Certified Voting Credential**: The institutional Identity Provider (IdP) verifies the voter against the official PESCE electoral roll under **NIST SP 800-63-3 (AAL2/IAL2)** standards. The IdP signs $C_{\text{id}}$ using an RSA/ECDSA blind signature scheme. The IdP logs that the voter was issued a credential, but never sees $sk_v$.
  4. **Selection Vector Encoding**: For $K$ candidates, the voter's choice $k \in \{1, \dots, K\}$ is encoded into an orthogonal one-hot vector:
     $$\mathbf{v} = [v_1, v_2, \dots, v_K] \in \{0, 1\}^K \quad \text{such that} \quad \sum_{j=1}^K v_j = 1$$
  5. **Paillier Homomorphic Encryption**: Each element $v_j$ is individually encrypted under the consortium's joint Paillier public key $(n, g)$:
     $$c_j = g^{v_j} \cdot r_j^n \pmod{n^2}, \quad r_j \xleftarrow{\$} \mathbb{Z}_n^*$$
  6. **Zero-Knowledge Validity Proof (NIZK)**: Using a non-interactive disjunctive Chaum-Pedersen $\Sigma$-protocol (CDS94) converted via the Fiat-Shamir heuristic, the client produces a proof $\pi_{\text{valid}}$ establishing:
     $$\forall j \in \{1, \dots, K\}, \; v_j \in \{0, 1\} \quad \land \quad \sum_{j=1}^K v_j = 1$$
     *This mathematically proves the ballot is legitimate without disclosing which candidate was chosen!*
  7. **Deterministic Nullifier**: Derives the credential-bound nullifier:
     $$\text{NF} = \text{HMAC-SHA256}(sk_v, \text{"NULLIFIER:"} \mathbin{\Vert} \text{election\_id})$$
     Because $sk_v$ is fixed per voter and the election ID is constant, $\text{NF}$ is deterministic per election.

---

#### Tier 2: Asynchronous API Gateway & Fabric Gateway Dispatcher
- **Host**: Python 3.9+ / FastAPI / Uvicorn running on `127.0.0.1:8000`.
- **Role**: Bridge between untrusted HTTP/REST web clients and the permissioned gRPC Hyperledger Fabric consortium.
- **Architectural Responsibilities**:
  1. **Pre-Flight Validation**: Enforces Pydantic v2 data models, validating ciphertext bit-lengths, nullifier formats, and payload signatures before touching the blockchain.
  2. **Concurrent gRPC Connection Pool**: Maintains mutual TLS (mTLS) gRPC sessions to all three endorsing peers (`peer0.org1`, `peer0.org2`, `peer0.org3`).
  3. **Endorsement Assembler**: Dispatches `ChaincodeProposal` payloads in parallel, verifies peer response signatures, and aggregates endorsements to satisfy the 2-of-3 endorsement policy.
  4. **Orderer Envelope Broadcaster**: Encapsulates proposal payloads and endorsement signatures into an official Fabric `TransactionEnvelope` and streams it to the Raft Orderer.
  5. **Merkle Receipt Engine**: Queries the peer's block sequence, extracts the transaction index within the block, computes the SHA-256 Merkle inclusion path, and returns a certified receipt to the client.

---

#### Tier 3: Distributed Ledger & Consensus Tier (Hyperledger Fabric v2.5 / v3.0)
- **Host**: Docker Network `blockchain_aegis-net` on bridge subnet `172.25.0.0/16`.
- **Consensus**: Raft (Crash Fault Tolerant leader-follower consensus cluster).
- **Consortium Topology**:
  - **`orderer.aegis.election`** (`OrdererMSP`, port `7050`): Sequences transactions into immutable blocks.
    - `BatchTimeout`: `2s`
    - `MaxMessageCount`: `10 transactions`
    - `AbsoluteMaxBytes`: `99 MB`
  - **`peer0.org1.ec.gov`** (`Org1MSP`, port `7051`): PESCE Election Commission sovereign node.
  - **`peer0.org2.observer.org`** (`Org2MSP`, port `8051`): Independent Electoral Watchdog / Cyber Cell node.
  - **`peer0.org3.civilsociety.ngo`** (`Org3MSP`, port `9051`): Civil Society NGO / Media Consortium node.
- **Channel Architecture**: `votingchannel` connects all three organizations with isolated ledger state and MSP identity controls.
- **Endorsement Policy Rule**:
  $$\text{OutOf}(2, \text{'Org1MSP.member'}, \text{'Org2MSP.member'}, \text{'Org3MSP.member'})$$
  *No single authority (not even the Election Commission) can unilaterally append transactions or alter the ballot roll.*

---

#### Tier 4: Smart Contract Microservices (Go Chaincode `voting_cc` v1.0)
- **Runtime**: Isolated Go microservices running in Docker containers (`dev-peer0.*-voting_cc_1.0`).
- **Framework**: `github.com/hyperledger/fabric-contract-api-go v1.2.1`.
- **State Machine & Atomic Invariants**:
  1. **`InitElection(electionId, name, candidates, pubKey, threshold)`**: Initializes election parameters, publishes candidate metadata, and anchors the consortium Paillier public key $(n, g)$.
  2. **`CastBallot(electionId, nullifier, ciphertexts, zkp, credHash)`**:
     - **Nullifier Guard**: Queries the world state for key `NULLIFIER_<electionId>_<nullifier>`. If already present, transaction immediately aborts with `DOUBLE_VOTING_ERROR`.
     - **Zero-Knowledge Verification**: Validates the disjunctive 1-of-K selection proof.
     - **Atomic State Write**: Writes `NULLIFIER_<electionId>_<nullifier> = "SPENT"` and `BALLOT_<electionId>_<txId> = {ciphertexts, nullifier, timestamp}` in a single atomic Read/Write set.
  3. **`CloseVoting(electionId)`**: Transitions election state from `ACTIVE` to `TALLYING`, freezing any further ballot casting.
  4. **`SubmitDecryptionShare(electionId, trusteeId, share)`**: Records threshold decryption shares submitted by consortium authorities.

---

#### Tier 5: Dual-Store Persistence & Ledger State Architecture
Hyperledger Fabric maintains a **dual-store architecture** to ensure both immutable linear auditability and high-speed rich queries:
1. **Block Storage (LevelDB)**:
   - Append-only file-based sequence of cryptographic blocks.
   - Every block contains `BlockNumber`, `PreviousHash`, `DataHash`, and the Merkle root of transactions.
   - Tamper-evident: altering a single byte in block $k$ breaks the hash chain for all subsequent blocks $k+1 \dots N$.
2. **World State (Distributed Apache CouchDB 3.3)**:
   - Dedicated CouchDB container per organization (`couchdb0:5984`, `couchdb1:6984`, `couchdb2:7984`).
   - Stores the latest state of all assets as structured JSON documents.
   - Supports rich Mango declarative queries and multi-index execution.

```mermaid
classDiagram
    class ElectionDocument {
        +string doc_type "ELECTION"
        +string election_id "election-pesce-2026"
        +string name "PESCE 2026 General Election"
        +string status "ACTIVE | TALLYING | COMPLETED"
        +string[] candidates
        +PaillierPubKey public_key
        +int threshold 2
    }

    class BallotDocument {
        +string doc_type "BALLOT"
        +string election_id "election-pesce-2026"
        +string tx_id "8f4a2b91c7e..."
        +string nullifier_hash "e3b0c44..."
        +string[] encrypted_vector ["0x18a...", "0x94f..."]
        +string credential_hash "c792a..."
        +int block_number 4
        +string timestamp "2026-11-15T10:00:00Z"
    }

    class NullifierDocument {
        +string doc_type "NULLIFIER"
        +string election_id "election-pesce-2026"
        +string nullifier "a89f31c..."
        +string status "SPENT"
        +string spent_in_tx "8f4a2b91c7e..."
        +string timestamp "2026-11-15T10:00:00Z"
    }

    class TallyDocument {
        +string doc_type "TALLY"
        +string election_id "election-pesce-2026"
        +string[] encrypted_aggregate_vector
        +map trustee_shares
        +map certified_plaintext_results
        +string completed_at "2026-11-15T18:00:00Z"
    }

    ElectionDocument "1" <-- "*" BallotDocument : contains
    BallotDocument "1" <--> "1" NullifierDocument : bound to
    ElectionDocument "1" <--> "1" TallyDocument : finalized by
```

---

#### Tier 6: Homomorphic Tally & Threshold Decryption Ceremony
- **Zero-Decryption Invariant**: Individual ballots are **NEVER** decrypted. The system leverages the additive homomorphism of the Paillier cryptosystem to sum encrypted vectors:
  $$C_{\text{aggregate}}[k] = \prod_{i=1}^N c_{i, k} \pmod{n^2} = \mathcal{E}\left(\sum_{i=1}^N v_{i, k}\right)$$
- **2-of-3 Threshold Decryption**:
  - The private key $d = \lambda(n)$ is split using Shamir's $(t, m) = (2, 3)$ secret sharing scheme:
    $$f(x) = d + a_1 x \pmod{\lambda}$$
  - Each trustee holds a private evaluation share $s_j = f(j)$:
    - **Trustee 1 (`Org1MSP`)**: $s_1 = f(1)$
    - **Trustee 2 (`Org2MSP`)**: $s_2 = f(2)$
    - **Trustee 3 (`Org3MSP`)**: $s_3 = f(3)$
  - When voting closes, any 2 trustees (e.g., Trustee 1 and Trustee 2) compute partial decryption shares:
    $$S_1 = C_{\text{aggregate}}^{2 \Delta s_1} \pmod{n^2}, \quad S_2 = C_{\text{aggregate}}^{2 \Delta s_2} \pmod{n^2} \quad (\text{where } \Delta = 3! = 6)$$
  - Using Lagrange polynomial interpolation basis coefficients $\ell_1(0)$ and $\ell_2(0)$:
    $$d = \sum_{j \in \{1, 2\}} s_j \cdot \ell_j(0) = s_1 \frac{0 - 2}{1 - 2} + s_2 \frac{0 - 1}{2 - 1} = 2 s_1 - s_2$$
  - Reconstructs the plaintext election total vector $\mathbf{T} = [T_1, T_2, \dots, T_K]$ directly from the aggregate ciphertext without recovering any single voter's ballot!

---

#### Tier 7: Universal Verifier & Independent 3-Authority Audit Engine
- **Individual Verifiability**:
  - Every voter receives an inclusion receipt containing their Transaction ID, Nullifier, and Merkle branch.
  - The voter client calculates:
    $$\text{ComputedRoot} = \text{HashBranch}(H(\text{Ballot}), \text{Siblings})$$
  - Matches $\text{ComputedRoot}$ against the ledger's published block header data hash.
- **Universal Verifiability (6-Point Independent Consortium Audit)**:
  Org 1, Org 2, and Org 3 independently execute an automated 6-point verification suite against their local replicated CouchDB instances:
  1. **Ballot Well-Formedness**: Every ballot vector has valid NIZK proof of 1-of-K selection.
  2. **Nullifier Uniqueness**: All nullifiers in the election partition are strictly unique ($NF_i \neq NF_j$ for all $i \neq j$).
  3. **Ballot Count Parity**: Count of `BALLOT_*` documents equals count of `NULLIFIER_*` documents and matches the Raft block transaction total.
  4. **Blockchain Integrity**: Raft block hash sequence is unbroken from Genesis (`Block 0`) to final block.
  5. **Homomorphic Sum Correctness**: Sum of final candidate totals equals total ballots:
     $$\sum_{k=1}^K T_k = N_{\text{accepted}}$$
  6. **Threshold Tally Consistency**: Recomputed Lagrange interpolation over published trustee shares matches the published tally document.
- **Cryptographic Audit Verdict**: Each authority signs the audit report with its organization's X.509 MSP certificate.

---

## 🔬 Mathematical & Algorithmic Foundations

### 1. Paillier Additive Homomorphic Encryption
Let $n = p \cdot q$ be the RSA modulus, $\lambda = \text{lcm}(p-1, q-1)$, and $g = n + 1$.
- **Encryption**: For message $m \in \{0, 1\}$ and blinding factor $r \in \mathbb{Z}_n^*$:
  $$c = \mathcal{E}(m) = g^m \cdot r^n \pmod{n^2}$$
- **Homomorphic Multiplication Property**:
  $$\mathcal{E}(m_1) \cdot \mathcal{E}(m_2) = (g^{m_1} r_1^n)(g^{m_2} r_2^n) = g^{m_1 + m_2} (r_1 r_2)^n \equiv \mathcal{E}(m_1 + m_2) \pmod{n^2}$$
- **Aggregate Vector Tally**: For $N$ accepted ballots across $K$ candidates:
  $$C_{\text{aggregate}}[k] = \prod_{i=1}^N c_{i, k} \pmod{n^2} = \mathcal{E}\left(\sum_{i=1}^N v_{i, k}\right)$$
  *Decrypting $C_{\text{aggregate}}$ directly yields the final tally without exposing single votes!*

### 2. Credential-Bound Deterministic Nullifier
- To prevent double voting without deanonymizing voters, each voter derives:
  $$\text{NF} = \text{HMAC-SHA256}(sk_v, \text{"NULLIFIER:"} \mathbin{\Vert} \text{election\_id})$$
- Because $sk_v$ is fixed per voter and certified by the credential, exactly one valid nullifier exists per voter per election.
- The smart contract records `NULLIFIER_<election_id>_<NF>` as `SPENT` in the same atomic transaction as the ballot. Any duplicate submission triggers an immediate transaction rejection.

### 3. Hyperledger Fabric Dual-Store Architecture
- **Transaction Lifecycle**: Execute proposal simulation on endorsing peers (`peer0.org1`, `peer0.org2`, `peer0.org3`) $\to$ Verify 2-of-3 endorsement signatures $\to$ Raft Orderer batches into immutable blocks $\to$ Commit to per-peer CouchDB world state.
- **Endorsement Policy**:
  $$\text{Policy} = \text{OutOf}(2, \text{'Org1MSP.member'}, \text{'Org2MSP.member'}, \text{'Org3MSP.member'})$$

---

## 📦 Container Topology & Active Network Nodes

| Container Name | Role | Port | State Store |
| :--- | :--- | :--- | :--- |
| **`orderer.aegis.election`** | **Raft Consensus Orderer** (`OrdererMSP`) | `7050` | Blocks sequenced with Raft finality |
| **`peer0.org1.ec.gov`** | **Org 1: Election Commission Peer** (`Org1MSP`) | `7051` | Endorsing peer |
| **`couchdb0`** | **Org 1 World State Store** | `5984` | Stores `votingchannel_voting_cc` |
| **`peer0.org2.observer.org`** | **Org 2: Party Observer Peer** (`Org2MSP`) | `8051` | Endorsing peer |
| **`couchdb1`** | **Org 2 World State Store** | `6984` | Independent replicate state |
| **`peer0.org3.civilsociety.ngo`**| **Org 3: Civil Society NGO Peer** (`Org3MSP`) | `9051` | Endorsing peer |
| **`couchdb2`** | **Org 3 World State Store** | `7984` | Independent replicate state |
| **`aegis_cli`** | **Consortium CLI & Gateway Client** | N/A | Admin & Chaincode lifecycle |
| **`dev-peer0.*-voting_cc_1.0`** | **Active Smart Contract Microservices** | Internal | Go chaincode runtime containers |

---

## ⚡ Complete Deployment & Execution Guide (Scratch to End)

### Prerequisites Installation (macOS / Linux)
```bash
# 1. Install Docker Desktop, Go, and Node.js (via Homebrew on macOS)
brew install --cask docker
brew install go node python

# 2. Start Docker Desktop and verify:
docker --version && go version && node --version
```

---

### Phase 1: Bootstrap the Hyperledger Fabric Network

#### 1. Generate Certificates & Channel Genesis Artifacts
```bash
./blockchain/network/scripts/generate_artifacts.sh
```
*Generates cryptographic material (`crypto-config`) for all 3 organizations and Raft Orderer, and builds `genesis.block` and `votingchannel.tx`.*

#### 2. Launch the 8 Consortium Docker Containers
```bash
cd blockchain/network
docker compose -f docker-compose-consortium.yaml up -d
cd ../..
```

#### 3. Verify All Nodes are Active
```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

#### 4. Create Channel & Join All 3 Peers
```bash
docker exec aegis_cli /bin/bash /opt/gopath/src/github.com/hyperledger/fabric/peer/scripts/create_and_join_channel.sh
```

#### 5. Package, Install, Approve & Commit Smart Contract (`voting_cc`)
```bash
docker exec aegis_cli /bin/bash /opt/gopath/src/github.com/hyperledger/fabric/peer/scripts/deploy_chaincode.sh
```
*Packages `voting_contract.go`, installs across all 3 peers, approves the 2-of-3 endorsement definition, commits it on `votingchannel`, and initializes the election on the ledger.*

---

### Phase 2: Start the Application Tier

#### One-Click Launch (macOS):
```bash
chmod +x start_mac.sh
./start_mac.sh
```
*Automatically sets up Python virtualenv, installs frontend packages, boots FastAPI on `http://127.0.0.1:8000`, launches Vite on `http://localhost:3000`, and opens your default browser.*

#### Manual Launch (Separate Terminals):
- **Terminal 1 — FastAPI Backend:**
  ```bash
  cd backend
  python3 -m venv venv
  source venv/bin/activate
  pip install -r requirements.txt
  python3 main.py
  ```
  - API Server: `http://127.0.0.1:8000`
  - Interactive Swagger API Documentation: `http://127.0.0.1:8000/docs`

- **Terminal 2 — React / Vite Frontend:**
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
  - Web Application: `http://localhost:3000`

---

## 🗳️ Web Application User Journey (10 Stages)

### 1. Voter Authentication & Credential Issuance
1. Navigate to **`http://localhost:3000`** $\to$ Click **"Voter Portal"**.
2. Sign in using any pre-seeded synthetic test account:
   - `VOTER-001` / `password123` *(Poorna Chandra)*
   - `VOTER-002` / `password123` *(Vikas B)*
   - `VOTER-003` / `password123` *(Darshan C)*
   - `VOTER-004` / `password123` *(Karthik S)*
3. Identity is verified under NIST SP 800-63-3. The browser generates secret $sk_v$ and receives an anonymous voting credential.

### 2. Client-Side Encryption & Casting
1. Select a candidate.
2. Click **"Seal & Cast Encrypted Ballot"**.
3. Browser performs Paillier encryption, generates ZKP 1-of-K validity proof, computes nullifier $NF$, and submits the proposal.
4. Peers endorse, Raft sequences the transaction into a block, and you receive an immutable **Ballot Inclusion Receipt** with the Merkle proof.

### 3. Sybil / Double Voting Defense Demonstration
1. Attempt to cast a second ballot with `VOTER-001`.
2. The transaction is instantly rejected by the smart contract on the blockchain:
   ```
   DOUBLE_VOTING_ERROR: Nullifier has already been recorded on the ledger
   ```

### 4. Consortium Tally Ceremony
1. Go to **"Consortium Console"** (`/consortium`).
2. Click **"Close Voting & Begin Tally Ceremony"**.
3. Ballots are aggregated homomorphically. Trustees 1 and 2 contribute partial decryption shares, and Lagrange reconstruction computes the final totals without decrypting single ballots.

### 5. Universal Verifier & Independent 3-Authority Audit
1. Go to **"Universal Verifier"** (`/verifier`).
2. Enter your receipt Transaction ID to verify your ballot's presence in the Merkle root.
3. Review the 6 independent checks conducted and signed by Org 1, Org 2, and Org 3:
   - Ballot Validity
   - Nullifier Uniqueness
   - Accepted Ballot Count
   - Blockchain Integrity
   - Homomorphic Sum Correctness
   - Tally Consistency

---

## 🔍 Diagnostic & Inspection Commands

Run these from any terminal window on your machine:

- **Query Live Election from Blockchain Ledger**:
  ```bash
  docker exec aegis_cli peer chaincode query -C votingchannel -n voting_cc -c '{"function":"QueryElection","Args":["election-pesce-2026"]}'
  ```

- **Inspect CouchDB World State Database in Browser**:
  Open [http://localhost:5984/_utils](http://localhost:5984/_utils) (User: `admin`, Password: `adminpw`) $\to$ Database: `votingchannel_voting_cc`.

- **Stream Live Peer Logs**:
  ```bash
  docker logs peer0.org1.ec.gov --tail 25
  ```

- **Run Automated Test Suite (13/13 passing tests)**:
  ```bash
  backend/venv/bin/pytest backend/tests/ -v
  ```

---

## 📁 Repository Directory Structure

```
voting-blockchain/
├── backend/
│   ├── app/
│   │   ├── api/routes/          # REST endpoints (auth, ballot, consortium, audit)
│   │   ├── core/                # JWT security, config, and settings
│   │   ├── crypto/              # Paillier, ZKP, and Nullifier algorithms
│   │   ├── models/              # Pydantic data schemas
│   │   └── services/
│   │       ├── fabric_service.py # Live gRPC/CLI gateway to Hyperledger Fabric
│   │       └── voting_service.py # Election lifecycle orchestration
│   ├── tests/                   # 13 automated unit & live integration tests
│   ├── main.py                  # FastAPI application entrypoint
│   └── requirements.txt         # Python dependencies
├── blockchain/
│   ├── chaincode/voting/
│   │   ├── go.mod               # Go module definition
│   │   └── voting_contract.go   # Smart contract (Fabric contract API)
│   └── network/
│       ├── configtx.yaml        # Channel profiles & Consortium definition
│       ├── crypto-config.yaml   # MSP cryptographic topology (3 Orgs + Orderer)
│       ├── docker-compose-consortium.yaml # Docker stack (8 nodes)
│       └── scripts/
│           ├── generate_artifacts.sh      # cryptogen & configtxgen runner
│           ├── create_and_join_channel.sh # Channel genesis and peer joins
│           └── deploy_chaincode.sh        # Chaincode lifecycle deployment
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI cards, tables, modals
│   │   ├── pages/               # Voter Portal, Consortium, Verifier, Chaos Sim
│   │   └── services/            # Client-side Paillier & WebCrypto crypto engine
│   ├── package.json
│   └── vite.config.ts
├── OPERATIONAL_GUIDE.md         # Exhaustive 10-stage handbook with CLI commands
├── start_mac.sh                 # One-click launcher script for macOS
└── README.md                    # Primary institutional and technical documentation
```

---

## 🛡️ Security & Threat Resistance Matrix

| Threat Vector | Attack Scenario | AegisVote Defense Mechanism |
| :--- | :--- | :--- |
| **Double Voting** | Voter submits multiple ballots with different candidates. | Deterministic nullifier $NF$ is identical; chaincode rejects duplicate nullifiers at endorsement. |
| **Ballot Stuffing** | Attacker injects malformed vector like $[100, 0, 0, 0]$. | NIZK 1-of-K selection proof verification fails on endorsing peers prior to ordering. |
| **Rogue Administrator** | Server admin inspects database/ledger to view choices. | All stored votes are Paillier ciphertexts. Reading votes is mathematically impossible without 2-of-3 threshold keys. |
| **Trustee Collusion** | Corrupt trustee attempts unilateral decryption. | 2-of-3 threshold requires at least two sovereign consortium members to compute Lagrange shares. |
| **Coercion / Vote Buying** | Coercer demands proof of vote choice. | Receipt only contains $NF$ and Merkle inclusion proof; zero candidate data is disclosed. |

---

## 🧹 Network Teardown & Clean Reset

- **To Pause Containers**:
  ```bash
  cd blockchain/network && docker compose -f docker-compose-consortium.yaml stop
  ```
- **To Resume Containers**:
  ```bash
  cd blockchain/network && docker compose -f docker-compose-consortium.yaml start
  ```
- **To Completely Reset (Wipe ledger and restart clean)**:
  ```bash
  ./blockchain/network/scripts/generate_artifacts.sh
  cd blockchain/network
  docker compose -f docker-compose-consortium.yaml down -v
  docker compose -f docker-compose-consortium.yaml up -d
  sleep 3
  docker exec aegis_cli /bin/bash /opt/gopath/src/github.com/hyperledger/fabric/peer/scripts/create_and_join_channel.sh
  docker exec aegis_cli /bin/bash /opt/gopath/src/github.com/hyperledger/fabric/peer/scripts/deploy_chaincode.sh
  ```

---

## 📜 Academic References & Bibliography

1. Y.-N. Jung, S.-B. Cho, S.-H. Yun, and H.-J. Seo, *"Anonymous E-Voting on Hyperledger Fabric: Practical Mitigation of the Verification Paradox and Coercion Resistance,"* Applied Sciences, vol. 16, no. 14, p. 6953, 2026.
2. Hyperledger Foundation, *"Hyperledger Fabric Documentation: Architecture, Consensus, and Chaincode Lifecycle,"* 2025.
3. P. Paillier, *"Public-Key Cryptosystems Based on Composite Degree Residuosity Classes,"* in Advances in Cryptology—EUROCRYPT ’99, LNCS 1592, pp. 223–238, 1999.
4. D. Chaum, *"Blind Signatures for Untraceable Payments,"* in Advances in Cryptology—CRYPTO ’82, pp. 199–203, 1983.
5. NIST Special Publication 800-63-3, *"Digital Identity Guidelines: Enrollment, Authentication, and Lifecycle Management,"* 2020.
6. Voluntary Voting System Guidelines (VVSG 2.0), *"End-to-End Verifiable Electronic Voting Systems,"* U.S. Election Assistance Commission, 2021.
