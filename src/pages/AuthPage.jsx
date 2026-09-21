import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Coffee, Lock, Mail, ArrowRight, Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react';
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
      setError('Please enter your email or username and password.');
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
      setError(err.message || 'Invalid credentials. Please check your email and password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col justify-center items-center px-4 py-8 relative selection:bg-[#C8963E] selection:text-white">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#C8963E]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl border border-[#EFE6D8] shadow-2xl overflow-hidden relative z-10">
        
        {/* Trio Bean Brand Header */}
        <div className="p-8 bg-[#2C1A14] text-[#FDFBF7] text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-[#C8963E] text-[#2C1A14] flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Coffee className="w-9 h-9" />
          </div>
          <h1 className="font-serif font-extrabold text-2xl tracking-wider text-[#FDFBF7]">
            TRIO BEAN CAFÉ
          </h1>
          <p className="text-xs text-[#E5C170] font-medium tracking-wide mt-1">
            Staff Portal & Billing POS
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="p-8 space-y-5">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Email / Username */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center space-x-1.5">
              <Mail className="w-3.5 h-3.5 text-[#C8963E]" />
              <span>Email Address</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="triobean3@gmail.com"
                className="w-full pl-3.5 pr-3 py-3 rounded-xl border border-stone-200 focus:border-[#C8963E] focus:ring-2 focus:ring-[#C8963E]/20 text-sm outline-hidden transition-all bg-stone-50/50 hover:bg-white"
              />
            </div>
          </div>

          {/* Password */}
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
                className="w-full pl-3.5 pr-10 py-3 rounded-xl border border-stone-200 focus:border-[#C8963E] focus:ring-2 focus:ring-[#C8963E]/20 text-sm outline-hidden transition-all bg-stone-50/50 hover:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-4 rounded-xl bg-[#2C1A14] hover:bg-[#3E2723] active:scale-[0.99] text-[#FDFBF7] font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-md disabled:opacity-50 mt-2"
          >
            {submitting ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Sign In to Trio Bean POS</span>
                <ArrowRight className="w-4 h-4 text-[#C8963E]" />
              </>
            )}
          </button>

          {/* Customer View Link */}
          <div className="pt-2 text-center">
            <Link
              to="/menu"
              className="text-xs font-semibold text-stone-500 hover:text-[#2C1A14] transition-colors inline-flex items-center space-x-1"
            >
              <span>← View Customer Digital Menu</span>
            </Link>
          </div>
        </form>

        {/* Footer info */}
        <div className="p-4 bg-stone-50/80 border-t border-[#EFE6D8] text-center text-[11px] text-stone-500 flex items-center justify-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Trio Bean Protected Staff System • Supabase Connected</span>
        </div>
      </div>
    </div>
  );
}
