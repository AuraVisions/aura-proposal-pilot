import React from 'react';
import { Proposal, UserRole, ProposalStatus } from '../types.ts';

interface DashboardProps {
  proposals: Proposal[];
  role: UserRole;
  onCreate: () => void;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ proposals, role, onCreate, onView, onDelete }) => {
  const getStatusBadge = (status: ProposalStatus) => {
    const baseClasses = "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border";
    switch (status) {
      case ProposalStatus.DRAFT: return `${baseClasses} bg-slate-50 text-slate-500 border-slate-200`;
      case ProposalStatus.IN_REVIEW: return `${baseClasses} bg-blue-50 text-blue-600 border-blue-200`;
      case ProposalStatus.APPROVED: return `${baseClasses} bg-emerald-50 text-emerald-600 border-emerald-200`;
      case ProposalStatus.REJECTED: return `${baseClasses} bg-rose-50 text-rose-600 border-rose-200`;
      case ProposalStatus.COMPLETED: return `${baseClasses} bg-slate-900 text-white border-slate-900`;
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-10 font-sans px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {role === UserRole.AGENCY_ADMIN ? 'Proposal Dashboard' : 'Your Proposals'}
          </h1>
          <p className="text-sm text-slate-500 font-medium">Manage and monitor current proposal workflows.</p>
        </div>
        
        {role === UserRole.AGENCY_ADMIN && (
          <button 
            onClick={onCreate}
            className="w-full md:w-auto bg-slate-900 text-white px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-soft flex items-center justify-center space-x-2"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            <span>New Proposal</span>
          </button>
        )}
      </div>

      {proposals.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-20 text-center">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900">No active projects</h3>
          <p className="text-slate-400 mt-2 text-sm font-medium">Initialize a new project to start the drafting process.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {proposals.map(proposal => (
            <div 
              key={proposal.id} 
              className="group bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between hover:border-slate-400 transition-soft gap-6"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-soft">{proposal.title}</h3>
                  {getStatusBadge(proposal.status)}
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Client: {proposal.clientName}</span>
                  <div className="h-1 w-1 bg-slate-200 rounded-full"></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Updated {new Date(proposal.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => onView(proposal.id)}
                  className="flex-grow md:flex-none px-6 py-2.5 bg-slate-900 text-white rounded-lg font-bold text-[11px] uppercase tracking-widest hover:bg-slate-800 transition-soft"
                >
                  View Details
                </button>
                {role === UserRole.AGENCY_ADMIN && (
                  <button 
                    onClick={() => onDelete(proposal.id)}
                    className="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-soft"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;