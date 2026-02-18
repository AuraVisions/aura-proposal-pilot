import React, { useState, useEffect } from 'react';
import { Proposal, Phase, PhaseStatus, ProposalStatus, AuditLog } from '../types';
import { FIELD_LABELS } from '../constants';
import { downloadProposalPDF } from '../services/pdfService';

interface ClientPortalProps {
  proposal: Proposal;
  onUpdate: (proposal: Proposal) => void;
  onClose: () => void;
  currentUser: { id: string; name: string };
}

const ClientPortal: React.FC<ClientPortalProps> = ({ proposal, onUpdate, onClose, currentUser }) => {
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectFeedback, setRejectFeedback] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const activePhase = proposal.phases[activePhaseIndex];
  // Client can only act on phases that are officially SUBMITTED
  const canAct = activePhase.status === PhaseStatus.SUBMITTED;
  
  // Client should only see content if it's NOT in DRAFT status
  const isPublic = activePhase.status !== PhaseStatus.DRAFT;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activePhaseIndex]);

  const isAccessible = (index: number) => {
    if (index === 0) return true;
    return proposal.phases[index - 1].status === PhaseStatus.APPROVED;
  };

  const createLog = (action: AuditLog['action'], details: string): AuditLog => ({
    id: Math.random().toString(36).substr(2, 9),
    userId: currentUser.id,
    userName: currentUser.name,
    action,
    timestamp: new Date().toISOString(),
    details
  });

  const handleDownload = async () => {
    setIsExporting(true);
    await downloadProposalPDF(proposal);
    setIsExporting(false);
  };

  const handleApprove = () => {
    const log = createLog('APPROVE', `Approved phase: ${activePhase.title}`);
    const updatedPhases = [...proposal.phases];
    updatedPhases[activePhaseIndex] = {
      ...activePhase,
      status: PhaseStatus.APPROVED,
      approvalTimestamp: log.timestamp,
      approvedBy: currentUser.name,
      logs: [log, ...(activePhase.logs || [])]
    };

    const allApproved = updatedPhases.every(p => p.status === PhaseStatus.APPROVED);
    
    onUpdate({
      ...proposal,
      phases: updatedPhases,
      status: allApproved ? ProposalStatus.COMPLETED : ProposalStatus.IN_REVIEW,
      logs: [log, ...proposal.logs]
    });
    
    alert("This phase has been successfully approved.");
  };

  const handleReject = () => {
    if (!rejectFeedback.trim()) {
      alert("Please provide feedback for the rejection.");
      return;
    }

    const log = createLog('REJECT', `Rejected phase: ${activePhase.title} with feedback: ${rejectFeedback.substring(0, 30)}...`);
    const updatedPhases = [...proposal.phases];
    updatedPhases[activePhaseIndex] = {
      ...activePhase,
      status: PhaseStatus.REJECTED,
      feedback: rejectFeedback,
      logs: [log, ...(activePhase.logs || [])]
    };

    onUpdate({
      ...proposal,
      phases: updatedPhases,
      status: ProposalStatus.REJECTED,
      logs: [log, ...proposal.logs]
    });
    
    setShowRejectModal(false);
    setRejectFeedback('');
    alert("Phase rejected. The agency has been notified.");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-10 pb-16">
      <div className="bg-slate-900 text-white p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 md:p-12 opacity-10">
          <svg className="w-20 h-20 md:w-32 md:h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight max-w-xl">{proposal.title}</h1>
            <div className="flex flex-wrap items-center gap-3">
              <span className={`px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${
                proposal.status === ProposalStatus.COMPLETED ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/30' : 'bg-blue-600/30 text-blue-300 border-blue-500/30'
              }`}>
                {proposal.status.replace('_', ' ')}
              </span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secure Client Portal</span>
            </div>
          </div>
          {proposal.status === ProposalStatus.COMPLETED && (
            <button 
              onClick={handleDownload}
              className="bg-white text-slate-900 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition flex items-center justify-center space-x-2 shrink-0 shadow-2xl active:scale-95"
            >
              <svg className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              <span>{isExporting ? 'Preparing PDF...' : 'Download Official Proposal'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10">
        <div className="md:col-span-3">
          <div className="bg-white md:bg-transparent p-4 md:p-0 border md:border-0 border-slate-200 rounded-2xl space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] px-2">Review Matrix</h4>
            <div className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              {proposal.phases.map((phase, idx) => {
                const accessible = isAccessible(idx);
                return (
                  <button
                    key={phase.id}
                    disabled={!accessible}
                    onClick={() => setActivePhaseIndex(idx)}
                    className={`shrink-0 md:w-full text-left p-4 rounded-xl transition-all group flex items-center space-x-3 whitespace-nowrap md:whitespace-normal ${
                      activePhaseIndex === idx 
                        ? 'bg-white shadow-lg ring-1 ring-slate-100 text-slate-900 font-black' 
                        : accessible 
                          ? 'text-slate-500 hover:bg-white hover:shadow-md' 
                          : 'text-slate-300 cursor-not-allowed opacity-40'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${
                      phase.status === PhaseStatus.APPROVED ? 'bg-emerald-100 text-emerald-600' : 
                      activePhaseIndex === idx ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {idx + 1}
                    </div>
                    <span className="text-xs tracking-tight">{phase.title.split(': ')[1]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="md:col-span-6 space-y-6">
          <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden min-h-[500px]">
            <div className="p-5 md:p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/20">
              <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{activePhase.title}</h3>
              <div className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest self-start md:self-auto border ${
                activePhase.status === PhaseStatus.APPROVED ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                activePhase.status === PhaseStatus.REJECTED ? 'bg-rose-50 text-rose-700 border-rose-100' :
                'bg-amber-50 text-amber-700 border-amber-100'
              }`}>{activePhase.status}</div>
            </div>

            <div className="p-5 md:p-10 space-y-8 md:space-y-12">
              {!isPublic ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-300 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-black text-slate-900">Work in Progress</h4>
                    <p className="text-sm text-slate-400 font-medium">The agency is currently finalizing the strategy for this phase.</p>
                  </div>
                </div>
              ) : (
                Object.keys(activePhase.fields).map((fieldKey) => (
                  <div key={fieldKey} className="space-y-3">
                    <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-sm"></span>
                      <span>{FIELD_LABELS[fieldKey]}</span>
                    </h4>
                    <div className="text-slate-800 leading-relaxed text-sm md:text-base font-medium bg-slate-50/30 p-5 md:p-8 rounded-2xl border border-slate-100/50">
                      {activePhase.fields[fieldKey] ? (
                        <div className="whitespace-pre-wrap">{activePhase.fields[fieldKey]}</div>
                      ) : (
                        <em className="text-slate-300 font-normal italic">No content provided for this section.</em>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {canAct && (
              <div className="p-6 md:p-10 bg-slate-900 border-t border-slate-800 flex flex-col gap-6 items-center">
                <div className="text-white/60 text-center space-y-1">
                  <p className="font-black text-white uppercase tracking-[0.3em] text-[10px]">Review Authorization</p>
                  <p className="text-xs md:text-sm">Formal approval will finalize and lock this phase for implementation.</p>
                </div>
                <div className="flex gap-4 w-full max-w-sm justify-center">
                  <button onClick={() => setShowRejectModal(true)} className="flex-1 py-3.5 bg-transparent border border-slate-700 text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:text-white hover:border-slate-500 transition">Request Edits</button>
                  <button onClick={handleApprove} className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 shadow-xl transition active:scale-95">Approve Phase</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-3">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-6 sticky top-24">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] flex items-center space-x-2">
              <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              <span>Audit Trail</span>
            </h4>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 no-scrollbar">
              {activePhase.logs && activePhase.logs.length > 0 ? (
                activePhase.logs.filter(l => ['APPROVE', 'REJECT', 'SUBMIT'].includes(l.action)).map((log) => (
                  <div key={log.id} className="border-l-2 border-slate-100 pl-4 py-0.5 space-y-1">
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                      <span className={log.action === 'APPROVE' ? 'text-emerald-500' : log.action === 'REJECT' ? 'text-rose-500' : 'text-blue-500'}>{log.action}</span>
                      <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 leading-tight">{log.details}</p>
                  </div>
                ))
              ) : (
                <p className="text-[10px] font-medium text-slate-300 italic">No formal actions recorded.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] max-w-lg w-full p-8 md:p-10 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-black text-slate-900 mb-1 tracking-tight">Request Refinement</h3>
            <p className="text-slate-500 mb-8 text-xs font-medium">Please detail the required strategic adjustments.</p>
            <textarea
              autoFocus
              value={rejectFeedback}
              onChange={(e) => setRejectFeedback(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm md:text-base font-medium focus:bg-white focus:ring-4 focus:ring-rose-50 focus:border-rose-400 transition-all min-h-[160px] mb-6 outline-none"
              placeholder="E.g. Please clarify the automation roadmap..."
            />
            <div className="flex space-x-3">
              <button onClick={() => setShowRejectModal(false)} className="flex-1 py-3.5 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-900 transition">Cancel</button>
              <button onClick={handleReject} className="flex-1 py-3.5 bg-rose-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 transition active:scale-95 shadow-lg shadow-rose-100">Send Feedback</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientPortal;