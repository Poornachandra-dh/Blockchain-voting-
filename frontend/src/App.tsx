import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { VotingPortal } from './components/VotingPortal';
import { ConsortiumPage } from './components/ConsortiumPage';
import { ResultsPage } from './components/ResultsPage';
import { VerifierPage } from './components/VerifierPage';
import { api, Election } from './services/api';
import { Shield } from 'lucide-react';

export function App() {
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [election, setElection] = useState<Election | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchElection = async () => {
    try {
      const elections = await api.getElections();
      if (elections.length > 0) {
        setElection(elections[0]);
      }
    } catch (e) {
      console.error("Backend connection error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElection();
    const interval = setInterval(fetchElection, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleLoginSuccess = (user: any) => {
    setCurrentUser(user);
    setCurrentPage('voting');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('landing');
  };

  if (loading || !election) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-blue-500 animate-pulse">
          <Shield className="w-5 h-5" />
        </div>
        <p className="text-xs font-mono text-zinc-400 tracking-wider">
          Connecting to Hyperledger Fabric Consortium...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5] enterprise-grid">
      <div className="fixed inset-0 hero-glow pointer-events-none z-0"></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {currentPage === 'landing' && (
            <LandingPage
              election={election}
              onNavigate={(page) => setCurrentPage(page)}
            />
          )}

          {currentPage === 'login' && (
            <LoginPage
              onLoginSuccess={handleLoginSuccess}
              onCancel={() => setCurrentPage('landing')}
            />
          )}

          {currentPage === 'voting' && (
            <VotingPortal
              election={election}
              currentUser={currentUser}
              onBallotCast={fetchElection}
              onRequireLogin={() => setCurrentPage('login')}
            />
          )}

          {currentPage === 'consortium' && (
            <ConsortiumPage
              election={election}
              onTallyExecuted={fetchElection}
              onNavigateToResults={() => setCurrentPage('results')}
            />
          )}

          {currentPage === 'results' && (
            <ResultsPage
              election={election}
              onNavigateToConsortium={() => setCurrentPage('consortium')}
            />
          )}

          {currentPage === 'verifier' && (
            <VerifierPage election={election} />
          )}
        </main>

        {/* Minimalist Enterprise Footer */}
        <footer className="w-full border-t border-white/[0.06] bg-[#09090b] py-12 px-4 sm:px-6 lg:px-8 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-semibold text-sm text-white">AegisVote</span>
                <span className="text-[10px] font-mono text-zinc-500">Academic Specification 2026–27</span>
              </div>
              <p className="text-xs text-zinc-500 mt-1 max-w-md">
                Department of Information Science & Engineering, PES College of Engineering, Mandya.
              </p>
            </div>

            <div className="font-mono text-xs text-zinc-400 space-y-1 text-left md:text-right">
              <div>Research: Poorna Chandra DH • Vikas B • Darshan C • Karthik S</div>
              <div className="text-zinc-500 text-[11px]">Supervisor: Dr. Rakshith N</div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
