import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Eye, EyeOff, AlertCircle, ShieldCheck, Coffee, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCafe } from '../context/CafeContext';

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
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 bg-[#180E0A] overflow-hidden selection:bg-[#C8963E] selection:text-white">
      {/* Ambient Luxury Lighting & Warm Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#3E2218] via-[#1E110B] to-[#120906]" />
      
      {/* Subtle Warm Amber Glows in Background */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[650px] h-[450px] bg-[#C8963E]/18 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute -bottom-32 right-10 w-[450px] h-[350px] bg-[#C8963E]/12 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 -left-20 w-[400px] h-[300px] bg-[#1B3022]/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Decorative Brand Corner Accents */}
      <div className="hidden lg:flex fixed top-8 left-8 items-center space-x-2 text-[10px] font-mono tracking-[0.3em] text-[#C8963E]/70 uppercase pointer-events-none z-10">
        <span className="w-1.5 h-1.5 rounded-full bg-[#C8963E]" />
        <span>EST. 2026 • TRIO BEAN CAFÉ</span>
      </div>
      <div className="hidden lg:flex fixed bottom-8 right-8 items-center space-x-2 text-[10px] font-mono tracking-[0.3em] text-[#C8963E]/70 uppercase pointer-events-none z-10">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>STAFF & POS BILLING PORTAL</span>
      </div>

      {/* Main Luxury Sign-In Card */}
      <div className="relative z-20 w-full max-w-[440px] bg-[#24150F]/90 backdrop-blur-2xl rounded-[32px] border border-[#C8963E]/30 shadow-[0_30px_90px_-15px_rgba(0,0,0,0.7)] overflow-hidden transition-all duration-300">
        
        {/* Gold Border Highlight on Top */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#996515] via-[#E5C170] to-[#996515]" />

        {/* Card Header with Exact Crown & TB Monogram from Brand Booklet */}
        <div className="pt-8 pb-6 px-8 text-center relative overflow-hidden">
          {/* Subtle Warm Backlight */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-40 h-40 bg-[#C8963E]/20 rounded-full blur-2xl pointer-events-none" />

          {/* Official TB Crown Emblem */}
          <div className="relative inline-flex flex-col items-center justify-center mb-4">
            <div className="w-20 h-20 rounded-full border-2 border-[#C8963E] bg-gradient-to-b from-[#FAF6F0] to-[#F0E6D6] flex flex-col items-center justify-center shadow-xl shadow-black/40 group transform transition-transform hover:scale-105">
              {/* Gold Crown */}
              <svg className="w-7 h-5 text-[#C8963E] -mt-1 drop-shadow-xs" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V17H19V19Z" />
              </svg>
              {/* TB Monogram */}
              <span className="font-serif font-black text-xl text-[#24150F] tracking-tighter leading-none -mt-0.5">
                TB
              </span>
            </div>
            <div className="absolute -bottom-1 w-2.5 h-2.5 bg-[#C8963E] rotate-45 rounded-xs" />
          </div>

          {/* Brand Typography Matching Menu Booklet */}
          <h1 className="font-serif font-black text-2xl sm:text-3xl tracking-[0.24em] text-[#FDFBF7] uppercase leading-tight drop-shadow-sm">
            TRIO BEAN
          </h1>
          <p className="font-serif text-xs tracking-[0.5em] text-[#C8963E] uppercase font-bold mt-1">
            C A F É
          </p>

          <div className="flex items-center justify-center space-x-2.5 mt-3">
            <span className="h-px w-6 bg-gradient-to-r from-transparent to-[#C8963E]/60" />
            <span className="text-[10px] tracking-[0.28em] text-[#E5C170] uppercase font-semibold">
              Fresh • Tasty • Made Daily
            </span>
            <span className="h-px w-6 bg-gradient-to-l from-transparent to-[#C8963E]/60" />
          </div>

          {/* Staff Portal Badge */}
          <div className="mt-5 pt-4 border-t border-[#3E2519]">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#180E0A] border border-[#C8963E]/30 text-[11px] font-semibold text-[#E5C170]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Staff & POS Billing Portal</span>
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleLoginSubmit} className="px-7 sm:px-8 pb-8 space-y-4.5">
          {/* Error notification */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-start space-x-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{error}</span>
            </div>
          )}

          {/* Email input */}
          <div>
            <label className="block text-xs font-bold text-[#E5C170] mb-1.5 flex items-center space-x-1.5">
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
                className="w-full px-4 py-3.5 rounded-2xl border border-[#4A2E1F] focus:border-[#C8963E] focus:ring-2 focus:ring-[#C8963E]/30 text-sm text-[#FDFBF7] outline-hidden transition-all bg-[#1A0E09] hover:bg-[#1F110B] placeholder:text-stone-500 font-medium"
              />
            </div>
          </div>

          {/* Password input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-[#E5C170] flex items-center space-x-1.5">
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
                className="w-full pl-4 pr-11 py-3.5 rounded-2xl border border-[#4A2E1F] focus:border-[#C8963E] focus:ring-2 focus:ring-[#C8963E]/30 text-sm text-[#FDFBF7] outline-hidden transition-all bg-[#1A0E09] hover:bg-[#1F110B] placeholder:text-stone-500 font-mono tracking-wider font-semibold"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#E5C170] transition-colors p-1"
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
            className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-[#C8963E] via-[#D4A34F] to-[#B8860B] hover:from-[#D4A34F] hover:to-[#C8963E] active:scale-[0.99] text-[#1A0E09] font-black text-sm tracking-wider flex items-center justify-center space-x-2.5 transition-all shadow-lg shadow-[#C8963E]/20 disabled:opacity-50 mt-2 cursor-pointer uppercase"
          >
            {submitting ? (
              <span className="flex items-center space-x-2">
                <svg className="animate-spin h-4 w-4 text-[#1A0E09]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Authenticating...</span>
              </span>
            ) : (
              <>
                <span>Sign In to Trio Bean POS</span>
                <ArrowRight className="w-4 h-4 text-[#1A0E09] stroke-[2.5]" />
              </>
            )}
          </button>

          {/* Public customer menu link */}
          <div className="pt-2 text-center">
            <Link
              to="/menu"
              className="group text-xs font-semibold text-stone-400 hover:text-[#E5C170] transition-colors inline-flex items-center space-x-1.5 py-1 px-3.5 rounded-full hover:bg-white/5"
            >
              <Coffee className="w-3.5 h-3.5 text-[#C8963E] group-hover:scale-110 transition-transform" />
              <span>← View Customer Digital Menu</span>
            </Link>
          </div>
        </form>

        {/* Footer info badge */}
        <div className="py-3 px-6 bg-[#160C08] border-t border-[#3E2519] text-center text-[11px] text-stone-400 flex items-center justify-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="truncate">Trio Bean Protected System • Supabase Realtime Active</span>
        </div>
      </div>
    </div>
  );
}
