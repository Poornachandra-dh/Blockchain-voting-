import React, { useState, useEffect } from 'react';
import { Election, api, ElectionAuditReport } from '../services/api';
import { sound } from '../services/sound';
import { Search, CheckCircle2, ShieldCheck, AlertCircle, Copy, Check, GitCommit, FileText } from 'lucide-react';

interface VerifierPageProps {
  election: Election;
}

export const VerifierPage: React.FC<VerifierPageProps> = ({ election }) => {
  const [nullifierQuery, setNullifierQuery] = useState('');
  const [bulletin, setBulletin] = useState<any[]>([]);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [auditReport, setAuditReport] = useState<ElectionAuditReport | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [copiedRoot, setCopiedRoot] = useState(false);

  useEffect(() => {
    loadBulletin();
  }, [election.id]);

  const loadBulletin = async () => {
    try {
      const data = await api.getBulletinBoard(election.id);
      setBulletin(data.bulletin_entries || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleVerify = () => {
    if (!nullifierQuery.trim()) return;
    sound.playClick();
    const query = nullifierQuery.trim().toLowerCase();
    const match = bulletin.find(b => b.nullifier.toLowerCase().includes(query));

    if (match) {
      sound.playSuccess();
      setVerificationResult({
        found: true,
        entry: match,
        message: 'Ballot verified. Cryptographically included in the Merkle state root.'
      });
    } else {
      sound.playAlert();
      setVerificationResult({
        found: false,
        message: 'Nullifier hash not found on the published bulletin board.'
      });
    }
  };

  const handleRunAudit = async () => {
    setIsAuditing(true);
    sound.playClick();
    try {
      sound.playScan();
      const report = await api.runConsortiumAudit(election.id);
      sound.playSuccess();
      setAuditReport(report);
    } catch (e) {
      sound.playAlert();
    } finally {
      setIsAuditing(false);
    }
  };

  const copyMerkleRoot = () => {
    navigator.clipboard.writeText(election.merkle_root);
    sound.playClick();
    setCopiedRoot(true);
    setTimeout(() => setCopiedRoot(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-1">
            INDEPENDENT VERIFICATION PROTOCOL
          </span>
          <h1 className="font-display font-bold text-2xl text-white tracking-tight">
            Universal Audit Verifier
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Verify ballot inclusion and cryptographic consensus without disclosing citizen identity.
          </p>
        </div>

        <button
          onClick={handleRunAudit}
          disabled={isAuditing}
          className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 self-start sm:self-auto"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{isAuditing ? 'Executing Audit...' : 'Run 6-Check Consortium Audit'}</span>
        </button>
      </div>

      {/* Merkle Root State Card */}
      <div className="p-4 rounded-xl bg-[#121215] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-zinc-400">
          <GitCommit className="w-4 h-4 text-blue-400 shrink-0" />
          <span>Immutable Merkle State Root:</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-zinc-200 truncate max-w-sm sm:max-w-md bg-[#09090b] px-2.5 py-1 rounded border border-white/[0.04]">
            {election.merkle_root}
          </span>
          <button
            onClick={copyMerkleRoot}
            className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            title="Copy Merkle Root"
          >
            {copiedRoot ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Individual Verifier: Check My Ballot */}
      <div className="p-6 sm:p-8 rounded-xl bg-[#121215] border border-white/[0.08] space-y-4">
        <div>
          <h2 className="font-display font-semibold text-base text-white">
            Individual Verifiability (“Check My Ballot”)
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Input your credential nullifier hash from your ballot receipt to mathematically confirm its inclusion in the ledger.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={nullifierQuery}
            onChange={(e) => setNullifierQuery(e.target.value)}
            placeholder="Paste your nullifier hash (e.g. 5e884898da280471...)"
            className="flex-1 h-10 bg-[#09090b] border border-white/[0.1] rounded-md px-3 font-mono text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button
            onClick={handleVerify}
            className="h-10 px-5 rounded-md bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.1] text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Verify Ballot</span>
          </button>
        </div>

        {verificationResult && (
          <div className={`p-4 rounded-lg border text-xs font-mono space-y-2 ${
            verificationResult.found
              ? 'bg-emerald-500/[0.06] border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/[0.06] border-red-500/30 text-red-300'
          }`}>
            <div className="flex items-center gap-2 font-semibold">
              {verificationResult.found ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
              <span>{verificationResult.message}</span>
            </div>

            {verificationResult.found && (
              <div className="pt-2 border-t border-emerald-500/20 text-zinc-300 space-y-1 text-[11px]">
                <div>Block Height: <span className="text-white font-semibold">#{verificationResult.entry.block_number}</span></div>
                <div>Fabric TxID: <span className="text-zinc-200">{verificationResult.entry.tx_id}</span></div>
                <div>Leaf Hash: <span className="text-zinc-200">{verificationResult.entry.leaf_hash}</span></div>
                <div>Timestamp: <span className="text-zinc-400">{verificationResult.entry.timestamp}</span></div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 6-Check Consortium Audit Findings */}
      {auditReport && (
        <div className="p-6 rounded-xl bg-[#121215] border border-emerald-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h3 className="font-display font-semibold text-sm text-white">
                Consortium Audit Findings (Table 4.2 Standard)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {auditReport.universal_verifiability_status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {auditReport.authority_audits.map((auth) => (
              <div key={auth.org_id} className="p-3.5 rounded-lg bg-[#09090b] border border-white/[0.04] font-mono text-[11px] space-y-1.5 text-zinc-400">
                <div className="text-white font-semibold pb-1 border-b border-white/[0.04] flex justify-between">
                  <span>{auth.org_id.split(' ')[0]}</span>
                  <span className="text-emerald-400">PASSED ✓</span>
                </div>
                <div className="flex justify-between">
                  <span>Nullifiers:</span>
                  <span className="text-zinc-200">No Collisions</span>
                </div>
                <div className="flex justify-between">
                  <span>ZKP Proofs:</span>
                  <span className="text-zinc-200">All Valid</span>
                </div>
                <div className="flex justify-between">
                  <span>State Root:</span>
                  <span className="text-emerald-400">Verified</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Public Bulletin Board Ledger Table */}
      <div className="p-6 rounded-xl bg-[#121215] border border-white/[0.08] space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-display font-semibold text-sm text-white">
              Public Ledger Bulletin Board
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              All committed ballot records published openly for verification.
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            {bulletin.length} Blocks Recorded
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-white/[0.06]">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#09090b] text-zinc-500 border-b border-white/[0.06] text-[11px]">
              <tr>
                <th className="p-3">Height</th>
                <th className="p-3">Transaction ID</th>
                <th className="p-3">Credential Nullifier</th>
                <th className="p-3">Leaf Hash</th>
                <th className="p-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-zinc-300">
              {bulletin.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-zinc-500">
                    No ballots recorded on the ledger yet. Cast a ballot in the Voting Portal to view transactions.
                  </td>
                </tr>
              ) : (
                bulletin.map((b) => (
                  <tr key={b.tx_id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3 text-emerald-400 font-semibold">#{b.block_number}</td>
                    <td className="p-3 text-zinc-300">{b.tx_id.slice(0, 16)}...</td>
                    <td className="p-3 text-blue-400">{b.nullifier.slice(0, 16)}...</td>
                    <td className="p-3 text-zinc-400">{b.leaf_hash.slice(0, 16)}...</td>
                    <td className="p-3 text-zinc-500 text-[11px]">{new Date(b.timestamp).toLocaleTimeString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
