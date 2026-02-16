import React, { useState } from 'react';
import { Proposal, Phase, PhaseStatus, ProposalStatus, AuditLog } from '../types';
import { FIELD_LABELS } from '../constants';
import { generatePhaseContent } from '../services/geminiService';
import { downloadProposalPDF } from '../services/pdfService';

interface ProposalEditorProps {
  proposal: Proposal;
  onUpdate: (proposal: Proposal) => void;
  onClose: () => void;
  currentUser: { id: string; name: string };
}

const ProposalEditor: React.FC<ProposalEditorProps> = ({ proposal, onUpdate, onClose, currentUser }) => {
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const activePhase = proposal.phases[activePhaseIndex];
  const isEditable = activePhase.status === PhaseStatus.DRAFT || activePhase.status === PhaseStatus.REJECTED;

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

  const handleFieldChange = (key: string, value: string) => {
    const updatedPhases = [...proposal.phases];
    updatedPhases[activePhaseIndex] = {
      ...activePhase,
      fields: { ...activePhase.fields, [key]: value }
    };
    onUpdate({ ...proposal, phases: updatedPhases });
  };

  const logManualUpdate = (key: string) => {
    setIsSaving(true);
    const log = createLog('UPDATE', `Updated ${FIELD_LABELS[key] || key}`);
    const updatedPhases = [...proposal.phases];
    updatedPhases[activePhaseIndex] = {
      ...activePhase,
      logs: [log, ...(activePhase.logs || [])].slice(0, 30)
    };
    onUpdate({ ...proposal, phases: updatedPhases });
    setTimeout(() => setIsSaving(false), 500);
  };

  const handleTitleChange = (title: string) => {
    setIsSaving(true);
    onUpdate({ ...proposal, title });
    setTimeout(() => setIsSaving(false), 500);
  };

  const submitForReview = () => {
    setIsSaving(true);
    const log = createLog('SUBMIT', `Submitted phase ${activePhase.id}`);
    const updatedPhases = [...proposal.phases];
    updatedPhases[activePhaseIndex] = { 
      ...activePhase, 
      status: PhaseStatus.SUBMITTED,
      logs: [log, ...(activePhase.logs || [])]
    };
    
    onUpdate({ 
      ...proposal, 
      phases: updatedPhases, 
      status: ProposalStatus.IN_REVIEW,
      logs: [log, ...proposal.logs]
    });
    setTimeout(() => setIsSaving(false), 500);
  };

  const handleMagicFill = async (fieldName: string) => {
    setIsGenerating(true);
    setIsSaving(true);
    const context = proposal.phases[0].fields.businessOverview + " " + proposal.phases[0].fields.currentChallenges;
    const content = await generatePhaseContent(FIELD_LABELS[fieldName], context);
    
    if (content) {
      const log = createLog('AI_GENERATE', `AI assisted drafting: ${FIELD_LABELS[fieldName]}`);
      const updatedPhases = [...proposal.phases];
      updatedPhases[activePhaseIndex] = {
        ...activePhase,
        fields: { ...activePhase.fields, [fieldName]: content },
        logs: [log, ...(activePhase.logs || [])]
      };
      onUpdate({ ...proposal, phases: updatedPhases });
    }
    setIsGenerating(false);
    setTimeout(() => setIsSaving(false), 500);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 space-y-8 font-sans px-4">
      {/* Editor Header */}
      <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1 flex-grow w-full">
          <input 
            type="text" 
            value={proposal.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="text-2xl font-extrabold text-slate-900 border-none p-0 focus:ring-0 bg-transparent w-full tracking-tight"
            placeholder="Proposal Project Title"
          />
          <div className="flex items-center space-x-3 text-[10px] font-bold uppercase tracking-widest">
            <span className="text-slate-400">Client:</span>
            <span className="text-slate-900">{proposal.clientName}</span>
            <div className="h-1 w-1 bg-slate-200 rounded-full"></div>
            {isSaving ? <span className="text-blue-500 animate-pulse">Syncing...</span> : <span className="text-emerald-500">All Changes Saved</span>}
          </div>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          {proposal.status === ProposalStatus.COMPLETED && (
            <button 
              onClick={() => downloadProposalPDF(proposal)}
              className="bg-slate-900 text-white px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-soft"
            >
              Export PDF
            </button>
          )}
          <button 
            onClick={onClose}
            className="px-5 py-2 bg-slate-50 text-slate-500 hover:text-slate-900 rounded-lg text-xs font-bold uppercase tracking-widest transition-soft border border-slate-100"
          >
            Exit Hub
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3">
          <div className="sticky top-24 space-y-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Project Phases</h4>
            <div className="space-y-1">
              {proposal.phases.map((phase, idx) => {
                const accessible = isAccessible(idx);
                const isActive = activePhaseIndex === idx;
                return (
                  <button
                    key={phase.id}
                    disabled={!accessible}
                    onClick={() => setActivePhaseIndex(idx)}
                    className={`w-full text-left p-4 rounded-lg transition-soft flex items-center justify-between border ${
                      isActive 
                        ? 'border-blue-600 bg-blue-50 text-slate-900 font-bold shadow-sm' 
                        : accessible 
                          ? 'border-transparent bg-white hover:bg-slate-50 text-slate-500' 
                          : 'bg-transparent text-slate-300 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${
                        phase.status === PhaseStatus.APPROVED ? 'bg-emerald-500 text-white' : 
                        isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {idx + 1}
                      </div>
                      <span className="text-xs tracking-tight">{phase.title.split(': ')[1]}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Editor Main */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px]">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">{activePhase.title}</h3>
              <div className="px-3 py-1 bg-white border border-slate-200 rounded text-[9px] font-bold uppercase tracking-widest text-slate-500">
                {activePhase.status}
              </div>
            </div>

            <div className="p-8 space-y-10">
              {Object.keys(activePhase.fields).map((fieldKey) => (
                <div key={fieldKey} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {FIELD_LABELS[fieldKey]}
                    </label>
                    {isEditable && (
                      <button 
                        onClick={() => handleMagicFill(fieldKey)}
                        className="flex items-center space-x-1.5 text-blue-600 hover:text-blue-800 transition-soft"
                        disabled={isGenerating}
                      >
                         <svg className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        <span className="text-[9px] font-bold tracking-widest uppercase">{isGenerating ? 'Thinking...' : 'AI Assist'}</span>
                      </button>
                    )}
                  </div>
                  {isEditable ? (
                    <textarea
                      value={activePhase.fields[fieldKey]}
                      onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
                      onBlur={() => logManualUpdate(fieldKey)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-5 text-slate-800 text-sm focus:bg-white focus:border-blue-400 transition-soft min-h-[160px] leading-relaxed font-medium"
                      placeholder="Enter strategic content details here..."
                    />
                  ) : (
                    <div className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-6 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                      {activePhase.fields[fieldKey] || "Section pending population."}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
               <button 
                onClick={() => setActivePhaseIndex(Math.max(0, activePhaseIndex - 1))}
                disabled={activePhaseIndex === 0}
                className="text-[10px] font-bold uppercase tracking-widest text-slate-400 disabled:opacity-30 hover:text-slate-900 transition-soft"
              >
                Previous Phase
              </button>
              {isEditable && (
                <button 
                  onClick={submitForReview}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-soft shadow-md"
                >
                  Send for Client Review
                </button>
              )}
              {activePhaseIndex < proposal.phases.length - 1 && !isEditable && (
                 <button 
                  onClick={() => setActivePhaseIndex(activePhaseIndex + 1)}
                  className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-soft"
                >
                  Next Phase
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Activity Sidebar */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sticky top-24">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center space-x-2">
              <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>Recent Activity</span>
            </h4>
            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-1 no-scrollbar">
              {activePhase.logs && activePhase.logs.length > 0 ? (
                activePhase.logs.map((log) => (
                  <div key={log.id} className="border-l border-slate-100 pl-4 space-y-1">
                    <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest">
                      <span className="text-blue-600">{log.userName}</span>
                      <span className="text-slate-300 font-medium">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-900 leading-tight">{log.details}</p>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic opacity-50">No logs yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalEditor;