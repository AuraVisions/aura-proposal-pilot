import React from 'react';
import { UserRole } from '../types.ts';

interface NavigationProps {
  user: { name: string; role: UserRole } | null;
  onLogout: () => void;
  onHome: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ user, onLogout, onHome }) => {
  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50 h-16 flex items-center font-sans">
      <div className="container mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center space-x-2 cursor-pointer group" onClick={onHome}>
          <div className="bg-slate-900 p-1 rounded group-hover:bg-blue-600 transition-soft">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
          <span className="text-sm font-extrabold tracking-tight text-slate-900 uppercase">Aura Proposal Pilot</span>
        </div>

        {user && (
          <div className="flex items-center space-x-6">
            <div className="hidden sm:flex items-center space-x-3">
              <span className="text-xs font-bold text-slate-900">{user.name}</span>
              <span className="px-2 py-0.5 bg-slate-50 text-slate-400 rounded text-[9px] font-bold uppercase tracking-widest border border-slate-200/50">
                {user.role.replace('_', ' ')}
              </span>
            </div>
            <button 
              onClick={onLogout}
              className="text-[10px] font-bold text-slate-400 hover:text-rose-600 uppercase tracking-widest transition-soft"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;