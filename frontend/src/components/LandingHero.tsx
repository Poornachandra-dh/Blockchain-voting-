import React from 'react';
import { sound } from '../services/sound';

interface LandingHeroProps {
  onStartVoting: () => void;
  onVerifyZKP: () => void;
  onOpenConsole: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onStartVoting,
  onVerifyZKP,
  onOpenConsole,
}) => {
  return (
    <div className="w-full">
      {/* HERO SECTION */}
      <section className="relative w-full pt-10 sm:pt-14 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Halftone Dot Radial Aura & Deep Red Vignette */}
        <div className="absolute inset-0 halftone-bg pointer-events-none opacity-80 z-0"></div>
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[550px] bg-[#ff5757]/15 rounded-full blur-[140px] pointer-events-none z-0"></div>

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          {/* Floating Pill Announcement Badge */}
          <div 
            onClick={() => { sound.playClick(); onOpenConsole(); }}
            className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#121318] border border-white/[0.1] shadow-2xl mb-8 group cursor-pointer hover:border-[#ff5757]/50 transition-all"
          >
            <span className="text-[#ff5757] text-[14px]">🔥</span>
            <span className="font-mono text-[11px] tracking-wider uppercase text-white/90 font-medium">
              AEGISVOTE V2.4 — HYPERLEDGER CONSORTIUM IS LIVE
            </span>
            <span className="text-muted text-xs group-hover:translate-x-0.5 transition-transform">→</span>
          </div>

          {/* Massive High-Impact Headline */}
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl md:text-6xl lg:text-[72px] leading-[1.12] sm:leading-[1.08] tracking-[-0.035em] text-white max-w-4xl mb-5 sm:mb-6 px-2">
            Privacy-preserving voting on rails that{' '}
            <span className="text-[#ff5757] underline decoration-[#ff5757]/40 decoration-4 underline-offset-8">
              never fail
            </span>
          </h1>

          {/* Subheadline */}
          <p className="font-body text-base sm:text-lg text-muted max-w-2xl mb-10 leading-relaxed font-normal">
            AegisVote powers institutional onchain elections with zero-knowledge ballot proofs, Paillier homomorphic tallying, and Hyperledger Fabric multi-peer consensus.
          </p>

          {/* Dual CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5 sm:gap-4 w-full sm:w-auto px-4 sm:px-0 mb-12 sm:mb-16">
            <button
              onClick={() => { sound.playClick(); onStartVoting(); }}
              className="px-7 py-3.5 rounded-full bg-[#ff5757] hover:bg-[#ff6d6d] text-white font-medium text-[14px] shadow-[0_0_28px_rgba(255,87,87,0.38)] hover:shadow-[0_0_36px_rgba(255,87,87,0.55)] transition-all flex items-center justify-center gap-2"
            >
              <span>Start voting</span>
              <span className="text-sm">→</span>
            </button>
            <button
              onClick={() => { sound.playClick(); onVerifyZKP(); }}
              className="px-7 py-3.5 rounded-full bg-[#121318] hover:bg-[#181920] text-white font-medium text-[14px] border border-white/[0.1] hover:border-white/[0.2] transition-all flex items-center justify-center gap-2"
            >
              <span>Verify election ZKP</span>
            </button>
          </div>

          {/* Subtle Ecosystem Ticker Strip */}
          <div className="w-full border-t border-b border-white/[0.06] py-4 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-muted font-mono text-[12px]">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff5757]"></span>
              Hyperledger Fabric 2.5
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff5757]"></span>
              Groth16 SNARKs
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff5757]"></span>
              Paillier Cryptosystem
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff5757]"></span>
              Raft Consensus (Crash Fault Tolerant)
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              PESCE Mandya Node
            </span>
          </div>
        </div>
      </section>

      {/* LIVE METRICS & CODE SECTION */}
      <section className="w-full py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="architecture">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Big Card: High-Performance Fabric API & Code Snippet */}
          <div className="lg:col-span-7 bg-[#101115] border border-white/[0.08] rounded-2xl p-7 lg:p-9 flex flex-col justify-between relative overflow-hidden group hover:border-white/[0.14] transition-all">
            <div className="absolute -right-20 -top-20 w-60 h-60 bg-[#ff5757]/10 rounded-full blur-3xl pointer-events-none"></div>
            <div>
              <div className="flex items-center justify-between mb-5">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#ff5757] font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff5757]"></span>
                  01 CONNECT
                </span>
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted font-medium">
                  HIGH-PERFORMANCE FABRIC API
                </span>
              </div>
              <h3 className="font-display font-bold text-2xl lg:text-3xl text-white tracking-tight mb-3">
                Sub-50ms Endorsement. Zero Trust.
              </h3>
              <p className="font-body text-sm text-muted max-w-xl leading-relaxed mb-6">
                Connect once to the AegisVote gateway and coordinate across all three consortium peers — automatic Merkle leaf inclusion, zero-knowledge constraint evaluation, and zero third-party telemetry leakage.
              </p>

              {/* Code Editor Frame */}
              <div className="bg-[#090a0d] border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl font-mono text-[13px] leading-relaxed">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-[#0c0d12]">
                  <span className="text-white/60 text-[11px]">aegisvote.config.ts</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-white/10"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-white/10"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-white/10"></span>
                  </div>
                </div>
                <div className="p-5 text-white/80 overflow-x-auto space-y-1">
                  <div className="text-muted italic">// Initialise consortium voter client in 4 lines</div>
                  <div>
                    <span className="text-[#ff5757]">import</span> {'{ '}
                    <span className="text-white">aegis</span>
                    {' }'} <span className="text-[#ff5757]">from</span>{' '}
                    <span className="text-emerald-400">&apos;@aegisvote/sdk&apos;</span>;
                  </div>
                  <div className="h-2"></div>
                  <div>
                    <span className="text-[#ff5757]">const</span> ballot ={' '}
                    <span className="text-[#ff5757]">await</span> aegis.
                    <span className="text-white">castBallot</span>({'{'}
                  </div>
                  <div className="pl-4">
                    candidateId: <span className="text-emerald-400">&apos;0x03&apos;</span>,
                  </div>
                  <div className="pl-4">
                    zkp: <span className="text-emerald-400">&apos;groth16&apos;</span>,
                  </div>
                  <div className="pl-4">
                    nullifierHash: <span className="text-white">proof.nullifier</span>,
                  </div>
                  <div className="pl-4">
                    encryption: <span className="text-emerald-400">&apos;paillier-2048&apos;</span>
                  </div>
                  <div>{'}'});</div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/[0.06] flex flex-wrap items-center gap-6 font-mono text-[11px] text-muted">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                2-of-3 Peer Endorsement
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Non-custodial Enclave
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Poseidon Merkle Tree
              </span>
            </div>
          </div>

          {/* Right Cards: Throughput Graph + Peer Latency Table */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Throughput Card with Red Line Curve */}
            <div className="bg-[#101115] border border-white/[0.08] rounded-2xl p-7 relative overflow-hidden group hover:border-white/[0.14] transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted font-medium">THROUGHPUT</span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                  </span>
                  live
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-display font-extrabold text-4xl lg:text-5xl text-white tracking-tight">1.24M</span>
                <span className="text-muted text-sm font-mono">ballots/tx</span>
              </div>
              <p className="text-[12px] text-muted mb-4">
                Cumulative encrypted votes committed without a single plaintext leak.
              </p>
              {/* Red Glow Graph Curve */}
              <div className="w-full h-20 relative flex items-end">
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 300 80">
                  <defs>
                    <linearGradient id="redGrad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#ff5757" stopOpacity="0.25"></stop>
                      <stop offset="100%" stopColor="#ff5757" stopOpacity="0.0"></stop>
                    </linearGradient>
                  </defs>
                  <path d="M 0,65 Q 60,60 120,48 T 240,28 T 300,12 L 300,80 L 0,80 Z" fill="url(#redGrad)"></path>
                  <path d="M 0,65 Q 60,60 120,48 T 240,28 T 300,12" fill="none" stroke="#ff5757" strokeLinecap="round" strokeWidth="2.5"></path>
                  <circle className="animate-pulse" cx="300" cy="12" fill="#ff5757" r="4"></circle>
                </svg>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-muted mt-2 pt-2 border-t border-white/[0.04]">
                <span>24h consensus peak</span>
                <span className="text-emerald-400 font-semibold">+12.4%</span>
              </div>
            </div>

            {/* Peer Latency Table Card */}
            <div className="bg-[#101115] border border-white/[0.08] rounded-2xl p-7 relative overflow-hidden group hover:border-white/[0.14] transition-all flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-muted font-medium">CONSORTIUM PEER LATENCY</span>
                  <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    operational
                  </span>
                </div>
                <div className="space-y-3 font-mono text-[13px]">
                  <div className="flex items-center justify-between py-1.5 border-b border-white/[0.04]">
                    <span className="text-white font-medium">Org 1 • PESCE University</span>
                    <span className="text-muted">18ms</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-white/[0.04]">
                    <span className="text-white font-medium">Org 2 • Oversight Authority</span>
                    <span className="text-muted">22ms</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-white/[0.04]">
                    <span className="text-white font-medium">Org 3 • Public Verifier</span>
                    <span className="text-muted">27ms</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-white font-medium">Raft Orderer Service</span>
                    <span className="text-muted">9ms</span>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-white/[0.06] mt-4 flex items-center justify-between">
                <button 
                  onClick={() => { sound.playClick(); onOpenConsole(); }}
                  className="text-[#ff5757] hover:text-[#ff6d6d] font-mono text-[12px] flex items-center gap-1 transition-colors"
                >
                  <span>View all peer endpoints</span>
                  <span>→</span>
                </button>
                <span className="font-mono text-[11px] text-muted">Block #48,192</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOUR PILLARS SECTION */}
      <section className="w-full py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="protocols">
        <div className="mb-14 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#121318] border border-white/[0.08] text-[#ff5757] font-mono text-[11px] uppercase tracking-wider mb-3">
            <span>✦</span>
            <span>THE PLATFORM</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight mb-4">
            Four cryptographic pillars. One unified protocol.
          </h2>
          <p className="font-body text-base text-muted max-w-2xl leading-relaxed">
            Cast, verify, encrypt, and audit from a single modular architecture. AegisVote eliminates the fragility of closed voting black boxes through open mathematics.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {/* Pillar 01 */}
          <div className="bg-[#101115] border border-white/[0.08] hover:border-white/[0.16] rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-[11px] uppercase font-bold text-[#ff5757]">01 ORCHESTRATE</span>
                <span className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-white/70 group-hover:text-[#ff5757] transition-colors">
                  <span className="material-symbols-outlined text-[18px]">fingerprint</span>
                </span>
              </div>
              <h3 className="font-display font-bold text-lg text-white mb-2">Zero-Knowledge Nullifiers</h3>
              <p className="font-body text-[13px] text-muted leading-relaxed mb-6">
                Deterministic Poseidon nullifiers commit once to the Fabric ledger. Invalidates duplicate voting attempts while severing physical identity link.
              </p>
            </div>
            <div className="bg-[#090a0d] border border-white/[0.04] rounded-lg p-3 font-mono text-[11px] text-muted space-y-1">
              <div className="flex justify-between"><span>Nullifier Gen</span><span className="text-emerald-400">12ms</span></div>
              <div className="flex justify-between"><span>Collision Risk</span><span className="text-white">2^-256</span></div>
            </div>
          </div>

          {/* Pillar 02: Featured */}
          <div className="bg-[#101115] border border-[#ff5757]/30 hover:border-[#ff5757]/60 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 relative group shadow-[0_0_30px_rgba(255,87,87,0.06)]">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ff5757] to-[#ff5757]/20 rounded-t-2xl"></div>
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-[11px] uppercase font-bold text-[#ff5757]">02 PRIVACY</span>
                <span className="w-8 h-8 rounded-lg bg-[#ff5757]/10 flex items-center justify-center text-[#ff5757]">
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                </span>
              </div>
              <h3 className="font-display font-bold text-lg text-white mb-2">Paillier Homomorphic Sum</h3>
              <p className="font-body text-[13px] text-muted leading-relaxed mb-6">
                Ballots aggregate directly in encrypted ciphertext space. No authority ever possesses a decryption key for an individual voter&apos;s choice.
              </p>
            </div>
            <div className="bg-[#090a0d] border border-white/[0.04] rounded-lg p-3 font-mono text-[11px] text-muted space-y-1">
              <div className="text-[#ff5757] font-semibold truncate">E(m1) ⊗ E(m2) = E(m1+m2)</div>
              <div className="flex justify-between"><span>Bit Length</span><span className="text-white">2048-bit</span></div>
            </div>
          </div>

          {/* Pillar 03 */}
          <div className="bg-[#101115] border border-white/[0.08] hover:border-white/[0.16] rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-[11px] uppercase font-bold text-[#ff5757]">03 INTEGRATION</span>
                <span className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-white/70 group-hover:text-[#ff5757] transition-colors">
                  <span className="material-symbols-outlined text-[18px]">hub</span>
                </span>
              </div>
              <h3 className="font-display font-bold text-lg text-white mb-2">Hyperledger Consensus</h3>
              <p className="font-body text-[13px] text-muted leading-relaxed mb-6">
                Strict 2-of-3 endorsement policies across PESCE, Oversight Authority, and Public Verifiers prevents unilateral database mutations.
              </p>
            </div>
            <div className="bg-[#090a0d] border border-white/[0.04] rounded-lg p-3 font-mono text-[11px] text-muted space-y-1">
              <div className="flex justify-between"><span>Ordering Engine</span><span className="text-white">Raft CFT</span></div>
              <div className="flex justify-between"><span>Block Time</span><span className="text-emerald-400">500ms</span></div>
            </div>
          </div>

          {/* Pillar 04 */}
          <div className="bg-[#101115] border border-white/[0.08] hover:border-white/[0.16] rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-[11px] uppercase font-bold text-[#ff5757]">04 AUDIT</span>
                <span className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-white/70 group-hover:text-[#ff5757] transition-colors">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                </span>
              </div>
              <h3 className="font-display font-bold text-lg text-white mb-2">Full-Trace Merkle Roots</h3>
              <p className="font-body text-[13px] text-muted leading-relaxed mb-6">
                Public bulletin board provides every elector with an inclusion proof receipt. Check that your ballot was tallied with mathematical certainty.
              </p>
            </div>
            <div className="bg-[#090a0d] border border-white/[0.04] rounded-lg p-3 font-mono text-[11px] text-muted space-y-1">
              <div className="flex justify-between"><span>Auditability</span><span className="text-emerald-400">Universal</span></div>
              <div className="flex justify-between"><span>Receipt Proof</span><span className="text-white">Log(N)</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* CONSORTIUM TOPOLOGY SECTION */}
      <section className="w-full py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.06]" id="consortium">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-14">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#121318] border border-white/[0.08] text-[#ff5757] font-mono text-[11px] uppercase tracking-wider mb-3">
              <span>✦</span>
              <span>CONSORTIUM TOPOLOGY</span>
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
              3-Organization Hyperledger Fabric
            </h2>
            <p className="font-body text-base text-muted max-w-xl mt-2 leading-relaxed">
              Byzantine fault tolerant architecture guarantees no single rogue server or university administrator can manipulate votes or unmask identity.
            </p>
          </div>
          <div className="font-mono text-[11px] text-muted bg-[#121318] px-3.5 py-2 rounded-lg border border-white/[0.08]">
            POLICY: 2-of-3 THRESHOLD SIGNING
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Org 1 */}
          <div className="bg-[#101115] border border-white/[0.08] hover:border-white/[0.18] rounded-2xl p-7 flex flex-col justify-between transition-all">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center text-[#ff5757]">
                  <span className="material-symbols-outlined text-[22px]">school</span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px] border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>ONLINE (2/2)
                </span>
              </div>
              <div className="text-[10px] font-mono uppercase text-[#ff5757] tracking-wider mb-1">Org 1 • Election Authority</div>
              <h3 className="font-display font-bold text-xl text-white mb-2">PESCE Mandya</h3>
              <p className="font-body text-sm text-muted leading-relaxed mb-6">
                Manages the student enrollment registry, binds blinded identity tokens, and hosts Primary Raft Orderer node #1.
              </p>
            </div>
            <div className="bg-[#090a0d] border border-white/[0.04] rounded-lg p-3 font-mono text-[11px] space-y-1">
              <div className="flex justify-between text-muted"><span>peer0.pesce.edu</span><span className="text-white">Port 7051</span></div>
              <div className="flex justify-between text-muted"><span>peer1.pesce.edu</span><span className="text-white">Port 7052</span></div>
            </div>
          </div>

          {/* Org 2 */}
          <div className="bg-[#101115] border border-white/[0.08] hover:border-white/[0.18] rounded-2xl p-7 flex flex-col justify-between transition-all">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center text-[#ff5757]">
                  <span className="material-symbols-outlined text-[22px]">gavel</span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px] border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>ONLINE (2/2)
                </span>
              </div>
              <div className="text-[10px] font-mono uppercase text-[#ff5757] tracking-wider mb-1">Org 2 • Oversight Authority</div>
              <h3 className="font-display font-bold text-xl text-white mb-2">Independent Auditor</h3>
              <p className="font-body text-sm text-muted leading-relaxed mb-6">
                Coordinates threshold key ceremonies, holds Shamir partial decryption share #1, and signs zero-knowledge validation attestations.
              </p>
            </div>
            <div className="bg-[#090a0d] border border-white/[0.04] rounded-lg p-3 font-mono text-[11px] space-y-1">
              <div className="flex justify-between text-muted"><span>peer0.oversight.gov</span><span className="text-white">Port 8051</span></div>
              <div className="flex justify-between text-muted"><span>peer1.oversight.gov</span><span className="text-white">Port 8052</span></div>
            </div>
          </div>

          {/* Org 3 */}
          <div className="bg-[#101115] border border-white/[0.08] hover:border-white/[0.18] rounded-2xl p-7 flex flex-col justify-between transition-all">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center text-[#ff5757]">
                  <span className="material-symbols-outlined text-[22px]">policy</span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px] border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>ONLINE (1/1)
                </span>
              </div>
              <div className="text-[10px] font-mono uppercase text-[#ff5757] tracking-wider mb-1">Org 3 • Independent Verifier</div>
              <h3 className="font-display font-bold text-xl text-white mb-2">Public Bulletin Board</h3>
              <p className="font-body text-sm text-muted leading-relaxed mb-6">
                Maintains an immutable public bulletin board, streams real-time Raft telemetry, and executes open mathematical audits.
              </p>
            </div>
            <div className="bg-[#090a0d] border border-white/[0.04] rounded-lg p-3 font-mono text-[11px] space-y-1">
              <div className="flex justify-between text-muted"><span>peer0.verifier.org</span><span className="text-white">Port 9051</span></div>
              <div className="flex justify-between text-muted"><span>raft.orderer.org</span><span className="text-white">Port 7050</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* PRE-FOOTER CTA */}
      <section className="w-full py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.06]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 bg-[#101115] border border-white/[0.08] rounded-3xl p-8 lg:p-12 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-[#ff5757]/10 rounded-full blur-3xl pointer-events-none"></div>
          <div>
            <h3 className="font-display font-bold text-3xl lg:text-4xl text-white tracking-tight mb-2">
              Ready to run tamper-proof elections?
            </h3>
            <p className="font-body text-sm text-muted max-w-xl">
              Spin up an institutional sandbox cluster in minutes — zero third-party trust required.
            </p>
          </div>
          <button
            onClick={() => { sound.playClick(); onStartVoting(); }}
            className="w-full md:w-auto justify-center px-7 py-3.5 rounded-full bg-[#ff5757] hover:bg-[#ff6d6d] text-white font-medium text-sm shadow-[0_0_24px_rgba(255,87,87,0.4)] transition-all flex items-center gap-2 shrink-0"
          >
            <span>Start building free</span>
            <span>→</span>
          </button>
        </div>
      </section>
    </div>
  );
};
