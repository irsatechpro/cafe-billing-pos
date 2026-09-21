import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Eye, EyeOff, AlertCircle, ShieldCheck, Coffee, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCafe } from '../context/CafeContext';
import Interactive3DFoodShowcase from '../components/3d/Interactive3DFoodShowcase';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [active3DModel, setActive3DModel] = useState('BURGER'); // 'BURGER' or 'COFFEE'

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
    <div className="relative min-h-screen w-full flex items-center justify-center p-3 sm:p-5 md:p-8 overflow-hidden bg-[#FAF6F0] selection:bg-[#C8963E] selection:text-white">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C8963E]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#1B3022]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Decorative luxury corners */}
      <div className="hidden xl:block fixed top-6 left-8 text-[11px] font-mono tracking-widest text-[#8D6E63] uppercase pointer-events-none z-10">
        EST. 2026 • TRIO BEAN CAFÉ
      </div>
      <div className="hidden xl:block fixed bottom-6 right-8 text-[11px] font-mono tracking-widest text-[#8D6E63] uppercase pointer-events-none z-10">
        SECURE STAFF & BILLING POS
      </div>

      {/* Master Luxury Split Card */}
      <div className="relative z-20 w-full max-w-5xl bg-white/95 backdrop-blur-md rounded-[32px] sm:rounded-[36px] border-2 border-[#EFE6D8] shadow-[0_25px_70px_-15px_rgba(44,26,20,0.22)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all duration-300">
        
        {/* LEFT COLUMN: Interactive 3D Food Showcase (Burger & Coffee) */}
        <div className="lg:col-span-6 bg-gradient-to-b from-[#F5EFE6] to-[#EFE6D8]/60 p-4 sm:p-6 md:p-8 flex flex-col justify-between items-center relative border-b lg:border-b-0 lg:border-r-2 border-[#EFE6D8]">
          {/* Top Brand Banner */}
          <div className="w-full flex items-center justify-between z-10">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C8963E] animate-pulse" />
              <span className="text-[11px] font-mono tracking-widest text-[#6D4C41] uppercase font-bold">
                LIVE 3D SHOWCASE
              </span>
            </div>
            <span className="text-[10px] bg-[#2C1A14] text-[#E5C170] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Artisan Menu
            </span>
          </div>

          {/* 3D Model Scene */}
          <div className="w-full my-2 flex items-center justify-center">
            <Interactive3DFoodShowcase
              activeModel={active3DModel}
              onToggleModel={setActive3DModel}
            />
          </div>

          {/* Bottom Menu Highlight Caption */}
          <div className="w-full text-center bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-[#EFE6D8] shadow-xs z-10">
            <p className="font-serif font-bold text-xs text-[#2C1A14]">
              {active3DModel === 'BURGER' ? 'Gourmet Crispy Chicken Burger' : 'Artisan Espresso Latte & Cardamom Brew'}
            </p>
            <p className="text-[10px] text-[#6D4C41] mt-0.5">
              {active3DModel === 'BURGER' ? 'Freshly grilled patty, melted cheddar & brioche bun' : 'Crafted with premium roasted beans & fresh milk'}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Ultra-Refined Staff Login Form */}
        <div className="lg:col-span-6 flex flex-col justify-between p-6 sm:p-8 md:p-10 bg-white">
          {/* Form Header with Official Trio Bean Logo */}
          <div className="text-center pt-2">
            {/* Crown & Monogram Emblem from Menu Book */}
            <div className="relative inline-flex flex-col items-center justify-center mb-3">
              <div className="w-18 h-18 rounded-full border-2 border-[#C8963E] bg-[#FAF6F0] flex flex-col items-center justify-center shadow-md group transform transition-transform hover:scale-105">
                {/* Gold Crown */}
                <svg className="w-6 h-4 text-[#C8963E] -mt-1 drop-shadow-xs" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V17H19V19Z" />
                </svg>
                {/* TB Monogram */}
                <span className="font-serif font-black text-lg text-[#2C1A14] tracking-tighter leading-none -mt-0.5">
                  TB
                </span>
              </div>
            </div>

            <h1 className="font-serif font-black text-2xl sm:text-3xl tracking-[0.2em] text-[#2C1A14] uppercase leading-tight">
              TRIO BEAN
            </h1>
            <p className="font-serif text-xs sm:text-sm tracking-[0.45em] text-[#C8963E] uppercase font-bold mt-0.5">
              C A F É
            </p>
            <p className="text-[10px] tracking-[0.25em] text-[#6D4C41] uppercase font-medium mt-1">
              Fresh • Tasty • Made Daily
            </p>

            <div className="mt-4 pt-3 border-t border-[#EFE6D8]">
              <h2 className="font-serif font-bold text-base text-[#2C1A14]">
                Staff & Billing Portal
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Enter your credentials to access the live counter POS
              </p>
            </div>
          </div>

          {/* Form Inputs */}
          <form onSubmit={handleLoginSubmit} className="space-y-4 my-4">
            {/* Error Notification */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center space-x-1.5">
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
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#C8963E] focus:ring-3 focus:ring-[#C8963E]/15 text-sm text-[#2C1A14] outline-hidden transition-all bg-stone-50/70 hover:bg-white placeholder:text-stone-400"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
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
                  className="w-full pl-4 pr-11 py-3 rounded-xl border border-stone-200 focus:border-[#C8963E] focus:ring-3 focus:ring-[#C8963E]/15 text-sm text-[#2C1A14] outline-hidden transition-all bg-stone-50/70 hover:bg-white placeholder:text-stone-400 font-mono tracking-wider"
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

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#2C1A14] to-[#3E2723] hover:from-[#1F120C] hover:to-[#2C1A14] active:scale-[0.99] text-[#FDFBF7] font-bold text-sm tracking-wider flex items-center justify-center space-x-2.5 transition-all shadow-md shadow-[#2C1A14]/25 disabled:opacity-50 mt-3"
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

            {/* Customer Digital Menu Link */}
            <div className="pt-2 text-center">
              <Link
                to="/menu"
                className="group text-xs font-semibold text-stone-600 hover:text-[#2C1A14] transition-colors inline-flex items-center space-x-1.5 py-1 px-3 rounded-full hover:bg-stone-100"
              >
                <Coffee className="w-3.5 h-3.5 text-[#C8963E] group-hover:scale-110 transition-transform" />
                <span>← View Customer Digital Menu</span>
              </Link>
            </div>
          </form>

          {/* Footer Security Badge */}
          <div className="py-2.5 px-4 bg-[#FAF6F0] rounded-xl border border-[#EFE6D8] text-center text-[11px] text-stone-600 flex items-center justify-center space-x-1.5 mt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Trio Bean Protected System • Supabase Realtime Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
