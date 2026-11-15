import React, { useState } from 'react';
import { Shield, Lock, User, ArrowRight, Fingerprint, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { sound } from '../services/sound';

interface LoginPageProps {
  onLoginSuccess: (user: any) => void;
  onCancel: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onCancel }) => {
  const demoVoters = [
    { id: 'VOTER-001', name: 'Poorna Chandra DH', usn: '4PS23IS039', dept: 'Information Science & Engg.' },
    { id: 'VOTER-002', name: 'Vikas B', usn: '4PS23IS064', dept: 'Information Science & Engg.' },
    { id: 'VOTER-003', name: 'Darshan C', usn: '4PS23IS007', dept: 'Information Science & Engg.' },
    { id: 'VOTER-004', name: 'Karthik S', usn: '4PS23IS027', dept: 'Information Science & Engg.' },
    { id: 'VOTER-005', name: 'Alice Smith', usn: '4PS23IS099', dept: 'Information Science & Engg.' },
  ];

  const [voterId, setVoterId] = useState(demoVoters[0].id);
  const [password, setPassword] = useState('password123');
  const [usePasskey, setUsePasskey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    sound.playClick();

    try {
      if (usePasskey) {
        sound.playScan();
        await new Promise(r => setTimeout(r, 600));
      }
      const data = await api.loginVoter(voterId, password);
      sound.playSuccess();
      const matchedProfile = demoVoters.find(v => v.id === voterId) || {
        id: voterId,
        name: voterId,
        usn: voterId,
        dept: 'Electoral Registry'
      };
      onLoginSuccess({
        ...matchedProfile,
        token: data.access_token,
      });
    } catch (err: any) {
      sound.playAlert();
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDemo = (voter: typeof demoVoters[0]) => {
    sound.playClick();
    setVoterId(voter.id);
    setPassword('password123');
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-white mx-auto mb-4">
            <Shield className="w-5 h-5 text-blue-500" />
          </div>
          <h1 className="font-display font-bold text-2xl text-white tracking-tight">
            Institutional Identity Gateway
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            NIST SP 800-63-3 Identity Assurance Level 2 (IAL2)
          </p>
        </div>

        {/* Login Card */}
        <div className="p-6 sm:p-8 rounded-xl bg-[#121215] border border-white/[0.08] shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1.5">
                Voter ID / Institutional USN
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={voterId}
                  onChange={(e) => setVoterId(e.target.value)}
                  placeholder="e.g. VOTER-001 or 4PS23IS039"
                  className="w-full h-10 bg-[#09090b] border border-white/[0.1] rounded-md px-3 font-mono text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1.5">
                Secret Passphrase
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-10 bg-[#09090b] border border-white/[0.1] rounded-md px-3 font-mono text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-400">
                <input
                  type="checkbox"
                  checked={usePasskey}
                  onChange={(e) => setUsePasskey(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-900 text-blue-600 focus:ring-0"
                />
                <span className="flex items-center gap-1.5">
                  <Fingerprint className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Simulate FIDO2 Passkey</span>
                </span>
              </label>
              <span className="text-[11px] font-mono text-zinc-500">AES-256</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <span>Authenticating with Consortium...</span>
              ) : (
                <>
                  <span>Sign In & Unlock Ballot</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="mt-6 pt-5 border-t border-white/[0.06]">
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block mb-2">
              Select Demo Citizen Profile
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {demoVoters.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => handleSelectDemo(v)}
                  className={`p-2 rounded text-left transition-colors border text-[11px] font-mono ${
                    voterId === v.id
                      ? 'bg-blue-500/10 border-blue-500/40 text-blue-300'
                      : 'bg-white/[0.02] border-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="font-semibold truncate">{v.name}</div>
                  <div className="text-[10px] text-zinc-500">{v.usn}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={onCancel}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            ← Return to Overview
          </button>
        </div>
      </div>
    </div>
  );
};
