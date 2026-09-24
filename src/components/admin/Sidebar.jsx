import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Coffee, LayoutDashboard, UtensilsCrossed, BookOpen, QrCode, Receipt, LogOut, ShieldCheck, Menu, X, Settings, Store, Wallet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCafe } from '../../context/CafeContext';

export default function Sidebar() {
  const { user, switchRole, logout } = useAuth();
  const { activeCafe } = useCafe();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { to: '/admin/cafe', label: 'Cafe Live Orders', icon: UtensilsCrossed, badge: 'Realtime' },
    { to: '/admin/dashboard', label: 'Sales Dashboard', icon: LayoutDashboard },
    { to: '/admin/expenses', label: 'Cafe Expenses', icon: Wallet },
    { to: '/admin/menu', label: 'Menu Management', icon: BookOpen },
    { to: '/admin/qr', label: 'Cafe QR Code', icon: QrCode },
    { to: '/admin/orders/history', label: 'Order History', icon: Receipt },
    { to: '/admin/settings', label: 'Cafe Settings', icon: Settings },
  ];

  return (
    <>
      {/* 1. Mobile & Tablet Top Bar (< lg) */}
      <header className="lg:hidden bg-[#1F120C] text-[#FDFBF7] border-b border-[#3E2723] sticky top-0 z-40 px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          {activeCafe?.logo_url ? (
            <img src={activeCafe.logo_url} alt="Logo" className="w-8 h-8 rounded-full object-cover shadow-xs" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#C8963E] text-[#1F120C] flex items-center justify-center font-bold shadow-xs">
              <Store className="w-4 h-4" />
            </div>
          )}
          <div>
            <h2 className="font-serif font-bold text-base text-[#FDFBF7] tracking-wide leading-tight truncate max-w-[170px]">
              {activeCafe?.name || 'TRIO BEAN'}
            </h2>
            <span className="text-[9px] text-[#E5C170] font-mono tracking-widest uppercase">
              Staff Portal • {user?.role || 'ADMIN'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate(activeCafe?.slug ? `/menu?cafe=${activeCafe.slug}` : '/menu')}
            className="px-2.5 py-1 rounded-lg bg-[#2C1A14] text-[#E5C170] border border-[#3E2723] text-[11px] font-semibold hover:bg-[#3E2723] transition-colors"
          >
            Menu
          </button>
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="p-2 rounded-xl bg-[#2C1A14] text-white hover:bg-[#3E2723] transition-colors border border-[#3E2723]"
            aria-label="Toggle Staff Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* 2. Mobile Full Drawer Slide-Over Sheet (< lg) */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end sm:justify-start">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-full max-w-sm bg-[#1F120C] text-[#FDFBF7] border-r border-[#3E2723] h-full max-h-screen flex flex-col justify-between shadow-2xl z-10 animate-slide-right">
            <div>
              {/* Header inside drawer */}
              <div className="p-4 border-b border-[#3E2723] flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#C8963E] text-[#1F120C] flex items-center justify-center font-bold">
                    <Coffee className="w-4 h-4" />
                  </div>
                  <span className="font-serif font-bold text-base text-[#FDFBF7]">Staff Portal</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="p-3 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-[#C8963E] text-[#1F120C] shadow-md font-bold'
                            : 'text-stone-300 hover:bg-[#3E2723]/60 hover:text-white'
                        }`
                      }
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] bg-rose-600 text-white font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            {/* Role Switcher & User Profile Footer */}
            <div className="p-4 border-t border-[#3E2723] bg-[#2C1A14]/60 space-y-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-[#E5C170]" />
                <div>
                  <p className="font-bold text-white text-xs truncate">{user?.name || 'Staff'}</p>
                  <p className="text-[10px] text-stone-400 font-mono">{user?.role || 'ADMIN'}</p>
                </div>
              </div>

              {/* Role Demo Switcher Dropdown */}
              <div className="bg-[#1F120C] p-2 rounded-xl border border-[#3E2723] space-y-1">
                <span className="text-[9px] text-[#E5C170] font-extrabold uppercase tracking-wider block px-1">
                  Demo Mode Role Switcher:
                </span>
                <div className="grid grid-cols-3 gap-1">
                  {['ADMIN', 'CASHIER', 'STAFF'].map((r) => (
                    <button
                      key={r}
                      onClick={() => switchRole(r)}
                      className={`py-1.5 px-2 rounded text-[10px] font-bold transition-all text-center ${
                        user?.role === r
                          ? 'bg-[#C8963E] text-[#1F120C]'
                          : 'bg-[#2C1A14] text-stone-300 hover:text-white'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Links */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate(activeCafe?.slug ? `/menu?cafe=${activeCafe.slug}` : '/menu');
                  }}
                  className="text-[#E5C170] hover:underline text-[11px] font-medium"
                >
                  View Customer Menu
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="text-rose-400 hover:text-rose-300 text-[11px] flex items-center space-x-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Mobile Bottom Quick Navigation Bar (< lg) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#1F120C] border-t border-[#3E2723] px-2 py-1.5 flex items-center justify-around shadow-lg pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition-all ${
                  isActive
                    ? 'text-[#E5C170] font-bold scale-105'
                    : 'text-stone-400 hover:text-stone-200'
                }`
              }
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="truncate max-w-[65px] text-[9px] leading-tight text-center">
                {item.label.replace('Cafe ', '').replace('Management', '')}
              </span>
            </NavLink>
          );
        })}
      </div>

      {/* 4. Desktop Sidebar (>= lg) */}
      <aside className="hidden lg:flex w-64 bg-[#1F120C] text-[#FDFBF7] flex-col justify-between border-r border-[#3E2723] h-screen sticky top-0 shrink-0">
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-[#3E2723] flex items-center space-x-3">
            {activeCafe?.logo_url ? (
              <img src={activeCafe.logo_url} alt="Logo" className="w-10 h-10 rounded-full object-cover shadow-md shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#C8963E] text-[#1F120C] flex items-center justify-center font-bold shadow-md shrink-0">
                <Store className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              <h2 className="font-serif font-bold text-base text-[#FDFBF7] tracking-wider leading-tight truncate">
                {activeCafe?.name || 'TRIO BEAN'}
              </h2>
              <span className="text-[10px] text-[#E5C170] font-mono tracking-widest uppercase">
                Staff Portal
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#C8963E] text-[#1F120C] shadow-md font-bold'
                        : 'text-stone-300 hover:bg-[#3E2723]/60 hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] bg-rose-600 text-white font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Role Switcher & User Profile Footer */}
        <div className="p-4 border-t border-[#3E2723] bg-[#2C1A14]/60 space-y-3">
          {/* Active Role Card */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#E5C170]" />
              <div>
                <p className="font-bold text-white text-xs truncate">{user?.name || 'Staff'}</p>
                <p className="text-[10px] text-stone-400 font-mono">{user?.role || 'ADMIN'}</p>
              </div>
            </div>
          </div>

          {/* Role Demo Switcher Dropdown */}
          <div className="bg-[#1F120C] p-2 rounded-xl border border-[#3E2723] space-y-1">
            <span className="text-[9px] text-[#E5C170] font-extrabold uppercase tracking-wider block px-1">
              Demo Mode Role Switcher:
            </span>
            <div className="grid grid-cols-2 gap-1">
              {['ADMIN', 'CASHIER', 'STAFF'].map((r) => (
                <button
                  key={r}
                  onClick={() => switchRole(r)}
                  className={`py-1 px-2 rounded text-[10px] font-bold transition-all ${
                    user?.role === r
                      ? 'bg-[#C8963E] text-[#1F120C]'
                      : 'bg-[#2C1A14] text-stone-300 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <button
              onClick={() => navigate(activeCafe?.slug ? `/menu?cafe=${activeCafe.slug}` : '/menu')}
              className="text-stone-300 hover:text-[#E5C170] text-[11px] font-medium flex items-center space-x-1"
            >
              <span>Customer Menu</span>
            </button>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="text-rose-400 hover:text-rose-300 text-[11px] flex items-center space-x-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
