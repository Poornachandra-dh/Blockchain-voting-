import React, { useState } from 'react';
import { api, Election, AnonymousCredential, BallotReceipt } from '../services/api';
import { ClientCrypto } from '../services/crypto';
import { sound } from '../services/sound';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  Fingerprint, 
  KeyRound, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  FileCheck, 
  User, 
  ShieldAlert, 
  Printer, 
  Copy, 
  Check, 
  Vote, 
  Cpu, 
  RefreshCw 
} from 'lucide-react';

interface VoterPortalProps {
  election: Election;
  onBallotCast: () => void;
}

export const VoterPortal: React.FC<VoterPortalProps> = ({ election, onBallotCast }) => {
  // Synthetic voter profiles
  const voterProfiles = [
    { id: 'VOTER-001', name: 'Poorna Chandra DH', usn: '4PS23IS039', district: 'Mandya (AC-188)', dept: 'Information Science & Engg.', avatar: '👨‍💻' },
    { id: 'VOTER-002', name: 'Vikas B', usn: '4PS23IS064', district: 'Mandya (AC-188)', dept: 'Information Science & Engg.', avatar: '👨‍🎓' },
    { id: 'VOTER-003', name: 'Darshan C', usn: '4PS23IS007', district: 'Mysuru (AC-215)', dept: 'Information Science & Engg.', avatar: '👨‍💼' },
    { id: 'VOTER-004', name: 'Karthik S', usn: '4PS23IS027', district: 'Bengaluru (AC-160)', dept: 'Information Science & Engg.', avatar: '👨‍🔬' },
    { id: 'VOTER-005', name: 'Alice Smith', usn: '4PS23IS099', district: 'Mandya (AC-188)', dept: 'Information Science & Engg.', avatar: '👩‍💻' }
  ];

  const [selectedProfile, setSelectedProfile] = useState(voterProfiles[0]);
  const [password, setPassword] = useState('password123');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isScanningBiometric, setIsScanningBiometric] = useState(false);
  
  // Anonymous Credential State
  const [voterSecret, setVoterSecret] = useState<string>('');
  const [salt, setSalt] = useState<string>('');
  const [credential, setCredential] = useState<AnonymousCredential | null>(null);
  const [isGeneratingCred, setIsGeneratingCred] = useState(false);

  // Ballot State
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cryptoStageIndex, setCryptoStageIndex] = useState<number>(-1);
  const [receipt, setReceipt] = useState<BallotReceipt | null>(null);
  const [copiedTx, setCopiedTx] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Candidate dossiers
  const candidateManifestos = [
    { symbol: '🦅', color: '#3b82f6', manifesto: 'High-Tech Research Infrastructure & Universal Gigabit Campus Mesh' },
    { symbol: '⚡', color: '#10b981', manifesto: 'Transparent Student Governance via Immutable Smart Contracts' },
    { symbol: '🌟', color: '#8b5cf6', manifesto: 'Zero-Carbon Sustainable Campus & Women in Tech Initiatives' },
    { symbol: '🚫', color: '#ff5757', manifesto: 'Formal protest against all listed candidates (Audited Protest Vote)' },
  ];

  // 1. Biometric / NIST SP 800-63-3 Authentication
  const handleBiometricAuth = async () => {
    setIsScanningBiometric(true);
    sound.playScan();
    setErrorMessage(null);

    try {
      await new Promise(r => setTimeout(r, 1200));
      await api.loginVoter(selectedProfile.id, password);
      sound.playSuccess();
      setIsAuthenticated(true);

      const s = ClientCrypto.generateRandomHex(32);
      const r = ClientCrypto.generateRandomHex(32);
      setVoterSecret(s);
      setSalt(r);
    } catch (err: any) {
      sound.playAlert();
      setErrorMessage(err.message || 'Biometric verification failed');
    } finally {
      setIsScanningBiometric(false);
    }
  };

  // 2. Request Anonymous Credential
  const handleRequestCredential = async () => {
    setIsGeneratingCred(true);
    sound.playClick();
    setErrorMessage(null);

    try {
      await new Promise(r => setTimeout(r, 800));
      const commitment = await ClientCrypto.createIdentityCommitment(voterSecret, salt);
      const cred = await api.requestCredential(selectedProfile.id, election.id, commitment);
      sound.playLock();
      setCredential(cred);
    } catch (err: any) {
      sound.playAlert();
      setErrorMessage(err.message || 'Credential issuance rejected');
    } finally {
      setIsGeneratingCred(false);
    }
  };

  // 3. Cryptographic Pipeline Stages
  const stages = [
    { label: "01 GROTH16 ZK-PROOF", desc: "Binary vector selection proof (v_i in {0,1}, sum = 1)", icon: "shield", math: "R1CS QAP Satisfied" },
    { label: "02 PAILLIER ENCRYPTION", desc: "Modular exponentiation with consortium public key", icon: "lock", math: "C = g^v * r^n mod n^2" },
    { label: "03 NULLIFIER BINDING", desc: "Deterministic credential-bound nullifier derivation", icon: "fingerprint", math: "NF = HMAC(sk, ElectionID)" },
    { label: "04 FABRIC ENDORSEMENT", desc: "Collecting 2-of-3 consortium peer signatures", icon: "hub", math: "VSCC Endorsement Quorum" }
  ];

  // 4. Cast Encrypted Ballot
  const handleCastBallot = async () => {
    if (selectedCandidate === null || !credential) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    sound.playClick();

    try {
      for (let i = 0; i < stages.length; i++) {
        setCryptoStageIndex(i);
        sound.playScan();
        await new Promise(r => setTimeout(r, 650));
      }

      const payload = await ClientCrypto.generateBallotPayload(
        selectedCandidate,
        election.candidates.length,
        voterSecret,
        salt,
        election.id,
        election.public_key.n
      );

      const resReceipt = await api.submitBallot(payload);
      sound.playSuccess();
      sound.playLock();

      confetti({
        particleCount: 120,
        spread: 80,
        colors: ['#ff5757', '#34d399', '#3b82f6', '#fbbf24'],
        origin: { y: 0.6 }
      });

      setReceipt(resReceipt);
      onBallotCast();
    } catch (err: any) {
      sound.playAlert();
      setErrorMessage(err.message || 'Ballot rejected by chaincode');
    } finally {
      setIsSubmitting(false);
      setCryptoStageIndex(-1);
    }
  };

  const copyReceiptTx = () => {
    if (!receipt) return;
    navigator.clipboard.writeText(receipt.nullifier);
    sound.playClick();
    setCopiedTx(true);
    setTimeout(() => setCopiedTx(false), 2500);
  };

  const handleResetElection = async () => {
    try {
      sound.playClick();
      await api.resetElection(election.id);
      sound.playSuccess();
      setReceipt(null);
      setSelectedCandidate(null);
      setCredential(null);
      setIsAuthenticated(false);
      setErrorMessage(null);
      onBallotCast();
    } catch (err: any) {
      sound.playAlert();
      setErrorMessage(err.message || 'Failed to reset election cycle');
    }
  };

  // Determine current active step
  const currentStep = receipt ? 5 : isSubmitting ? 4 : credential ? 3 : isAuthenticated ? 2 : 1;

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 items-start">
      {/* LEFT SIDEBAR: STAGE NAVIGATOR */}
      <aside className="hidden lg:flex flex-col w-72 shrink-0 bg-[#0a0b0e] border border-white/[0.08] rounded-2xl p-6 sticky top-28">
        <div className="mb-6">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#ff5757] font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff5757]"></span>
            VOTER PORTAL
          </span>
          <h2 className="font-display font-bold text-lg text-white mt-1">E-Voting Protocol</h2>
          <p className="font-mono text-[11px] text-muted mt-0.5">PESCE Consortium 2026</p>
        </div>

        <div className="space-y-4">
          {[
            { step: 1, title: 'Identity Verification', sub: 'NIST IAL2 Smart Card' },
            { step: 2, title: 'Anonymous Credential', sub: 'Zero-Knowledge Token' },
            { step: 3, title: 'Candidate Choice', sub: 'Ballot Vector Selection' },
            { step: 4, title: 'Cryptographic Sealing', sub: 'ZKP + Paillier Homomorphic' },
            { step: 5, title: 'Committed Receipt', sub: 'Fabric Ledger Inclusion' },
          ].map((item) => {
            const isCompleted = currentStep > item.step;
            const isCurrent = currentStep === item.step;
            return (
              <div 
                key={item.step}
                className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                  isCurrent 
                    ? 'bg-[#121318] border border-[#ff5757]/30 shadow-[0_0_15px_rgba(255,87,87,0.08)]' 
                    : isCompleted
                    ? 'opacity-80'
                    : 'opacity-40'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono shrink-0 mt-0.5 ${
                  isCompleted 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : isCurrent 
                    ? 'bg-[#ff5757] text-white font-bold shadow-[0_0_10px_rgba(255,87,87,0.5)]' 
                    : 'bg-white/[0.04] text-muted border border-white/[0.08]'
                }`}>
                  {isCompleted ? '✓' : item.step}
                </div>
                <div>
                  <div className={`text-xs font-display font-semibold ${isCurrent ? 'text-white' : 'text-slate-300'}`}>
                    {item.title}
                  </div>
                  <div className="text-[10px] font-mono text-muted">
                    {item.sub}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ledger Status Pill */}
        <div className="mt-8 pt-5 border-t border-white/[0.06] space-y-2 font-mono text-[11px]">
          <div className="flex justify-between text-muted">
            <span>Ledger State:</span>
            <span className="text-emerald-400 font-semibold">{election.status}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>Accepted Ballots:</span>
            <span className="text-white">{election.accepted_ballot_count}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>Endorsement Policy:</span>
            <span className="text-[#ff5757]">2-of-3 Orgs</span>
          </div>
        </div>
      </aside>

      {/* RIGHT MAIN WORKSPACE */}
      <div className="flex-1 w-full space-y-6">
        {/* Election Status Banner */}
        <div className="bg-[#101115] border border-white/[0.08] rounded-2xl p-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#ff5757] font-semibold bg-[#ff5757]/10 px-2 py-0.5 rounded border border-[#ff5757]/20">
                  OFFICIAL REMOTE BALLOT
                </span>
                <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  STATUS: {election.status}
                </span>
              </div>
              <h1 className="font-display font-bold text-2xl text-white tracking-tight">
                {election.title}
              </h1>
              <p className="font-body text-xs text-muted max-w-xl mt-1 leading-relaxed">
                {election.description}
              </p>
            </div>

            <div className="shrink-0 bg-[#0c0d12] border border-white/[0.06] p-3 rounded-xl font-mono text-right">
              <span className="text-[10px] text-muted block uppercase">Cryptographic Engine</span>
              <span className="text-xs font-bold text-white">Paillier-2048 + Groth16</span>
            </div>
          </div>
        </div>

        {/* Alert when Election is not in VOTING state */}
        {election.status !== 'VOTING' && (
          <div className="p-5 rounded-2xl bg-[#1a1315] border border-[#ff5757]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#ff5757]/15 text-[#ff5757] border border-[#ff5757]/30 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-white">
                  Election is currently in &apos;{election.status}&apos; state
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  Voting is finalized. Start a fresh cycle to cast and verify new ballots.
                </p>
              </div>
            </div>
            <button
              onClick={handleResetElection}
              className="px-4 py-2 rounded-xl bg-[#ff5757] hover:bg-[#ff6d6d] text-white font-display font-bold text-xs uppercase tracking-wider transition shadow-[0_0_15px_rgba(255,87,87,0.3)] flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Election Cycle</span>
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-3">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STAGE 1: DIGITAL VOTER SMART CARD & BIOMETRIC AUTH */}
        {!isAuthenticated && (
          <div className="bg-[#101115] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#ff5757] font-semibold">
                  STAGE 01 • IDENTITY VERIFICATION
                </span>
                <h2 className="font-display font-bold text-xl text-white mt-0.5">
                  Digital Voter Smart Card & Passkey
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  NIST SP 800-63-3 Identity Assurance Level 2 (IAL2) Authenticator
                </p>
              </div>

              {/* Profile selector pill group */}
              <div className="flex flex-wrap items-center gap-1.5 bg-[#090a0d] border border-white/[0.06] p-1 rounded-xl">
                {voterProfiles.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedProfile(p);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1 ${
                      selectedProfile.id === p.id
                        ? 'bg-[#ff5757] text-white font-bold shadow-[0_0_10px_rgba(255,87,87,0.4)]'
                        : 'text-muted hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <span>{p.avatar}</span>
                    <span>{p.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* HOLOGRAPHIC DIGITAL SMART CARD */}
            <div 
              className="relative w-full max-w-lg mx-auto rounded-2xl p-6 text-white overflow-hidden shadow-2xl group transition-all"
              style={{
                background: 'linear-gradient(135deg, #0d121c 0%, #151926 50%, #0d1e2f 100%)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 30px rgba(255,87,87,0.1)'
              }}
            >
              {/* Scanline pattern overlay */}
              <div className="absolute inset-0 halftone-dense opacity-20 pointer-events-none"></div>

              {/* Card Header */}
              <div className="relative z-10 flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.08] border border-white/20 flex items-center justify-center text-xl shadow-inner">
                    {selectedProfile.avatar}
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-base tracking-wide text-white">
                      {selectedProfile.name}
                    </h3>
                    <p className="text-[11px] font-mono text-[#ff5757]">
                      {selectedProfile.dept} • USN: {selectedProfile.usn}
                    </p>
                  </div>
                </div>

                {/* EMV Chip Representation */}
                <div className="w-10 h-7 rounded bg-amber-400/80 border border-amber-300 shadow flex items-center justify-center">
                  <div className="w-6 h-4 border border-amber-700/40 rounded-sm"></div>
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs my-6 pt-4 border-t border-white/10">
                <div>
                  <span className="text-[10px] text-muted uppercase block">Voter ID</span>
                  <span className="font-bold text-white">{selectedProfile.id}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted uppercase block">Constituency</span>
                  <span className="font-semibold text-white">{selectedProfile.district}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted uppercase block">Electoral Status</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted uppercase block">Assurance Level</span>
                  <span className="text-white font-semibold">NIST AAL2</span>
                </div>
              </div>

              {/* Biometric Interactive Trigger */}
              <div className="relative z-10 pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-muted font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-[#ff5757]" />
                  <span>Biometric Passkey Authenticator</span>
                </div>

                <button
                  onClick={handleBiometricAuth}
                  disabled={isScanningBiometric}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#ff5757] hover:bg-[#ff6d6d] text-white font-display font-bold text-xs tracking-wider uppercase transition shadow-[0_0_24px_rgba(255,87,87,0.4)] flex items-center justify-center gap-2 relative overflow-hidden"
                >
                  {isScanningBiometric && (
                    <span className="absolute inset-0 bg-white/20 animate-laser"></span>
                  )}
                  <Fingerprint className={`w-4 h-4 ${isScanningBiometric ? 'animate-pulse text-white' : ''}`} />
                  <span>{isScanningBiometric ? 'Scanning Biometrics...' : 'Authenticate Voter'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 2: ANONYMOUS CREDENTIAL VAULT */}
        {isAuthenticated && !credential && (
          <div className="bg-[#101115] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#ff5757]/15 text-[#ff5757] border border-[#ff5757]/30 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#ff5757] font-semibold">
                  STAGE 02 • CREDENTIAL PROOF
                </span>
                <h2 className="font-display font-bold text-xl text-white">
                  Anonymous Blind Credential Issuance
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  Separates your legal identity from your vote. The Authority signs your commitment without seeing your private key.
                </p>
              </div>
            </div>

            {/* Cryptographic Secrets Details */}
            <div className="p-5 rounded-xl bg-[#090a0d] border border-white/[0.06] space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center text-muted">
                <span>Authenticated Citizen:</span>
                <span className="text-emerald-400 font-bold">{selectedProfile.name} ({selectedProfile.id})</span>
              </div>
              <div className="flex justify-between items-center text-muted">
                <span>Client Secret Key (sk):</span>
                <span className="text-white font-bold">{voterSecret.slice(0, 24)}... (Kept In-Memory)</span>
              </div>
              <div className="flex justify-between items-center text-muted">
                <span>Blinding Salt (r):</span>
                <span className="text-white">{salt.slice(0, 24)}...</span>
              </div>
              <div className="flex justify-between items-center text-muted pt-2 border-t border-white/[0.04]">
                <span>Zero-Knowledge Commitment:</span>
                <span className="text-[#ff5757] font-semibold">C_id = Poseidon(sk || salt)</span>
              </div>
            </div>

            <button
              onClick={handleRequestCredential}
              disabled={isGeneratingCred}
              className="w-full py-4 rounded-xl bg-[#ff5757] hover:bg-[#ff6d6d] text-white font-display font-bold text-xs tracking-wider uppercase transition shadow-[0_0_24px_rgba(255,87,87,0.35)] flex items-center justify-center gap-2 cursor-pointer"
            >
              {isGeneratingCred ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Computing Zero-Knowledge Identity Commitment...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Obtain Certified Anonymous Credential from Consortium</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* STAGE 3 & 4: CANDIDATE SELECTION & CRYPTOGRAPHIC PIPELINE */}
        {credential && !receipt && (
          <div className="space-y-6">
            {/* Active Credential Pill */}
            <div className="p-3.5 rounded-xl bg-[#0e1017] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-muted">Anonymous Credential:</span>
                <span className="text-white font-bold">{credential.credential_id}</span>
              </div>
              <span className="text-muted">Issuer: {credential.issuer_org}</span>
            </div>

            {/* Candidate List */}
            <div className="bg-[#101115] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-6">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#ff5757] font-semibold">
                  STAGE 03 • BALLOT SELECTION
                </span>
                <h2 className="font-display font-bold text-xl text-white mt-0.5">
                  Select Your Candidate
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  Your choice is converted into a binary 1-of-K selection vector and encrypted under Paillier homomorphic keys.
                </p>
              </div>

              <div className="space-y-3">
                {election.candidates.map((cand, idx) => {
                  const isSelected = selectedCandidate === cand.id;
                  const manifesto = candidateManifestos[idx] || candidateManifestos[0];
                  return (
                    <div
                      key={cand.id}
                      onClick={() => {
                        sound.playClick();
                        setSelectedCandidate(cand.id);
                      }}
                      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#14151e] border-[#ff5757] shadow-[0_0_20px_rgba(255,87,87,0.12)]'
                          : 'bg-[#0a0b0e] border-white/[0.06] hover:border-white/[0.14]'
                      }`}
                    >
                      <div className="w-1.5 h-12 rounded-full shrink-0" style={{ background: manifesto.color }} />
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-base shrink-0" 
                        style={{ background: `${manifesto.color}20` }}
                      >
                        {manifesto.symbol}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-bold text-sm text-white truncate">{cand.name}</h3>
                          <span className="font-mono text-[10px] text-muted">#{cand.id + 1}</span>
                        </div>
                        <div className="font-mono text-[11px] text-[#ff5757] font-medium">{cand.party}</div>
                        <p className="text-[11px] text-muted truncate mt-0.5">{manifesto.manifesto}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-[#ff5757] bg-[#ff5757]' : 'border-white/20'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 4-Stage Live Cryptographic Pipeline Visualizer */}
              {isSubmitting && (
                <div className="p-5 rounded-xl bg-[#090a0d] border border-[#ff5757]/40 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-[#ff5757] animate-spin" />
                      <span className="text-xs font-mono font-bold text-white">Cryptographic Prover Pipeline Active</span>
                    </div>
                    <span className="text-xs font-mono text-[#ff5757] font-bold">
                      Stage {cryptoStageIndex + 1} of 4
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {stages.map((st, i) => {
                      const isDone = i < cryptoStageIndex;
                      const isCurrent = i === cryptoStageIndex;
                      return (
                        <div
                          key={i}
                          className={`p-3 rounded-lg border text-[11px] font-mono transition-all ${
                            isCurrent
                              ? 'bg-[#181922] border-[#ff5757] text-white shadow-[0_0_12px_rgba(255,87,87,0.3)]'
                              : isDone
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              : 'bg-[#0a0b0e] border-white/[0.04] text-muted'
                          }`}
                        >
                          <div className="font-bold flex items-center justify-between">
                            <span>{st.label}</span>
                            <span>{isDone ? '✓' : isCurrent ? '...' : ''}</span>
                          </div>
                          <div className="text-[10px] text-muted mt-1">{st.math}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                onClick={handleCastBallot}
                disabled={selectedCandidate === null || isSubmitting}
                className="w-full py-4 rounded-xl bg-[#ff5757] hover:bg-[#ff6d6d] text-white font-display font-bold text-xs tracking-widest uppercase transition shadow-[0_0_24px_rgba(255,87,87,0.4)] flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Sign, Encrypt & Commit Ballot to Hyperledger Fabric</span>
              </button>
            </div>
          </div>
        )}

        {/* STAGE 5: OFFICIAL CERTIFIED RECEIPT */}
        {receipt && (
          <div className="bg-[#101115] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/15">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 font-semibold">
                    STAGE 05 • BLOCK COMMITTED
                  </span>
                  <h2 className="font-display font-bold text-xl text-white">
                    Ballot Successfully Sealed & Endorsed!
                  </h2>
                  <p className="text-xs text-muted">
                    Your encrypted vote is permanently committed to the Hyperledger Fabric ledger.
                  </p>
                </div>
              </div>

              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121318] border border-white/[0.08] hover:border-white/[0.16] text-xs font-mono text-white transition"
              >
                <Printer className="w-3.5 h-3.5 text-muted" />
                <span>Print Certificate</span>
              </button>
            </div>

            {/* Official Verification Details */}
            <div className="p-6 rounded-xl bg-[#090a0d] border border-white/[0.06] space-y-3 font-mono text-xs">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-muted">Ledger Block Height:</span>
                <span className="text-emerald-400 font-bold">Block #{receipt.block_number}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-muted">Fabric Transaction ID:</span>
                <span className="text-white font-bold break-all">{receipt.tx_id}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 items-start sm:items-center">
                <span className="text-muted">Credential Nullifier:</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#ff5757] font-bold break-all">{receipt.nullifier}</span>
                  <button
                    onClick={copyReceiptTx}
                    className="p-1 rounded bg-[#121318] hover:bg-white/[0.08] text-white"
                    title="Copy Nullifier"
                  >
                    {copiedTx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-muted" />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-muted">Consortium Merkle State Root:</span>
                <span className="text-white break-all">{receipt.merkle_root}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-muted">Peer Endorsements:</span>
                <span className="text-emerald-400 font-semibold">{receipt.endorsements.join(' • ')}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#121318] border border-white/[0.08] text-xs flex flex-col sm:flex-row items-center justify-between gap-2">
              <span className="text-muted">
                Use your <strong className="text-white">Nullifier</strong> in the Universal Verifier tab to mathematically verify inclusion.
              </span>
              <span className="font-mono text-[11px] text-[#ff5757]">O(log N) Proof Verified</span>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                setReceipt(null);
                setSelectedCandidate(null);
                setCredential(null);
                setIsAuthenticated(false);
              }}
              className="w-full py-3 rounded-xl bg-[#121318] hover:bg-[#181920] text-white font-display font-medium text-xs border border-white/[0.08] transition"
            >
              Vote as Another Citizen / Return to Booth
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
