import React, { useState } from 'react';
import { UserRole, Proposal, AuthState } from './types.ts';
import Dashboard from './components/Dashboard.tsx';
import ProposalEditor from './components/ProposalEditor.tsx';
import ClientPortal from './components/ClientPortal.tsx';
import LandingPage from './components/LandingPage.tsx';
import Navigation from './components/Navigation.tsx';

/**
 * Main application component. 
 * Local persistence and mock data sources have been removed in preparation 
 * for Supabase/external database integration.
 */
const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({ user: null });
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [activeProposalId, setActiveProposalId] = useState<string | null>(null);
  const [isDataLoaded] = useState(true);

  // Authentication logic (session-only, ready for Auth provider)
  const handleLogin = (role: UserRole, name?: string) => {
    setAuth({
      user: {
        id: Math.random().toString(36).substring(2, 9),
        name: name || (role === UserRole.AGENCY_ADMIN ? 'Agency Admin' : 'Client User'),
        role,
        clientId: role === UserRole.CLIENT ? 'client-aura-01' : undefined
      }
    });
  };

  const handleLogout = () => {
    setAuth({ user: null });
    setActiveProposalId(null);
  };

  /**
   * Data Access Stubs
   * These interfaces are preserved for frontend compatibility but logic 
   * is removed to ensure no local or mock persistence exists.
   */
  const createProposal = async () => {
    // Logic for database record creation to be implemented in next phase
    console.debug("Backend Action Required: Create Proposal");
  };

  const updateProposal = async (updated: Proposal) => {
    // Optimistic UI update for the current session
    setProposals(prev => prev.map(p => p.id === updated.id ? updated : p));
    // Logic for database record update to be implemented in next phase
    console.debug("Backend Action Required: Update Proposal", updated.id);
  };

  const deleteProposal = async (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this proposal project?')) {
      setProposals(prev => prev.filter(p => p.id !== id));
      if (activeProposalId === id) setActiveProposalId(null);
      // Logic for database record deletion to be implemented in next phase
      console.debug("Backend Action Required: Delete Proposal", id);
    }
  };

  const activeProposal = proposals.find(p => p.id === activeProposalId);

  if (!isDataLoaded) return null;

  if (!auth.user) {
    return <LandingPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navigation 
        user={auth.user} 
        onLogout={handleLogout} 
        onHome={() => setActiveProposalId(null)} 
      />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {!activeProposalId ? (
          <Dashboard 
            proposals={proposals}
            role={auth.user.role}
            onCreate={createProposal}
            onView={(id) => setActiveProposalId(id)}
            onDelete={deleteProposal}
          />
        ) : activeProposal ? (
          auth.user.role === UserRole.AGENCY_ADMIN ? (
            <ProposalEditor 
              proposal={activeProposal}
              onUpdate={updateProposal}
              onClose={() => setActiveProposalId(null)}
              currentUser={auth.user}
            />
          ) : (
            <ClientPortal 
              proposal={activeProposal}
              onUpdate={updateProposal}
              onClose={() => setActiveProposalId(null)}
              currentUser={auth.user}
            />
          )
        ) : (
          <div className="max-w-md mx-auto bg-white p-12 rounded-3xl border border-slate-200 text-center shadow-2xl mt-20">
            <h2 className="text-2xl font-black text-slate-900 mb-2">Project Not Found</h2>
            <p className="text-slate-500 mb-8">The project you are attempting to access does not exist or has been archived.</p>
            <button 
              onClick={() => setActiveProposalId(null)}
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-blue-600 transition"
            >
              Return to Command Center
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;