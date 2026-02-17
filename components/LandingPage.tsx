import React, { useState } from 'react';
import { UserRole } from '../types.ts';
import { supabase } from '../supabaseClient.js';

type ViewMode = 'SELECTION' | 'ADMIN_LOGIN' | 'ADMIN_SIGNUP' | 'CLIENT_LOGIN' | 'CLIENT_SIGNUP';

const LandingPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('SELECTION');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isSignUpView = viewMode === 'ADMIN_SIGNUP' || viewMode === 'CLIENT_SIGNUP';
  const currentRole = (viewMode === 'ADMIN_LOGIN' || viewMode === 'ADMIN_SIGNUP') 
    ? UserRole.AGENCY_ADMIN 
    : UserRole.CLIENT;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (isSignUpView) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: currentRole, 
              full_name: email.split('@')[0],
            },
          },
        });
        
        if (signUpError) throw signUpError;

        if (data.user && !data.session) {
          setSuccessMsg('Verification email sent. Please confirm your account before logging in.');
          // Redirect to login view for that role
          setViewMode(currentRole === UserRole.AGENCY_ADMIN ? 'ADMIN_LOGIN' : 'CLIENT_LOGIN');
          setPassword('');   
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      }
    } catch (err: any) {
      setError(err.message || 'An authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const resetAndNavigate = (mode: ViewMode) => {
    setEmail('');
    setPassword('');
    setError(null);
    setSuccessMsg(null);
    setViewMode(mode);
  };

  const renderAuthForm = () => {
    const isClient = currentRole === UserRole.CLIENT;
    const title = isSignUpView 
      ? (isClient ? 'Register Client Portal' : 'Register Admin Access')
      : (isClient ? 'Client Portal Login' : 'Admin Hub Login');
    const subtitle = isClient ? 'Enterprise Client Services' : 'Agency Management Hub';
    const buttonLabel = loading ? 'Processing...' : (isSignUpView ? 'Create Account' : 'Secure Login');
    const buttonColor = isClient ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-900 hover:bg-slate-800';

    return (
      <div className="w-full max-w-md mx-auto">
        <button 
          onClick={() => resetAndNavigate('SELECTION')}
          className="mb-8 flex items-center space-x-2 text-[10px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-soft"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
          <span>Return Home</span>
        </button>

        <div className="bg-white border border-slate-200 p-8 lg:p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-widest">
              {subtitle}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-start space-x-3 mb-2">
                <div className="mt-0.5 text-emerald-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-[11px] font-bold text-emerald-700 uppercase leading-tight tracking-wide">
                  {successMsg}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Identity (Email)</label>
              <input 
                type="email" 
                required
                placeholder="name@organization.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-medium focus:border-blue-500 transition-soft outline-none bg-slate-50/50 focus:bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Passphrase</label>
              <input 
                type="password" 
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-medium focus:border-blue-500 transition-soft outline-none bg-slate-50/50 focus:bg-white"
              />
            </div>

            {error && (
              <p className="text-[10px] font-bold text-rose-500 bg-rose-50 p-3 rounded-lg border border-rose-100 uppercase tracking-widest">
                {error}
              </p>
            )}
            
            <button 
              type="submit"
              disabled={loading}
              className={`w-full text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-soft shadow-lg active:scale-[0.98] disabled:opacity-50 ${buttonColor}`}
            >
              {buttonLabel}
            </button>

            <div className="text-center mt-6">
              <button 
                type="button"
                onClick={() => {
                  if (isSignUpView) {
                    resetAndNavigate(isClient ? 'CLIENT_LOGIN' : 'ADMIN_LOGIN');
                  } else {
                    resetAndNavigate(isClient ? 'CLIENT_SIGNUP' : 'ADMIN_SIGNUP');
                  }
                }}
                className="text-[10px] font-bold text-slate-400 hover:text-blue-600 uppercase tracking-[0.3em] transition-soft"
              >
                {isSignUpView ? 'Existing account? Sign In' : 'Need an account? Register'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <header className="border-b border-slate-100 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => resetAndNavigate('SELECTION')}>
            <div className="bg-slate-900 p-1.5 rounded">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <span className="font-extrabold text-sm tracking-tight text-slate-900 uppercase">Aura Proposal Pilot</span>
          </div>
          
          <div className="flex items-center space-x-8">
            <button 
              onClick={() => {
                const element = document.getElementById('how-it-works');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hidden md:block text-[10px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-[0.2em] transition-soft"
            >
              How it Works
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col bg-white">
        <section className="flex items-center py-16 lg:py-24 bg-gradient-to-b from-slate-50/50 to-white overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              
              {viewMode === 'SELECTION' && (
                <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                  <div className="space-y-10">
                    <div className="space-y-6">
                      <h1 className="text-5xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight">
                        <span className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-700 bg-clip-text text-transparent">
                          The Future of Business Proposals.
                        </span>
                      </h1>
                      <p className="text-lg text-slate-500 leading-relaxed font-medium max-w-md">
                        The ultimate hub for agencies and enterprise clients to collaborate on high-stakes digital transformation projects.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-8">
                    {/* Admin Section */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 shadow-sm hover:shadow-md transition-soft">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Agency Administration</h3>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Internal Command Hub</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <button 
                          onClick={() => resetAndNavigate('ADMIN_LOGIN')}
                          className="bg-slate-900 text-white py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-soft active:scale-[0.98]"
                        >
                          Admin Login
                        </button>
                        <button 
                          onClick={() => resetAndNavigate('ADMIN_SIGNUP')}
                          className="bg-white border border-slate-200 text-slate-900 py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:border-slate-900 transition-soft active:scale-[0.98]"
                        >
                          Admin Sign Up
                        </button>
                      </div>
                    </div>

                    {/* Client Section */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 shadow-sm hover:shadow-md transition-soft">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Enterprise Client Portal</h3>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Secure Client Gateway</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <button 
                          onClick={() => resetAndNavigate('CLIENT_LOGIN')}
                          className="bg-blue-600 text-white py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-soft active:scale-[0.98]"
                        >
                          Client Login
                        </button>
                        <button 
                          onClick={() => resetAndNavigate('CLIENT_SIGNUP')}
                          className="bg-white border border-slate-200 text-blue-600 py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:border-blue-600 transition-soft active:scale-[0.98]"
                        >
                          Client Sign Up
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {viewMode !== 'SELECTION' && renderAuthForm()}

            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-24 bg-white border-y border-slate-100">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto space-y-16">
              <div className="text-center space-y-4">
                <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">The Process</h2>
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Enterprise Delivery Flow</h3>
              </div>

              <div className="grid md:grid-cols-3 gap-12">
                {[
                  {
                    step: "01",
                    title: "Blueprint Creation",
                    desc: "Operators initialize a new proposal project, selecting from pre-defined enterprise phases.",
                    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  },
                  {
                    step: "02",
                    title: "AI-Augmented Drafting",
                    desc: "Use built-in Gemini intelligence to generate high-quality strategic content for specific phases.",
                    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  },
                  {
                    step: "03",
                    title: "Collaborative Approval",
                    desc: "Clients log in to their private portal to review, provide feedback, or formally approve each phase.",
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
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aura Proposal Pilot &copy; 2025</p>
          <div className="flex space-x-6">
            <button onClick={() => resetAndNavigate('SELECTION')} className="text-[10px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest">Home</button>
            <button onClick={() => resetAndNavigate('ADMIN_LOGIN')} className="text-[10px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest">Admin Access</button>
            <button onClick={() => resetAndNavigate('CLIENT_LOGIN')} className="text-[10px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest">Client Portal</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;