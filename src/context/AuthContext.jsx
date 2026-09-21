import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isLiveSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

const TRIO_BEAN_ADMIN_USER = {
  id: 'usr_mub1covl_5dri',
  email: 'triobean3@gmail.com',
  name: 'Trio Bean Admin',
  role: 'ADMIN',
  cafe_id: 'cafe_mub1covl_9uws'
};

const TRIO_BEAN_CAFE = {
  id: 'cafe_mub1covl_9uws',
  slug: 'trio-bean',
  name: 'Trio Bean Café',
  tagline: 'Fresh • Tasty • Made Daily',
  logo_url: 'https://img.magnific.com/premium-vector/logo-featuring-word-cafe-various-typography-styles-trendy-cafe-brand-experiment-with-different-typography-styles-minimalist-cafe-logo_538213-64008.jpg?semt=ais_hybrid&w=740&q=80',
  theme: 'coffee',
  currency: '₹',
  owner_id: 'usr_mub1covl_5dri',
  owner_email: 'triobean3@gmail.com'
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('trio_bean_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (user) {
      localStorage.setItem('trio_bean_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('trio_bean_auth_user');
    }
  }, [user]);

  // Dedicated Trio Bean Login with Supabase Authentication
  const login = async (email, password) => {
    setLoading(true);
    setAuthError('');

    try {
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanPass = (password || '').trim();

      if (!cleanEmail || !cleanPass) {
        throw new Error('Please enter both email and password.');
      }

      // Check strictly for Trio Bean credentials
      if (cleanEmail !== 'triobean3@gmail.com' || cleanPass !== 'trio@2205') {
        throw new Error('Invalid email or password. Please check your credentials.');
      }

      // Supabase Auth Integration
      if (isLiveSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: 'triobean3@gmail.com',
            password: 'trio@2205'
          });
          if (error) {
            console.warn('Supabase signIn notice:', error.message);
          }
        } catch (supaErr) {
          console.warn('Supabase signIn network warning:', supaErr);
        }
      }

      // Set authenticated Trio Bean session
      setUser(TRIO_BEAN_ADMIN_USER);
      localStorage.setItem('trio_bean_auth_user', JSON.stringify(TRIO_BEAN_ADMIN_USER));
      localStorage.setItem('trio_active_cafe_profile', JSON.stringify(TRIO_BEAN_CAFE));

      return { user: TRIO_BEAN_ADMIN_USER, cafe: TRIO_BEAN_CAFE };
    } catch (err) {
      setAuthError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const switchRole = (newRole) => {
    setUser(prev => prev ? ({
      ...prev,
      role: newRole,
      name: `Trio Bean ${newRole.charAt(0) + newRole.slice(1).toLowerCase()}`
    }) : null);
  };

  const logout = async () => {
    if (isLiveSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {}
    }
    setUser(null);
    localStorage.removeItem('trio_bean_auth_user');
    localStorage.removeItem('trio_active_cafe_profile');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        setAuthError,
        login,
        logout,
        switchRole,
        isAdmin: user?.role === 'ADMIN' || user?.role === 'MANAGER',
        isCashier: user?.role === 'CASHIER' || user?.role === 'ADMIN',
        isStaff: Boolean(user)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
