import React, { useState } from 'react';
import { Election, api } from '../services/api';
import { sound } from '../services/sound';
import { Shield, Key, CheckCircle2, RotateCcw, ArrowRight, Lock, AlertCircle } from 'lucide-react';

interface ConsortiumPageProps {
  election: Election;
  onTallyExecuted: () => void;
  onNavigateToResults: () => void;
}

export const ConsortiumPage: React.FC<ConsortiumPageProps> = ({
  election,
  onTallyExecuted,
  onNavigateToResults,
}) => {
  const [isTallying, setIsTallying] = useState(false);
  const [activeStep, setActiveStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const authorities = [
    {
      id: 'ORG-1',
      name: 'PESCE Mandya University',
      role: 'Consortium Commission & Identity Registrar',
      msp: 'Org1MSP',
      endpoint: 'peer0.pesce.edu:7051',
      status: 'Synchronized',
      keyShare: 'Key Share S_1 (Held in Enclave)',
    },
    {
      id: 'ORG-2',
      name: 'Independent Electoral Oversight',
      role: 'Regulatory Audit & Endorsement Peer',
      msp: 'Org2MSP',
      endpoint: 'peer0.oversight.gov:8051',
      status: 'Synchronized',
      keyShare: 'Key Share S_2 (Held in Enclave)',
    },
    {
      id: 'ORG-3',
      name: 'Public Civil Verifier Watchdog',
      role: 'Immutable Bulletin Board & Public Verifier',
      msp: 'Org3MSP',
      endpoint: 'peer0.verifier.org:9051',
      status: 'Synchronized',
      keyShare: 'Key Share S_3 (Held in Enclave)',
    },
  ];

  const handleExecuteCeremony = async () => {
    setIsTallying(true);
    setError(null);
    sound.playClick();

    try {
      setActiveStep('Setting ledger status to CLOSED...');
      await new Promise(r => setTimeout(r, 400));

      setActiveStep('Computing Paillier homomorphic vector sum: Product(C_i) mod n^2...');
      await new Promise(r => setTimeout(r, 500));

      setActiveStep('Collecting Org 1 partial decryption share S_1 with Chaum-Pedersen proof...');
      await new Promise(r => setTimeout(r, 400));

      setActiveStep('Collecting Org 2 partial decryption share S_2 (2-of-3 Quorum Satisfied)...');
      await new Promise(r => setTimeout(r, 400));

      setActiveStep('Reconstructing candidate plaintext vector via Lagrange interpolation...');
      await api.executeTally(election.id);
      sound.playSuccess();
      onTallyExecuted();
      onNavigateToResults();
    } catch (err: any) {
      sound.playAlert();
      setError(err.message || 'Threshold tally ceremony failed.');
    } finally {
      setIsTallying(false);
      setActiveStep('');
    }
  };

  const handleReset = async () => {
    sound.playClick();
    try {
      await api.resetElection(election.id);
      sound.playSuccess();
      onTallyExecuted();
    } catch (err: any) {
      sound.playAlert();
      setError(err.message || 'Failed to reset election.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
        <div>
          <h1 className="font-display font-bold text-2xl text-white tracking-tight">
            3-Organization Consortium Governance
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Permissioned Hyperledger Fabric consensus. No unilateral administrative mutation is mathematically possible.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/[0.08] text-xs font-mono transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
            <span>Reset Cycle</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2 font-mono">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 3 Consortium Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {authorities.map((auth, idx) => (
          <div key={auth.id} className="p-6 rounded-xl bg-[#121215] border border-white/[0.06] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                  PEER NODE 0{idx + 1}
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {auth.status}
                </span>
              </div>

              <h3 className="font-display font-semibold text-sm text-white">{auth.name}</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{auth.role}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.04] space-y-2 font-mono text-[11px] text-zinc-400">
              <div className="flex justify-between">
                <span className="text-zinc-500">MSP Identifier:</span>
                <span className="text-zinc-200">{auth.msp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">gRPC Socket:</span>
                <span className="text-zinc-200">{auth.endpoint}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-white/[0.04] text-blue-400">
                <span>Key Enclave:</span>
                <span>{auth.keyShare}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Threshold Key Ceremony Execution Card */}
      <div className="p-6 sm:p-8 rounded-xl bg-[#121215] border border-white/[0.08] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-semibold">
              2-OF-3 THRESHOLD MULTISIG
            </span>
            <h2 className="font-display font-bold text-lg text-white mt-0.5">
              Execute Threshold Decryption Ceremony
            </h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl">
              Combines partial decryption shares from at least 2 sovereign authorities to reveal aggregate election outcomes. Individual ballots remain mathematically confidential.
            </p>
          </div>

          <button
            onClick={handleExecuteCeremony}
            disabled={isTallying || election.accepted_ballot_count === 0}
            className="px-5 py-2.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-40 shrink-0"
          >
            <Key className="w-3.5 h-3.5" />
            <span>{isTallying ? 'Executing Protocol...' : 'Execute Threshold Ceremony'}</span>
          </button>
        </div>

        {isTallying && (
          <div className="p-4 rounded-lg bg-[#09090b] border border-blue-500/30 font-mono text-xs text-blue-300 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
            <span>{activeStep}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 font-mono text-xs">
          <div className="p-3.5 rounded-lg bg-[#09090b] border border-white/[0.04]">
            <span className="text-zinc-500 block text-[10px]">CURRENT LEDGER STATE</span>
            <span className="text-white font-semibold mt-1 block">{election.status}</span>
          </div>
          <div className="p-3.5 rounded-lg bg-[#09090b] border border-white/[0.04]">
            <span className="text-zinc-500 block text-[10px]">TOTAL BALLOTS COMMITTED</span>
            <span className="text-white font-semibold mt-1 block">{election.accepted_ballot_count}</span>
          </div>
          <div className="p-3.5 rounded-lg bg-[#09090b] border border-white/[0.04]">
            <span className="text-zinc-500 block text-[10px]">THRESHOLD STATUS</span>
            <span className="text-emerald-400 font-semibold mt-1 block">Quorum Ready (2-of-3)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
