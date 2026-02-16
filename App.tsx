import React, { useState, useEffect } from 'react';
import { UserRole, Proposal, AuthState, ProposalStatus, PhaseStatus } from './types.ts';
import Dashboard from './components/Dashboard.tsx';
import ProposalEditor from './components/ProposalEditor.tsx';
import ClientPortal from './components/ClientPortal.tsx';
import LandingPage from './components/LandingPage.tsx';
import Navigation from './components/Navigation.tsx';
import { supabase } from './supabaseClient.js';

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({ user: null });
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [activeProposalId, setActiveProposalId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Initialize Auth Session & Listen for changes
  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        handleAuthChange(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth state changes (Sign In, Sign Up, Sign Out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        handleAuthChange(session.user);
      } else {
        setAuth({ user: null });
        setProposals([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthChange = (supabaseUser: any) => {
    // Determine role (for this simple logic, we check metadata or defaults)
    const role = supabaseUser.user_metadata?.role || UserRole.AGENCY_ADMIN;
    setAuth({
      user: {
        id: supabaseUser.id,
        name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'User',
        role: role as UserRole,
        clientId: role === UserRole.CLIENT ? 'client-default' : undefined
      }
    });
    setLoading(false);
  };

  // 2. Fetch data when auth changes
  useEffect(() => {
    if (auth.user) {
      fetchProposals();
    }
  }, [auth.user]);

  const fetchProposals = async () => {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .order('updatedAt', { ascending: false });

      if (error) throw error;
      if (data) setProposals(data);
    } catch (err) {
      console.error("Error fetching proposals:", err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuth({ user: null });
    setActiveProposalId(null);
    setProposals([]);
  };

  const createProposal = async () => {
    const newProposal: Partial<Proposal> = {
      title: 'New Strategic Proposal',
      clientName: 'New Client',
      status: ProposalStatus.DRAFT,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      logs: [],
      phases: [
        { id: 1, title: 'Phase 1: Discovery & Strategy', status: PhaseStatus.DRAFT, fields: { businessOverview: '', currentChallenges: '' }, logs: [] },
        { id: 2, title: 'Phase 2: Solution Architecture', status: PhaseStatus.DRAFT, fields: { proposedSolution: '', toolsTechnologies: '' }, logs: [] },
        { id: 3, title: 'Phase 3: Scope & Execution', status: PhaseStatus.DRAFT, fields: { projectDuration: '', milestoneBreakdown: '' }, logs: [] },
        { id: 4, title: 'Phase 4: Financial Investment', status: PhaseStatus.DRAFT, fields: { setupFee: '', monthlyFee: '' }, logs: [] },
        { id: 5, title: 'Phase 5: Agreement & Authorization', status: PhaseStatus.DRAFT, fields: { finalSummary: '', legalDisclaimer: '' }, logs: [] }
      ]
    };

    try {
      const { data, error } = await supabase
        .from('proposals')
        .insert([newProposal])
        .select();

      if (error) throw error;
      if (data) {
        setProposals([data[0], ...proposals]);
        setActiveProposalId(data[0].id);
      }
    } catch (err) {
      console.error("Failed to create proposal:", err);
    }
  };

  const updateProposal = async (updated: Proposal) => {
    setProposals(prev => prev.map(p => p.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : p));
    try {
      const { error } = await supabase
        .from('proposals')
        .update({ ...updated, updatedAt: new Date().toISOString() })
        .eq('id', updated.id);
      if (error) throw error;
    } catch (err) {
      console.error("Failed to sync update:", err);
    }
  };

  const deleteProposal = async (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this proposal?')) {
      try {
        const { error } = await supabase.from('proposals').delete().eq('id', id);
        if (error) throw error;
        setProposals(prev => prev.filter(p => p.id !== id));
        if (activeProposalId === id) setActiveProposalId(null);
      } catch (err) {
        console.error("Failed to delete proposal:", err);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (!auth.user) {
    return <LandingPage />;
  }

  const activeProposal = proposals.find(p => p.id === activeProposalId);

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