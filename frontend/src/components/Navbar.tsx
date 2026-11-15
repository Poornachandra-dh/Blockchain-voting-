import React from 'react';
import { Shield, CheckCircle2, User, LogOut, ArrowRight } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  currentUser: any | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  setCurrentPage,
  currentUser,
  onLogout,
}) => {
  const navItems = [
    { id: 'landing', label: 'Overview' },
    { id: 'voting', label: 'Voting Portal' },
    { id: 'consortium', label: '3-Org Consortium' },
    { id: 'results', label: 'Results' },
    { id: 'verifier', label: 'Audit Verifier' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#09090b]/80 backdrop-blur-md border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={() => setCurrentPage('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-white transition-colors group-hover:border-blue-500/50">
            <Shield className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold text-sm tracking-tight text-white">
              AegisVote
            </span>
            <span className="text-[10px] font-mono text-zinc-500 border border-zinc-800 rounded px-1.5 py-0.5">
              Consortium
            </span>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-white bg-white/[0.08]'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Status & Auth */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-zinc-400 bg-white/[0.03] border border-white/[0.06] rounded-full px-2.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Fabric 2.5 Active</span>
          </div>

          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-300 bg-white/[0.05] border border-white/[0.08] rounded-md px-2.5 py-1.5">
                <User className="w-3.5 h-3.5 text-blue-400" />
                <span>{currentUser.name}</span>
                <span className="text-[10px] text-zinc-500">({currentUser.usn})</span>
              </div>
              <button
                onClick={onLogout}
                title="Sign Out"
                className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCurrentPage('login')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-sm"
            >
              <span>Voter Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
