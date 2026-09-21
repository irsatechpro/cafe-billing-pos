import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Coffee, Lock, Mail, User, Store, ArrowRight, Eye, EyeOff, AlertCircle, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCafe } from '../context/CafeContext';

export default function AuthPage() {
  const [tab, setTab] = useState('LOGIN'); // 'LOGIN' or 'REGISTER'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [ownerName, setOwnerName] = useState('');
  const [cafeName, setCafeName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, signUp } = useAuth();
  const { setActiveCafe } = useCafe();
  const navigate = useNavigate();

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (tab === 'REGISTER') {
      if (!cafeName.trim()) {
        setError('Please enter your Cafe or Restaurant Name.');
        return;
      }
      if (!email.trim()) {
        setError('Please enter your email or username.');
        return;
      }
      if (password.length < 6) {
        setError('Password security requirement: Must be at least 6 characters long.');
        return;
      }

      setSubmitting(true);
      try {
        const { user: newUser, cafe: newCafe } = await signUp({
          email: email.trim(),
          password: password.trim(),
          ownerName: ownerName.trim() || cafeName.trim(),
          cafeName: cafeName.trim()
        });

        if (newCafe) {
          setActiveCafe(newCafe);
        }

        navigate('/admin/cafe');
      } catch (err) {
        setError(err.message || 'Registration failed. Please try again.');
      } finally {
        setSubmitting(false);
      }
    } else {
      // SIGN IN
      if (!email.trim() || !password.trim()) {
        setError('Please enter your email/username and password.');
        return;
      }

      setSubmitting(true);
      try {
        const { user: loggedInUser, cafe: userCafe } = await login(email.trim(), password.trim());
        if (userCafe) {
          setActiveCafe(userCafe);
        }
        navigate('/admin/cafe');
      } catch (err) {
        setError(err.message || 'Invalid credentials. Please check your email and password.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleDemoFill = (type) => {
    setError('');
    if (type === 'ADMIN') {
      setEmail('admin@triobean.com');
      setPassword('admin123');
      setTab('LOGIN');
    } else if (type === 'NEW_CAFE') {
      setTab('REGISTER');
      setCafeName('Aroma Roasters');
      setOwnerName('Alex Morgan');
      setEmail('owner@aromaroasters.com');
      setPassword('secure123');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg,#FAF6F0)] flex flex-col justify-center items-center px-4 py-8 relative selection:bg-[#C8963E] selection:text-white">
      {/* Background Decorative Blur */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[var(--color-accent,#C8963E)]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl border border-[var(--color-border,#EFE6D8)] shadow-xl overflow-hidden relative z-10">
        
        {/* Brand Header */}
        <div className="p-6 bg-[var(--color-primary,#2C1A14)] text-[#FDFBF7] text-center relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-accent,#C8963E)] text-[var(--color-primary,#2C1A14)] flex items-center justify-center mx-auto mb-3 shadow-md">
            <Coffee className="w-8 h-8" />
          </div>
          <h1 className="font-serif font-extrabold text-2xl tracking-wide">
            CAFE SAAS PLATFORM
          </h1>
          <p className="text-xs text-[var(--color-accent-light,#E5C170)] font-medium mt-0.5">
            Digital QR Menu & Order Management System
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 border-b border-[var(--color-border,#EFE6D8)] bg-[var(--color-bg,#FAF6F0)]">
          <button
            type="button"
            onClick={() => {
              setTab('LOGIN');
              setError('');
            }}
            className={`py-3.5 text-xs font-bold transition-all ${
              tab === 'LOGIN'
                ? 'bg-white text-[var(--color-primary,#2C1A14)] border-b-2 border-[var(--color-accent,#C8963E)] shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Sign In to Staff Portal
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('REGISTER');
              setError('');
            }}
            className={`py-3.5 text-xs font-bold transition-all ${
              tab === 'REGISTER'
                ? 'bg-white text-[var(--color-primary,#2C1A14)] border-b-2 border-[var(--color-accent,#C8963E)] shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Create Cafe Account
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleAuthSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {tab === 'REGISTER' && (
            <>
              {/* Cafe Name */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center space-x-1.5">
                  <Store className="w-3.5 h-3.5 text-[var(--color-accent,#C8963E)]" />
                  <span>Cafe / Restaurant Name *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Green Garden Cafe, Aroma Roasters"
                  value={cafeName}
                  onChange={(e) => setCafeName(e.target.value)}
                  className="w-full bg-[var(--color-bg,#FAF6F0)] px-3.5 py-2.5 rounded-xl border border-[var(--color-border,#EFE6D8)] text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent,#C8963E)]"
                />
              </div>

              {/* Owner Name */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-[var(--color-accent,#C8963E)]" />
                  <span>Owner / Manager Name</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full bg-[var(--color-bg,#FAF6F0)] px-3.5 py-2.5 rounded-xl border border-[var(--color-border,#EFE6D8)] text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent,#C8963E)]"
                />
              </div>
            </>
          )}

          {/* Email or Username */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center space-x-1.5">
              <Mail className="w-3.5 h-3.5 text-[var(--color-accent,#C8963E)]" />
              <span>Email Address or Username *</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. yourname@gmail.com or test123"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[var(--color-bg,#FAF6F0)] px-3.5 py-2.5 rounded-xl border border-[var(--color-border,#EFE6D8)] text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent,#C8963E)]"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-stone-700 flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-[var(--color-accent,#C8963E)]" />
                <span>Password *</span>
              </label>
              <span className="text-[10px] text-stone-400 font-mono">
                {tab === 'REGISTER' ? 'Min 6 characters' : ''}
              </span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[var(--color-bg,#FAF6F0)] px-3.5 py-2.5 rounded-xl border border-[var(--color-border,#EFE6D8)] text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent,#C8963E)] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-4 rounded-xl bg-[var(--color-primary,#2C1A14)] text-[var(--color-accent-light,#E5C170)] hover:opacity-95 font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition-all active:scale-98 disabled:opacity-50"
          >
            {submitting ? (
              <span>Securing account...</span>
            ) : tab === 'REGISTER' ? (
              <>
                <span>CREATE CAFE & START SELLING</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>SIGN IN TO STAFF PORTAL</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link to Customer Menu */}
        <div className="p-3 bg-[var(--color-bg,#FAF6F0)] border-t border-[var(--color-border,#EFE6D8)] text-center">
          <Link
            to="/menu"
            className="text-xs font-semibold text-stone-600 hover:text-[var(--color-accent,#C8963E)] transition-colors inline-flex items-center space-x-1"
          >
            <span>View Public Customer Menu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
