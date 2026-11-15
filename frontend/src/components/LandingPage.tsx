import React from 'react';
import { Shield, Lock, CheckCircle2, ArrowRight, Layers, FileCheck, Users, Server } from 'lucide-react';
import { Election } from '../services/api';

interface LandingPageProps {
  election: Election;
  onNavigate: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ election, onNavigate }) => {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative pt-16 sm:pt-24 pb-20 px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-zinc-300 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          <span>PESCE Institutional Consortium Specification 2026–27</span>
        </div>

        <h1 className="font-display font-bold text-4xl sm:text-6xl lg:text-7xl tracking-tight text-white mb-6 leading-[1.1]">
          Cryptographically Verifiable Institutional Elections.
        </h1>

        <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          AegisVote replaces blind administrative trust with mathematical certainty. Powered by a 3-organization Hyperledger Fabric consortium, credential-bound nullifiers, and Paillier homomorphic tallying.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={() => onNavigate('voting')}
            className="w-full sm:w-auto px-6 py-3 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <span>Access Voting Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('verifier')}
            className="w-full sm:w-auto px-6 py-3 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.08] font-medium text-sm transition-all flex items-center justify-center gap-2"
          >
            <span>Verify Ledger State</span>
          </button>
        </div>

        {/* Live Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#121215]/80 border border-white/[0.06] text-left">
          <div className="p-3">
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">CONSORTIUM PEERS</span>
            <span className="text-xl font-bold font-display text-white mt-1 block">3 / 3 Online</span>
            <span className="text-[11px] font-mono text-emerald-400 mt-0.5 block">PESCE • Audit • NGO</span>
          </div>
          <div className="p-3">
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">BALLOTS COMMITTED</span>
            <span className="text-xl font-bold font-display text-white mt-1 block">{election.accepted_ballot_count}</span>
            <span className="text-[11px] font-mono text-zinc-400 mt-0.5 block">Fabric Ledger Height</span>
          </div>
          <div className="p-3">
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">THRESHOLD POLICY</span>
            <span className="text-xl font-bold font-display text-white mt-1 block">2-of-3 Quorum</span>
            <span className="text-[11px] font-mono text-zinc-400 mt-0.5 block">Shamir Key Ceremony</span>
          </div>
          <div className="p-3">
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">ENCRYPTION SCHEME</span>
            <span className="text-xl font-bold font-display text-white mt-1 block">Paillier-2048</span>
            <span className="text-[11px] font-mono text-zinc-400 mt-0.5 block">Homomorphic Sum</span>
          </div>
        </div>
      </section>

      {/* Enterprise Security Architecture */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-white/[0.06]">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight mb-3">
            Enterprise Cryptographic Guarantees
          </h2>
          <p className="text-sm text-zinc-400">
            Engineered to fulfill all security objectives of National and Institutional Remote Voting Standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-[#121215] border border-white/[0.06] flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-5">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="font-display font-semibold text-base text-white mb-2">
                Ballot Secrecy & Homomorphism
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Votes are encrypted under the consortium public key. The tally is computed as a modular product in ciphertext space—individual votes are never exposed.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.04] text-[11px] font-mono text-zinc-500">
              Paillier Cryptosystem • 2048-bit modulus
            </div>
          </div>

          <div className="p-6 rounded-xl bg-[#121212] border border-white/[0.06] flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5">
                <Shield className="w-4 h-4" />
              </div>
              <h3 className="font-display font-semibold text-base text-white mb-2">
                Credential-Bound Nullifiers
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Prevents double voting without identity correlation. Each authenticated voter generates an immutable cryptographic nullifier committed to the ledger.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.04] text-[11px] font-mono text-zinc-500">
              Poseidon Hash Function • NIZK Proof
            </div>
          </div>

          <div className="p-6 rounded-xl bg-[#121212] border border-white/[0.06] flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5">
                <FileCheck className="w-4 h-4" />
              </div>
              <h3 className="font-display font-semibold text-base text-white mb-2">
                Universal Public Verifiability
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Every committed ballot generates an individual inclusion receipt against the published Merkle tree root. Anyone can audit election integrity independently.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.04] text-[11px] font-mono text-zinc-500">
              Merkle Tree Accumulator • O(log N) Proof
            </div>
          </div>
        </div>
      </section>

      {/* 3-Organization Architecture Highlight */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-white/[0.06]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="font-display font-bold text-2xl text-white tracking-tight">
              3-Organization Consortium Topology
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Zero single points of failure. The election requires consensus across three sovereign institutions.
            </p>
          </div>
          <button
            onClick={() => onNavigate('consortium')}
            className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors self-start md:self-auto"
          >
            <span>View Consortium War Room</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-lg bg-[#121215] border border-white/[0.06]">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">ORG 1 • COMMISSION</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Active</span>
            </div>
            <h3 className="font-display font-semibold text-sm text-white">PESCE University Authority</h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Maintains the student enrollment registry and hosts Primary Raft Orderer Node #1.
            </p>
          </div>

          <div className="p-5 rounded-lg bg-[#121215] border border-white/[0.06]">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">ORG 2 • OVERSIGHT</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Active</span>
            </div>
            <h3 className="font-display font-semibold text-sm text-white">Independent State Auditor</h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Maintains partial decryption key share S_2 and certifies zero-knowledge validity proofs.
            </p>
          </div>

          <div className="p-5 rounded-lg bg-[#121215] border border-white/[0.06]">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">ORG 3 • CIVIL SOCIETY</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Active</span>
            </div>
            <h3 className="font-display font-semibold text-sm text-white">Public Verifier Watchdog</h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Publishes the immutable bulletin board and streams real-time mathematical audit records.
            </p>
          </div>
        </div>
      </section>

      {/* Clean Call to Action */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center border-t border-white/[0.06]">
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight mb-3">
          Experience Democratic Integrity
        </h2>
        <p className="text-sm text-zinc-400 mb-8 max-w-xl mx-auto">
          Cast an encrypted ballot or inspect the public ledger with complete cryptographic proof.
        </p>
        <button
          onClick={() => onNavigate('voting')}
          className="px-6 py-3 rounded-md bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-sm transition-colors inline-flex items-center gap-2 shadow-sm"
        >
          <span>Open Voter Booth</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    </div>
  );
};
