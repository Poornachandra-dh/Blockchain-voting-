const API_BASE = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://127.0.0.1:8000/api/v1'
  : '/api/v1';

export interface Candidate {
  id: number;
  name: string;
  party: string;
  avatar?: string;
}

export interface Election {
  id: string;
  title: string;
  description: string;
  candidates: Candidate[];
  status: 'SETUP' | 'REGISTRATION' | 'VOTING' | 'CLOSED' | 'TALLIED' | 'VERIFIED';
  public_key: { n: string; g: string };
  accepted_ballot_count: number;
  merkle_root: string;
  created_at: string;
}

export interface AnonymousCredential {
  credential_id: string;
  election_id: string;
  identity_commitment: string;
  issuer_org: string;
  authority_signature: string;
  issued_at: string;
  status: string;
}

export interface BallotReceipt {
  tx_id: string;
  election_id: string;
  nullifier: string;
  block_number: number;
  timestamp: string;
  merkle_root: string;
  endorsements: string[];
  inclusion_proof?: Array<{ direction: string; hash: string }>;
}

export interface AuthorityAuditCheck {
  org_id: string;
  ballot_validity_passed: boolean;
  nullifier_uniqueness_passed: boolean;
  accepted_ballot_count_matched: boolean;
  ledger_integrity_verified: boolean;
  zkp_proofs_valid: boolean;
  tally_consistency_confirmed: boolean;
  signature: string;
  timestamp: string;
}

export interface ElectionAuditReport {
  election_id: string;
  election_title: string;
  total_accepted_ballots: number;
  merkle_root: string;
  candidate_results: Array<{
    candidate_id: number;
    name: string;
    party: string;
    votes: number;
    percentage: number;
  }>;
  winner?: string;
  authority_audits: AuthorityAuditCheck[];
  universal_verifiability_status: string;
  audit_notes: string[];
}

export const api = {
  async getElections(): Promise<Election[]> {
    const res = await fetch(`${API_BASE}/elections`);
    if (!res.ok) throw new Error('Failed to fetch elections');
    return res.json();
  },

  async getElection(id: string): Promise<Election> {
    const res = await fetch(`${API_BASE}/elections/${id}`);
    if (!res.ok) throw new Error('Failed to fetch election');
    return res.json();
  },

  async loginVoter(voter_id: string, password: string) {
    const res = await fetch(`${API_BASE}/voters/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voter_id, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Login failed');
    }
    return res.json();
  },

  async requestCredential(voter_id: string, election_id: string, identity_commitment: string): Promise<AnonymousCredential> {
    const res = await fetch(`${API_BASE}/voters/credential`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voter_id, election_id, identity_commitment })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Credential issuance rejected');
    }
    return res.json();
  },

  async submitBallot(ballotData: any): Promise<BallotReceipt> {
    const res = await fetch(`${API_BASE}/ballots/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ballotData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Ballot rejected by chaincode');
    }
    return res.json();
  },

  async getBulletinBoard(election_id: string) {
    const res = await fetch(`${API_BASE}/ballots/${election_id}/bulletin`);
    if (!res.ok) throw new Error('Failed to fetch bulletin board');
    return res.json();
  },

  async executeTally(election_id: string) {
    const res = await fetch(`${API_BASE}/tally/${election_id}/execute`, {
      method: 'POST'
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Tally ceremony failed');
    }
    return res.json();
  },

  async getTally(election_id: string) {
    const res = await fetch(`${API_BASE}/tally/${election_id}/results`);
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    const total = data.total_ballots || 1;
    const candidate_results = (data.results || []).map((r: any) => ({
      candidate_id: r.candidate_id,
      name: r.name,
      party: r.party,
      votes: r.votes,
      percentage: total > 0 ? Math.round((r.votes / total) * 100) : 0
    }));

    let maxVotes = -1;
    let winner = 'NOTA / Tied';
    for (const c of candidate_results) {
      if (c.votes > maxVotes && c.votes > 0) {
        maxVotes = c.votes;
        winner = `${c.name} (${c.party})`;
      }
    }

    return {
      election_id: data.election_id,
      status: data.status,
      total_ballots: data.total_ballots,
      candidate_results,
      winner: maxVotes > 0 ? winner : 'No Votes Cast Yet',
      participating_authorities: ['Org1MSP (PESCE)', 'Org2MSP (Oversight)']
    };
  },

  async runConsortiumAudit(election_id: string): Promise<ElectionAuditReport> {
    const res = await fetch(`${API_BASE}/audit/${election_id}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Consortium audit execution failed');
    }
    return res.json();
  },

  async simulateChaos(election_id: string, attack_type: string) {
    const res = await fetch(`${API_BASE}/chaos/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ election_id, attack_type })
    });
    return res.json();
  },

  async getTelemetry(election_id: string) {
    const res = await fetch(`${API_BASE}/telemetry/${election_id}`);
    return res.json();
  },

  async resetElection(election_id: string): Promise<Election> {
    const res = await fetch(`${API_BASE}/elections/${election_id}/reset`, {
      method: 'POST'
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to reset election cycle');
    }
    return res.json();
  },

  async encryptVector(election_id: string, candidate_index: number): Promise<{ encrypted_vector: any[]; vector: number[] }> {
    const res = await fetch(`${API_BASE}/elections/${election_id}/encrypt-vector?candidate_index=${candidate_index}`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to encrypt ballot vector');
    return res.json();
  },

  async updateElectionStatus(election_id: string, status: string): Promise<Election> {
    const res = await fetch(`${API_BASE}/elections/${election_id}/status?new_status=${status}`, {
      method: 'PATCH'
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to update election status');
    }
    return res.json();
  }
};
