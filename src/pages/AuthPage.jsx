import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Eye, EyeOff, AlertCircle, ShieldCheck, Coffee, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCafe } from '../context/CafeContext';
import PremiumCafe3DBackground from '../components/3d/PremiumCafe3DBackground';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const { setActiveCafe } = useCafe();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanPass) {
      setError('Please enter your email and password.');
      return;
    }

    setSubmitting(true);
    try {
      const { cafe: userCafe } = await login(cleanEmail, cleanPass);
      if (userCafe) {
        setActiveCafe(userCafe);
      }
      navigate('/admin/cafe');
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden bg-[#FAF6F0] selection:bg-[#C8963E] selection:text-white">
      {/* Cinema-Grade 3D Cafe Background with Auto-Zooming Camera & Floating Coffee Beans */}
      <PremiumCafe3DBackground />

      {/* Floating Brand Corner Watermarks */}
      <div className="hidden lg:block fixed top-8 left-8 text-[10px] font-mono tracking-[0.3em] text-[#8D6E63]/80 uppercase pointer-events-none z-10">
        EST. 2026 • TRIO BEAN CAFÉ
      </div>
      <div className="hidden lg:block fixed bottom-8 right-8 text-[10px] font-mono tracking-[0.3em] text-[#8D6E63]/80 uppercase pointer-events-none z-10 flex items-center space-x-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>SECURE STAFF & POS BILLING</span>
      </div>

      {/* Central Ultra-Premium Glassmorphic Sign-In Card */}
      <div className="relative z-20 w-full max-w-[430px] bg-white/92 backdrop-blur-2xl rounded-[36px] border border-white/80 shadow-[0_30px_90px_-15px_rgba(44,26,20,0.26)] overflow-hidden transition-all duration-300">
        
        {/* Card Header with Exact Crown & TB Monogram from Brand Booklet */}
        <div className="relative bg-gradient-to-b from-[#2C1A14] to-[#1F120C] text-[#FDFBF7] p-8 text-center overflow-hidden border-b-2 border-[#C8963E]">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#C8963E]/25 rounded-full blur-2xl pointer-events-none" />

          {/* Official TB Crown Emblem */}
          <div className="relative inline-flex flex-col items-center justify-center mb-3">
            <div className="w-20 h-20 rounded-full border-2 border-[#C8963E] bg-[#FAF6F0] flex flex-col items-center justify-center shadow-xl shadow-black/30 group transform transition-transform hover:scale-105">
              {/* Gold Crown */}
              <svg className="w-7 h-5 text-[#C8963E] -mt-1 drop-shadow-xs" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V17H19V19Z" />
              </svg>
              {/* TB Monogram */}
              <span className="font-serif font-black text-xl text-[#2C1A14] tracking-tighter leading-none -mt-0.5">
                TB
              </span>
            </div>
            <div className="absolute -bottom-1 w-2.5 h-2.5 bg-[#C8963E] rotate-45 rounded-xs shadow-xs" />
          </div>

          {/* Typography Matching Menu Booklet */}
          <h1 className="font-serif font-black text-2xl sm:text-3xl tracking-[0.22em] text-[#FDFBF7] uppercase leading-tight">
            TRIO BEAN
          </h1>
          <p className="font-serif text-xs tracking-[0.5em] text-[#C8963E] uppercase font-bold mt-1">
            C A F É
          </p>
          <div className="flex items-center justify-center space-x-2 mt-2">
            <span className="h-px w-5 bg-[#C8963E]/40" />
            <span className="text-[10px] tracking-[0.25em] text-[#E5C170] uppercase font-medium">
              Fresh • Tasty • Made Daily
            </span>
            <span className="h-px w-5 bg-[#C8963E]/40" />
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleLoginSubmit} className="p-7 sm:p-8 space-y-4.5">
          {/* Subtitle */}
          <div className="text-center mb-1">
            <h2 className="font-serif font-bold text-base text-[#2C1A14]">
              Staff & Billing Portal
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Sign in to manage live orders & counter billing
            </p>
          </div>

          {/* Error notification */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{error}</span>
            </div>
          )}

          {/* Email input */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center space-x-1.5">
              <Mail className="w-3.5 h-3.5 text-[#C8963E]" />
              <span>Email Address</span>
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="triobean3@gmail.com"
                className="w-full px-4 py-3.5 rounded-2xl border border-stone-200 focus:border-[#C8963E] focus:ring-3 focus:ring-[#C8963E]/20 text-sm text-[#2C1A14] outline-hidden transition-all bg-stone-50/70 hover:bg-white placeholder:text-stone-400 font-medium"
              />
            </div>
          </div>

          {/* Password input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-stone-700 flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-[#C8963E]" />
                <span>Password</span>
              </label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-4 pr-11 py-3.5 rounded-2xl border border-stone-200 focus:border-[#C8963E] focus:ring-3 focus:ring-[#C8963E]/20 text-sm text-[#2C1A14] outline-hidden transition-all bg-stone-50/70 hover:bg-white placeholder:text-stone-400 font-mono tracking-wider font-semibold"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors p-1"
                tabIndex={-1}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Sign In Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-[#2C1A14] to-[#3E2723] hover:from-[#1F120C] hover:to-[#2C1A14] active:scale-[0.99] text-[#FDFBF7] font-bold text-sm tracking-wider flex items-center justify-center space-x-2.5 transition-all shadow-lg shadow-[#2C1A14]/25 disabled:opacity-50 mt-2 cursor-pointer"
          >
            {submitting ? (
              <span className="flex items-center space-x-2">
                <svg className="animate-spin h-4 w-4 text-[#C8963E]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Authenticating with Supabase...</span>
              </span>
            ) : (
              <>
                <span className="uppercase tracking-wider">Sign In to Trio Bean POS</span>
                <ArrowRight className="w-4 h-4 text-[#C8963E]" />
              </>
            )}
          </button>

          {/* Public customer menu link */}
          <div className="pt-2 text-center">
            <Link
              to="/menu"
              className="group text-xs font-semibold text-stone-600 hover:text-[#2C1A14] transition-colors inline-flex items-center space-x-1.5 py-1 px-3.5 rounded-full hover:bg-stone-100"
            >
              <Coffee className="w-3.5 h-3.5 text-[#C8963E] group-hover:scale-110 transition-transform" />
              <span>← View Customer Digital Menu</span>
            </Link>
          </div>
        </form>

        {/* Footer info badge */}
        <div className="py-3 px-6 bg-[#FAF6F0] border-t border-[#EFE6D8] text-center text-[11px] text-stone-600 flex items-center justify-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="truncate">Trio Bean Protected System • Supabase Realtime Active</span>
        </div>
      </div>
    </div>
  );
}
