import React, { useState } from 'react';
import { Election, AnonymousCredential, BallotReceipt, api } from '../services/api';
import { ClientCrypto } from '../services/crypto';
import { sound } from '../services/sound';
import { 
  Shield, 
  Lock, 
  Check, 
  FileCheck, 
  Copy, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

interface VotingPortalProps {
  election: Election;
  currentUser: any | null;
  onBallotCast: () => void;
  onRequireLogin: () => void;
}

export const VotingPortal: React.FC<VotingPortalProps> = ({
  election,
  currentUser,
  onBallotCast,
  onRequireLogin,
}) => {
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStep, setSubmissionStep] = useState<string>('');
  const [receipt, setReceipt] = useState<BallotReceipt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedNullifier, setCopiedNullifier] = useState(false);

  // If user is not logged in, prompt them cleanly
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 mx-auto mb-4">
          <Lock className="w-5 h-5" />
        </div>
        <h2 className="font-display font-bold text-xl text-white mb-2">
          Authentication Required
        </h2>
        <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
          To cast a cryptographically valid ballot on the Hyperledger Fabric consortium ledger, please authenticate with your institutional voter credentials.
        </p>
        <button
          onClick={onRequireLogin}
          className="px-5 py-2.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors inline-flex items-center gap-2"
        >
          <span>Sign In to Voter Booth</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  const handleCastBallot = async () => {
    if (selectedCandidate === null) return;
    setIsSubmitting(true);
    setError(null);
    sound.playClick();

    try {
      setSubmissionStep('Generating client-side ZKP 1-of-K selection proof...');
      await new Promise(r => setTimeout(r, 400));

      const voterSecret = ClientCrypto.generateRandomHex(32);
      const salt = ClientCrypto.generateRandomHex(32);

      setSubmissionStep('Obtaining anonymous credential token...');
      const commitment = await ClientCrypto.createIdentityCommitment(voterSecret, salt);
      await api.requestCredential(currentUser.id, election.id, commitment);

      setSubmissionStep('Computing Paillier homomorphic ciphertext...');
      await new Promise(r => setTimeout(r, 400));
      
      let precomputedEncryptedVector: any[] | undefined = undefined;
      try {
        const encRes = await api.encryptVector(election.id, selectedCandidate);
        precomputedEncryptedVector = encRes.encrypted_vector;
      } catch (e) {
        console.warn('Fallback to standard encryption', e);
      }

      const payload = await ClientCrypto.generateBallotPayload(
        selectedCandidate,
        election.candidates.length,
        voterSecret,
        salt,
        election.id,
        election.public_key.n,
        precomputedEncryptedVector
      );

      setSubmissionStep('Broadcasting transaction to 3-Org Fabric consortium...');
      const resReceipt = await api.submitBallot(payload);
      sound.playSuccess();
      setReceipt(resReceipt);
      onBallotCast();
    } catch (err: any) {
      sound.playAlert();
      setError(err.message || 'Ballot rejected by chaincode consensus rules.');
    } finally {
      setIsSubmitting(false);
      setSubmissionStep('');
    }
  };

  const copyNullifier = () => {
    if (!receipt) return;
    navigator.clipboard.writeText(receipt.nullifier);
    sound.playClick();
    setCopiedNullifier(true);
    setTimeout(() => setCopiedNullifier(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
      {/* Voter Context Header */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#121215] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-mono text-zinc-300 font-semibold">{currentUser.name}</span>
            <span className="text-[10px] font-mono text-zinc-500 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06]">
              USN: {currentUser.usn}
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            {election.title} • Status: <span className="text-emerald-400 font-mono font-medium">{election.status}</span>
          </p>
        </div>

        <div className="text-right font-mono text-[11px] text-zinc-500 hidden sm:block">
          <div>Policy: 2-of-3 Endorsement</div>
          <div className="text-zinc-400">Ledger Block #{election.accepted_ballot_count}</div>
        </div>
      </div>

      {election.status !== 'VOTING' && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Voting is currently closed for this election cycle (Status: {election.status}).</span>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2 font-mono">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Ballot Section */}
      {!receipt ? (
        <div className="p-6 sm:p-8 rounded-xl bg-[#121215] border border-white/[0.08] space-y-6">
          <div>
            <h2 className="font-display font-bold text-lg text-white">
              Official Remote Ballot
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Select one candidate. Your selection will be transformed into an encrypted vector and proven valid with Groth16 SNARKs before being transmitted.
            </p>
          </div>

          {/* Candidate Radio Grid */}
          <div className="space-y-3">
            {election.candidates.map((cand) => {
              const isSelected = selectedCandidate === cand.id;
              return (
                <div
                  key={cand.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedCandidate(cand.id);
                  }}
                  className={`p-4 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-500/[0.06] border-blue-500 text-white'
                      : 'bg-[#09090b] border-white/[0.06] text-zinc-300 hover:border-white/[0.14]'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      isSelected ? 'border-blue-500 bg-blue-500' : 'border-zinc-700'
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <div className="font-display font-semibold text-sm text-white">{cand.name}</div>
                      <div className="text-xs font-mono text-zinc-400 mt-0.5">{cand.party}</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-zinc-500">Choice #{cand.id + 1}</span>
                </div>
              );
            })}
          </div>

          {/* Cryptographic Execution Status */}
          {isSubmitting && (
            <div className="p-3.5 rounded-lg bg-[#09090b] border border-blue-500/30 text-xs font-mono text-blue-300 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
              <span>{submissionStep}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleCastBallot}
              disabled={selectedCandidate === null || isSubmitting || election.status !== 'VOTING'}
              className="w-full h-11 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-40"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Encrypting & Committing...' : 'Sign, Encrypt & Cast Ballot'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Official Blockchain Receipt */
        <div className="p-6 sm:p-8 rounded-xl bg-[#121215] border border-emerald-500/30 space-y-6 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-white">
                Ballot Committed to Blockchain Ledger
              </h2>
              <p className="text-xs text-zinc-400">
                Your vote is permanently sealed in the Hyperledger Fabric ledger with 2-of-3 consortium endorsement.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-lg bg-[#09090b] border border-white/[0.06] font-mono text-xs space-y-3">
            <div className="flex justify-between">
              <span className="text-zinc-500">Block Height:</span>
              <span className="text-emerald-400 font-semibold">Block #{receipt.block_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Fabric Transaction ID:</span>
              <span className="text-zinc-300 truncate max-w-xs">{receipt.tx_id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500">Credential-Bound Nullifier:</span>
              <div className="flex items-center gap-1.5">
                <span className="text-blue-400 font-semibold truncate max-w-xs">{receipt.nullifier}</span>
                <button
                  onClick={copyNullifier}
                  className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                  title="Copy Nullifier"
                >
                  {copiedNullifier ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Consortium Merkle Root:</span>
              <span className="text-zinc-300 truncate max-w-xs">{receipt.merkle_root}</span>
            </div>
            <div className="flex justify-between border-t border-white/[0.04] pt-2">
              <span className="text-zinc-500">Endorsements:</span>
              <span className="text-emerald-400">{receipt.endorsements.join(' • ')}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                sound.playClick();
                setReceipt(null);
                setSelectedCandidate(null);
              }}
              className="flex-1 py-2.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.08] text-xs font-medium transition-colors"
            >
              Cast Another Ballot
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
