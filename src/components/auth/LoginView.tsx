import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login } = useApp();
  const [email, setEmail] = useState('demo@krishimitra.example.com');
  const [password, setPassword] = useState('DemoPassword123!');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100 relative overflow-hidden">
      {/* Subtle Background GIS Grid Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#22c55e" strokeWidth="0.5" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Tricolor Header Stripe */}
      <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-white to-emerald-500 shrink-0" />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-md space-y-6">
          {/* Emblem & Branding */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-950 border border-emerald-500/40 text-emerald-400 shadow-xl shadow-emerald-950/80 mb-2">
              <Sparkles className="w-8 h-8" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 block">
              Government of India • Ministry of Agriculture
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Agri-Intelligence GIS Platform
            </h1>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              National Decision Support System for Farm Cadastre, NIR/NDVI Remote Sensing & Rural Distress Mitigation
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-5">
            <form onSubmit={handleSignIn} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Government SSO / NIC Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Parichay Credentials / Security Token
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span className="flex items-center gap-1 text-emerald-400">
                  <Shield className="h-3.5 w-3.5" /> 256-bit Encrypted Session
                </span>
                <span className="text-slate-500">Jan Samarth SSO</span>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-950/60 transition-all cursor-pointer text-xs"
              >
                <span>{submitting ? 'Connecting to backend…' : 'Authenticate & Launch Decision Console'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              {error && <p className="text-xs text-red-400" role="alert">{error}</p>}
            </form>
          </div>

          <div className="text-center text-[10px] text-slate-500 space-y-1">
            <p>Authorized access only. Unauthorized intrusion monitored under IT Act Section 66.</p>
            <p>National Informatics Centre (NIC) • Department of Agriculture & Farmers Welfare</p>
          </div>
        </div>
      </div>
    </div>
  );
};
