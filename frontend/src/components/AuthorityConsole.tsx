import React, { useState } from 'react';
import { api, Election } from '../services/api';
import { sound } from '../services/sound';
import confetti from 'canvas-confetti';
import { 
  Building2, 
  Key, 
  CheckCircle, 
  Trophy, 
  Lock, 
  ShieldCheck, 
  Cpu, 
  BarChart3, 
  Vote, 
  CheckCheck,
  RefreshCw
} from 'lucide-react';

interface AuthorityConsoleProps {
  election: Election;
  onTallyExecuted: () => void;
}

export const AuthorityConsole: React.FC<AuthorityConsoleProps> = ({ election, onTallyExecuted }) => {
  const [isTallying, setIsTallying] = useState(false);
  const [tallyResult, setTallyResult] = useState<any>(null);
  const [activeStep, setActiveStep] = useState<number>(-1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const authorities = [
    { 
      id: 'EC_ORG1', 
      name: 'PESCE Mandya • University Node', 
      msp: 'Org1MSP',
      role: 'Consortium Lead & Root CA', 
      ip: 'peer0.pesce.edu:7051',
      status: 'ONLINE', 
      icon: 'school',
      peers: '2 / 2 Synced',
      uptime: '99.98%'
    },
    { 
      id: 'OBSERVER_ORG2', 
      name: 'Independent Oversight Authority', 
      msp: 'Org2MSP',
      role: 'Neutral Audit & Endorsing Peer', 
      ip: 'peer0.oversight.gov:8051',
      status: 'ONLINE', 
      icon: 'gavel',
      peers: '2 / 2 Synced',
      uptime: '100%'
    },
    { 
      id: 'CIVIL_SOCIETY_ORG3', 
      name: 'Public Verification Watchdog', 
      msp: 'Org3MSP',
      role: 'Public Bulletin Board & Verifier', 
      ip: 'peer0.verifier.org:9051',
      status: 'ONLINE', 
      icon: 'policy',
      peers: '1 / 1 Synced',
      uptime: '99.95%'
    }
  ];

  const ceremonySteps = [
    { label: "1. Close Remote Voting Window", desc: "Setting state machine to CLOSED across all CouchDB peer ledgers", icon: "lock" },
    { label: "2. Homomorphic Vector Aggregation", desc: "Computing modular sum: Product(C_i) mod n^2 without decrypting", icon: "functions" },
    { label: "3. Org 1 Partial Decryption", desc: "Computing share S_1 with Chaum-Pedersen zero-knowledge proof", icon: "key" },
    { label: "4. Org 2 Partial Decryption", desc: "Computing share S_2 with Chaum-Pedersen zero-knowledge proof", icon: "key" },
    { label: "5. Org 3 Partial Decryption", desc: "Computing share S_3 (Quorum 2-of-3 threshold met)", icon: "key" },
    { label: "6. Lagrange Polynomial Reconstruction", desc: "Reconstructing final plaintext candidate vector counts", icon: "done_all" }
  ];

  const handleExecuteThresholdCeremony = async () => {
    setIsTallying(true);
    setErrorMsg(null);
    sound.playClick();

    try {
      for (let i = 0; i < ceremonySteps.length; i++) {
        setActiveStep(i);
        sound.playScan();
        await new Promise(r => setTimeout(r, 650));
      }

      const result = await api.executeTally(election.id);
      sound.playSuccess();
      sound.playLock();
      confetti({ 
        particleCount: 140, 
        spread: 90, 
        colors: ['#ff5757', '#34d399', '#3b82f6', '#fbbf24'],
        origin: { y: 0.5 } 
      });

      setTallyResult(result);
      onTallyExecuted();
    } catch (err: any) {
      sound.playAlert();
      setErrorMsg(err.message || 'Threshold tally ceremony failed');
    } finally {
      setIsTallying(false);
      setActiveStep(-1);
    }
  };

  const handleResetElection = async () => {
    sound.playClick();
    try {
      await api.resetElection(election.id);
      sound.playSuccess();
      setTallyResult(null);
      setErrorMsg(null);
      onTallyExecuted();
    } catch (err: any) {
      sound.playAlert();
      setErrorMsg(err.message || 'Failed to reset election cycle');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-12">
      {/* Consortium Governance Header Card */}
      <div className="bg-[#101115] border border-white/[0.08] rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#ff5757] font-semibold bg-[#ff5757]/10 px-2 py-0.5 rounded border border-[#ff5757]/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff5757] animate-ping-slow"></span>
                2-OF-3 THRESHOLD MULTISIG
              </span>
              <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                RAFT CFT CONSENSUS
              </span>
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight">
              3-Organization Governance Console
            </h1>
            <p className="font-body text-xs text-muted max-w-xl leading-relaxed">
              No single organization holds the master decryption key. Revealing election totals requires at least 2 independent authorities to submit valid partial decryption shares.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleResetElection}
              className="px-4 py-2.5 rounded-xl bg-[#121318] hover:bg-[#181921] border border-white/[0.08] text-muted hover:text-white font-mono text-xs transition flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#ff5757]" />
              <span>Reset Cycle</span>
            </button>

            <button
              onClick={handleExecuteThresholdCeremony}
              disabled={isTallying || election.accepted_ballot_count === 0}
              className="px-6 py-3.5 rounded-xl bg-[#ff5757] hover:bg-[#ff6d6d] text-white font-display font-bold text-xs tracking-wider uppercase transition shadow-[0_0_24px_rgba(255,87,87,0.4)] flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer"
            >
              {isTallying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Executing Ceremony...</span>
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  <span>Execute 2-of-3 Threshold Decryption</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
          {errorMsg}
        </div>
      )}

      {/* 3 Consortium Organizations Detailed Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {authorities.map((auth, idx) => (
          <div 
            key={auth.id} 
            className="bg-[#101115] border border-white/[0.08] hover:border-white/[0.16] rounded-2xl p-6 flex flex-col justify-between transition-all"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center text-[#ff5757]">
                  <span className="material-symbols-outlined text-[22px]">{auth.icon}</span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px] border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  {auth.status}
                </span>
              </div>

              <div className="text-[10px] font-mono uppercase text-[#ff5757] tracking-wider mb-1">
                Consortium Member #{idx + 1}
              </div>
              <h3 className="font-display font-bold text-base text-white">
                {auth.name}
              </h3>
              <p className="font-body text-xs text-muted mt-1 leading-relaxed">
                {auth.role}
              </p>
            </div>

            <div className="mt-5 p-3.5 rounded-xl bg-[#090a0d] border border-white/[0.04] font-mono text-[11px] space-y-1.5 text-muted">
              <div className="flex justify-between">
                <span>MSP ID:</span>
                <span className="text-white font-medium">{auth.msp}</span>
              </div>
              <div className="flex justify-between">
                <span>Peer Socket:</span>
                <span className="text-white">{auth.ip}</span>
              </div>
              <div className="flex justify-between">
                <span>Peer Quorum:</span>
                <span className="text-emerald-400">{auth.peers}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-white/[0.04]">
                <span>Threshold Share:</span>
                <span className="text-[#ff5757] font-semibold">Key Share S_{idx + 1}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ceremony Interactive Progress Flow */}
      {isTallying && (
        <div className="bg-[#101115] border border-[#ff5757]/40 rounded-2xl p-6 sm:p-8 space-y-4 shadow-[0_0_30px_rgba(255,87,87,0.08)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#ff5757]" />
              <h2 className="font-display font-bold text-sm text-white uppercase tracking-wider">
                Consortium Threshold Ceremony Live Telemetry
              </h2>
            </div>
            <span className="text-xs font-mono text-[#ff5757] font-bold">
              Step {activeStep + 1} of {ceremonySteps.length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ceremonySteps.map((step, idx) => {
              const isDone = idx < activeStep;
              const isCurrent = idx === activeStep;
              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border text-xs font-mono transition-all ${
                    isCurrent
                      ? 'bg-[#181922] border-[#ff5757] text-white shadow-[0_0_15px_rgba(255,87,87,0.3)] animate-pulse'
                      : isDone
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-[#090a0d] border-white/[0.04] text-muted'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>{step.label}</span>
                    <span>{isDone ? '✓' : isCurrent ? '...' : ''}</span>
                  </div>
                  <div className="text-[11px] text-muted mt-1 leading-relaxed">{step.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Official Certified Election Results Breakdown */}
      {tallyResult && (
        <div className="bg-[#101115] border border-emerald-500/30 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-widest block mb-1">
                Official Certified Outcome
              </span>
              <h2 className="font-display font-extrabold text-2xl text-white">Final Candidate Totals</h2>
              <p className="text-xs text-muted mt-1 font-mono">
                Decrypted homomorphically via 2-of-3 threshold quorum • Zero individual ballots unsealed
              </p>
            </div>

            {tallyResult.winner && (
              <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-display font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/10">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Certified Winner: {tallyResult.winner}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {tallyResult.candidate_results.map((c: any) => (
              <div key={c.candidate_id} className="p-4 rounded-xl bg-[#090a0d] border border-white/[0.06] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-display font-bold text-white text-sm">{c.name}</span>
                    <span className="text-muted ml-2 font-mono">({c.party})</span>
                  </div>
                  <div className="font-mono text-sm">
                    <span className="text-white font-bold">{c.votes} votes</span>
                    <span className="text-emerald-400 ml-2 font-bold">({c.percentage}%)</span>
                  </div>
                </div>
                {/* Visual Bar */}
                <div className="w-full h-2 rounded-full bg-[#121318] overflow-hidden border border-white/[0.04]">
                  <div
                    className="h-full bg-gradient-to-r from-[#ff5757] to-emerald-400 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(255,87,87,0.3)]"
                    style={{ width: `${Math.max(c.percentage, 2)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-[#090a0d] font-mono text-xs text-muted flex flex-col sm:flex-row justify-between gap-2 border border-white/[0.04]">
            <span>Total Ballots Cast: <strong className="text-white">{tallyResult.total_ballots}</strong></span>
            <span>Quorum: <strong className="text-emerald-400">2-of-3 Threshold Satisfied</strong></span>
            <span>Participating: <strong className="text-white">{tallyResult.participating_authorities.join(', ')}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};
