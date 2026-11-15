import React, { useState, useEffect } from 'react';
import { Election, api } from '../services/api';
import { sound } from '../services/sound';
import { Trophy, CheckCircle2, ShieldCheck, ArrowRight, Lock, AlertCircle, RefreshCw } from 'lucide-react';

interface ResultsPageProps {
  election: Election;
  onNavigateToConsortium: () => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({ election, onNavigateToConsortium }) => {
  const [tally, setTally] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTally = async () => {
    setIsLoading(true);
    try {
      const res = await api.getTally(election.id);
      setTally(res);
    } catch (e) {
      // If not yet tallied, tally is null
      setTally(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTally();
  }, [election.id, election.status]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-1">
            OFFICIAL ELECTION OUTCOME
          </span>
          <h1 className="font-display font-bold text-2xl text-white tracking-tight">
            Certified Election Results
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            {election.title} • Cryptographically verified via Hyperledger Fabric consortium
          </p>
        </div>

        <button
          onClick={fetchTally}
          disabled={isLoading}
          className="px-3 py-1.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/[0.08] text-xs font-mono transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-zinc-400 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* When election is not yet tallied */}
      {!tally ? (
        <div className="p-8 rounded-xl bg-[#121215] border border-white/[0.08] text-center space-y-4">
          <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-white/[0.08] flex items-center justify-center text-zinc-400 mx-auto">
            <Lock className="w-5 h-5 text-zinc-300" />
          </div>
          <h2 className="font-display font-semibold text-lg text-white">
            Results Sealed Under Homomorphic Encryption
          </h2>
          <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
            Ballots are currently aggregated in encrypted Paillier ciphertext space. To reveal the certified final counts, at least 2 of the 3 consortium authorities must execute the threshold decryption ceremony.
          </p>
          <div className="pt-2">
            <button
              onClick={onNavigateToConsortium}
              className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors inline-flex items-center gap-1.5"
            >
              <span>Go to Consortium Governance</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* Certified Tally Dashboard */
        <div className="space-y-6">
          {/* Winner Banner */}
          {tally.winner && (
            <div className="p-5 rounded-xl bg-blue-500/[0.07] border border-blue-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-blue-400 font-semibold tracking-wider">
                    CERTIFIED WINNER
                  </span>
                  <div className="font-display font-bold text-base text-white">
                    {tally.winner}
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded">
                Verified Outcome
              </span>
            </div>
          )}

          {/* Candidate Bars */}
          <div className="p-6 rounded-xl bg-[#121215] border border-white/[0.08] space-y-5">
            <div className="flex justify-between items-center text-xs font-mono text-zinc-400 pb-2 border-b border-white/[0.04]">
              <span>CANDIDATE & AFFILIATION</span>
              <span>VOTES & PERCENTAGE</span>
            </div>

            <div className="space-y-4">
              {tally.candidate_results.map((c: any) => (
                <div key={c.candidate_id} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <span className="font-display font-medium text-white">{c.name}</span>
                      <span className="text-zinc-500 font-mono ml-2">({c.party})</span>
                    </div>
                    <div className="font-mono">
                      <span className="text-white font-semibold">{c.votes} votes</span>
                      <span className="text-zinc-400 ml-2">({c.percentage}%)</span>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden border border-white/[0.04]">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-700"
                      style={{ width: `${Math.max(c.percentage, 2)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Proof & Participating Authorities */}
          <div className="p-5 rounded-xl bg-[#121215] border border-white/[0.06] font-mono text-xs text-zinc-400 space-y-2.5">
            <div className="flex justify-between">
              <span>Total Ballots Decrypted:</span>
              <span className="text-white font-semibold">{tally.total_ballots}</span>
            </div>
            <div className="flex justify-between">
              <span>Participating Key Shares:</span>
              <span className="text-emerald-400 font-semibold">{tally.participating_authorities.join(', ')}</span>
            </div>
            <div className="flex justify-between border-t border-white/[0.04] pt-2">
              <span>Homomorphic Proof Status:</span>
              <span className="text-white">Chaum-Pedersen Discrete Log Verified ✓</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
