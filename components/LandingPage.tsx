import React, { useState } from 'react';
import { UserRole } from '../types.ts';
import { supabase } from '../supabaseClient.js';

type ViewMode = 'SELECTION' | 'ADMIN_LOGIN' | 'ADMIN_SIGNUP' | 'CLIENT_LOGIN' | 'CLIENT_SIGNUP';

const LandingPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('SELECTION');
  const [showDropdown, setShowDropdown] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isSignUpView = viewMode === 'ADMIN_SIGNUP' || viewMode === 'CLIENT_SIGNUP';
  const currentRole = (viewMode === 'ADMIN_LOGIN' || viewMode === 'ADMIN_SIGNUP') 
    ? UserRole.AGENCY_ADMIN 
    : UserRole.CLIENT;

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          data: {
            role: currentRole,
          }
        },
      });
      if (authError) throw authError;
    } catch (err: any) {
      setError(err.message || 'Google authentication failed.');
      setLoading(false);
    }
  };

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
          setSuccessMsg('Check your email and confirm your account before logging in.');
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
    setShowDropdown(false);
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

        <div className="bg-white border border-slate-200 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="flex p-1 bg-slate-50 border-b border-slate-100">
            <button 
              onClick={() => resetAndNavigate(isSignUpView ? 'ADMIN_SIGNUP' : 'ADMIN_LOGIN')}
              className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-2xl transition-all ${currentRole === UserRole.AGENCY_ADMIN ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Agency
            </button>
            <button 
              onClick={() => resetAndNavigate(isSignUpView ? 'CLIENT_SIGNUP' : 'CLIENT_LOGIN')}
              className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-2xl transition-all ${currentRole === UserRole.CLIENT ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Client
            </button>
          </div>

          <div className="p-8 lg:p-10">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-900">{title}</h2>
              <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-widest">
                {subtitle}
              </p>
            </div>

            <div className="space-y-4">
              <button 
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-3 bg-white border border-slate-200 py-3.5 rounded-xl hover:bg-slate-50 transition-soft active:scale-[0.98] disabled:opacity-50 shadow-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">Continue with Google</span>
              </button>

              <div className="flex items-center space-x-4">
                <div className="flex-1 h-px bg-slate-100"></div>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">or</span>
                <div className="flex-1 h-px bg-slate-100"></div>
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

                {currentRole === UserRole.CLIENT && (
                  <div className="text-center mt-6">
                    <button 
                      type="button"
                      onClick={() => {
                        if (isSignUpView) {
                          resetAndNavigate('CLIENT_LOGIN');
                        } else {
                          resetAndNavigate('CLIENT_SIGNUP');
                        }
                      }}
                      className="text-[10px] font-bold text-slate-400 hover:text-blue-600 uppercase tracking-[0.3em] transition-soft"
                    >
                      {isSignUpView ? 'Existing account? Sign In' : 'Need an account? Register'}
                    </button>
                  </div>
                )}

              </form>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-slate-900">
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
                if (viewMode !== 'SELECTION') setViewMode('SELECTION');
                setTimeout(() => {
                  const element = document.getElementById('how-it-works');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="hidden md:block text-[10px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-[0.2em] transition-soft"
            >
              How it Works
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="text-[10px] font-bold text-slate-900 hover:text-blue-600 uppercase tracking-[0.2em] transition-soft flex items-center space-x-1.5 group"
              >
                <span>Sign In</span>
                <svg className={`w-3 h-3 transition-transform duration-200 ${showDropdown ? 'rotate-180 text-blue-600' : 'text-slate-400 group-hover:text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {showDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}></div>
                  <div className="absolute right-0 mt-4 w-44 bg-white border border-slate-100 shadow-2xl rounded-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <button 
                      onClick={() => resetAndNavigate('ADMIN_LOGIN')}
                      className="w-full text-left px-5 py-4 text-[10px] font-bold text-slate-400 hover:text-slate-900 hover:bg-slate-50 uppercase tracking-widest transition-soft border-b border-slate-50"
                    >
                      Agency
                    </button>
                    <button 
                      onClick={() => resetAndNavigate('CLIENT_LOGIN')}
                      className="w-full text-left px-5 py-4 text-[10px] font-bold text-slate-400 hover:text-slate-900 hover:bg-slate-50 uppercase tracking-widest transition-soft"
                    >
                      Client
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col bg-white">
        <section className="flex items-center py-20 lg:py-32 bg-gradient-to-b from-slate-50/50 to-white overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              
              {viewMode === 'SELECTION' ? (
                <div className="max-w-4xl mx-auto text-center space-y-12">
                  <div className="space-y-6">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.15] tracking-tight text-slate-900">
                      <span className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-700 bg-clip-text text-transparent">
                        The Future of Business Proposals.
                      </span>
                    </h1>
                    <p className="text-lg text-slate-500 leading-relaxed font-medium mx-auto max-w-2xl">
                      The ultimate hub for agencies and enterprise clients to collaborate on high-stakes digital transformation projects.
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button 
                      onClick={() => resetAndNavigate('ADMIN_LOGIN')}
                      className="w-full sm:w-auto bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all active:scale-[0.98] shadow-2xl shadow-slate-200"
                    >
                      Agency Login
                    </button>
                    <button 
                      onClick={() => resetAndNavigate('CLIENT_LOGIN')}
                      className="w-full sm:w-auto bg-blue-600 text-white px-10 py-5 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-blue-700 transition-all active:scale-[0.98] shadow-2xl shadow-blue-100"
                    >
                      Client Portal
                    </button>
                  </div>
                </div>
              ) : (
                renderAuthForm()
              )}

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
                    title: "Draft Your Proposal",
                    desc: "As an admin, you can create new projects and build out detailed proposal phases. The app automatically structures your workflow from discovery to final agreement.",
                    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  },
                  {
                    step: "02",
                    title: "AI-Powered Content",
                    desc: "Save time by using our built-in Gemini AI to generate professional text for each section. Simply provide a few notes and let the app refine your strategy into clear, expert content.",
                    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  },
                  {
                    step: "03",
                    title: "Collaborate & Approve",
                    desc: "Send your draft to the client via their private portal. Clients can log in to review each phase, provide feedback, and give formal digital approval once they are satisfied.",
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
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
