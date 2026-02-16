import React, { useState } from 'react';
import { UserRole } from '../types.ts';

interface LandingPageProps {
  onLogin: (role: UserRole, name?: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [adminName, setAdminName] = useState('');

  const handleAdminLogin = () => {
    onLogin(UserRole.AGENCY_ADMIN, adminName || 'Agency Operator');
  };

  const scrollToHowItWorks = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById('how-it-works');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <header className="border-b border-slate-100 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-slate-900 p-1.5 rounded">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <span className="font-extrabold text-sm tracking-tight text-slate-900 uppercase">Proposal Pilot</span>
          </div>
          
          <div className="flex items-center space-x-8">
            <button 
              onClick={scrollToHowItWorks}
              className="hidden md:block text-[10px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-[0.2em] transition-soft"
            >
              How it Works
            </button>
            <button 
              onClick={() => onLogin(UserRole.CLIENT)}
              className="text-[10px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-[0.2em] transition-soft"
            >
              Client Login
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col bg-white">
        <section className="flex items-center py-20 bg-gradient-to-b from-slate-50/50 to-white">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
                
                <div className="space-y-10">
                  <div className="space-y-6">
                    <h1 className="text-5xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight">
                      <span className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-700 bg-clip-text text-transparent">
                        Generate Professional Proposals.
                      </span>
                    </h1>
                    
                    <p className="text-lg text-slate-500 leading-relaxed font-medium max-w-md">
                      Structured workflows for agencies to build, track, and finalize business proposals with built-in client approval portals.
                    </p>
                  </div>

                  <div className="space-y-5">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <p className="text-sm font-bold text-slate-700 uppercase tracking-wide">Phase-Based Drafting</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <p className="text-sm font-bold text-slate-700 uppercase tracking-wide">Secure Client Portal</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 p-8 lg:p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-slate-900">Operator Login</h2>
                    <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-widest">Internal Proposal Management</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Operator Identity</label>
                      <input 
                        type="text" 
                        placeholder="Enter name"
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-medium focus:border-blue-500 transition-soft outline-none bg-slate-50/50 focus:bg-white"
                      />
                    </div>
                    
                    <button 
                      onClick={handleAdminLogin}
                      className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-soft shadow-lg active:scale-[0.98]"
                    >
                      Enter Hub
                    </button>

                    <div className="relative py-4 flex items-center justify-center">
                      <div className="absolute w-full h-px bg-slate-100"></div>
                      <span className="relative bg-white px-4 text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">Access</span>
                    </div>

                    <button 
                      onClick={() => onLogin(UserRole.CLIENT)}
                      className="w-full bg-white border border-slate-200 text-slate-600 py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:border-slate-400 transition-soft active:scale-[0.98]"
                    >
                      Client Sign-In
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-24 bg-white border-y border-slate-100 scroll-mt-header">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto space-y-16">
              <div className="text-center space-y-4">
                <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">The Process</h2>
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">How Proposal Pilot Works</h3>
              </div>

              <div className="grid md:grid-cols-3 gap-12">
                {[
                  {
                    step: "01",
                    title: "Blueprint Creation",
                    desc: "Operators initialize a new proposal project, selecting from pre-defined enterprise phases to ensure a professional structure from day one.",
                    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  },
                  {
                    step: "02",
                    title: "AI-Augmented Drafting",
                    desc: "Use built-in Gemini intelligence to generate high-quality strategic content for specific phases based on the unique context of your client's business.",
                    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  },
                  {
                    step: "03",
                    title: "Collaborative Approval",
                    desc: "Clients log in to their private portal to review, provide feedback, or formally approve each phase, moving the project toward a final signed contract.",
                    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  }
                ].map((item, i) => (
                  <div key={i} className="space-y-6 group">
                    <div className="flex justify-between items-center">
                      <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white group-hover:bg-blue-600 transition-soft shadow-lg">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          {item.icon}
                        </svg>
                      </div>
                      <span className="text-4xl font-black text-slate-100 group-hover:text-blue-50 transition-soft">{item.step}</span>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-lg font-bold text-slate-900">{item.title}</h4>
                      <p className="text-sm text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t border-slate-100 bg-white">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Proposal Pilot &copy; 2025</p>
          <div className="flex space-x-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span className="text-slate-900">Modern Strategy</span>
            <span>Structured Growth</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;