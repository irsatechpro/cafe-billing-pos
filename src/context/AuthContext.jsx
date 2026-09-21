import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isLiveSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

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

  // Secure Sign Up with Supabase Auth & Multi-Tenant Database
  const signUp = async ({ email, password, ownerName, cafeName }) => {
    setLoading(true);
    setAuthError('');

    try {
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanPass = (password || '').trim();
      const cleanName = (ownerName || '').trim();
      const cleanCafe = (cafeName || '').trim();

      if (!cleanEmail) {
        throw new Error('Please enter a username or email address.');
      }

      if (cleanPass.length < 6) {
        throw new Error('Security requirement: Password must be at least 6 characters long.');
      }

      if (!cleanCafe) {
        throw new Error('Please enter your Cafe Name.');
      }

      // Supabase requires valid email format (RFC standard)
      const supaEmail = cleanEmail.includes('@') ? cleanEmail : `${cleanEmail}@cafe.internal`;
      let supaUserId = null;

      // 1. Create User in Supabase Authentication
      if (isLiveSupabaseConfigured && supabase) {
        try {
          const { data: supaAuthData, error: supaErr } = await supabase.auth.signUp({
            email: supaEmail,
            password: cleanPass,
            options: {
              data: {
                name: cleanName || cleanCafe,
                cafe_name: cleanCafe,
                role: 'ADMIN'
              }
            }
          });

          if (supaErr) {
            console.error('Supabase Auth signUp error:', supaErr);
            if (supaErr.message && (supaErr.message.toLowerCase().includes('already') || supaErr.status === 422)) {
              throw new Error(`An account with "${cleanEmail}" already exists in Supabase. Please sign in instead.`);
            }
          } else if (supaAuthData?.user?.id) {
            supaUserId = supaAuthData.user.id;
          }
        } catch (supaErr) {
          if (supaErr.message && supaErr.message.toLowerCase().includes('already')) {
            throw supaErr;
          }
          console.warn('Supabase Auth warning:', supaErr);
        }
      }

      // 2. Register tenant and user in server store
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: supaUserId,
          email: cleanEmail,
          password: cleanPass,
          name: cleanName || cleanCafe,
          cafeName: cleanCafe
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed.');
      }

      const { user: newUser, cafe: newCafe } = data;

      // 3. Sync profile and cafe records to Supabase Postgres database
      const isValidUUID = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);

      if (isLiveSupabaseConfigured && supabase) {
        if (supaUserId && isValidUUID(supaUserId)) {
          try {
            await supabase.from('profiles').upsert([{
              id: supaUserId,
              name: cleanName || cleanCafe,
              email: supaEmail,
              role: 'ADMIN',
              cafe_id: (newCafe?.id && isValidUUID(newCafe.id)) ? newCafe.id : undefined
            }]);
          } catch (pe) {
            console.warn('Supabase profile sync warning:', pe);
          }
        }

        if (newCafe) {
          try {
            const cafeRecord = {
              name: newCafe.name,
              slug: newCafe.slug,
              tagline: newCafe.tagline || 'Fresh • Tasty • Made Daily',
              theme: newCafe.theme || 'coffee'
            };
            if (isValidUUID(newCafe.id)) {
              cafeRecord.id = newCafe.id;
            }
            if (supaUserId && isValidUUID(supaUserId)) {
              cafeRecord.owner_id = supaUserId;
            }
            await supabase.from('cafes').upsert([cafeRecord]);
          } catch (ce) {
            console.warn('Supabase cafe sync warning:', ce);
          }
        }
      }

      setUser(newUser);
      localStorage.setItem('trio_bean_auth_user', JSON.stringify(newUser));
      if (newCafe) {
        localStorage.setItem('trio_active_cafe_profile', JSON.stringify(newCafe));
      }
      return { user: newUser, cafe: newCafe };
    } catch (err) {
      setAuthError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Secure Sign In with Supabase Auth & Multi-Tenant Database
  const login = async (email, password) => {
    setLoading(true);
    setAuthError('');

    try {
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanPass = (password || '').trim();

      if (!cleanEmail || !cleanPass) {
        throw new Error('Please enter both email/username and password.');
      }

      const supaEmail = cleanEmail.includes('@') ? cleanEmail : `${cleanEmail}@cafe.internal`;

      // 1. Supabase Auth signIn
      if (isLiveSupabaseConfigured && supabase) {
        try {
          await supabase.auth.signInWithPassword({
            email: supaEmail,
            password: cleanPass
          });
        } catch (supaErr) {
          console.warn('Supabase signInWithPassword warning:', supaErr);
        }
      }

      // 2. Server API validation
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPass })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials. Please check your email and password.');
      }

      const { user: authenticatedUser, cafe: userCafe } = data;
      setUser(authenticatedUser);
      localStorage.setItem('trio_bean_auth_user', JSON.stringify(authenticatedUser));
      if (userCafe) {
        localStorage.setItem('trio_active_cafe_profile', JSON.stringify(userCafe));
      }
      return { user: authenticatedUser, cafe: userCafe };
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
      name: `Demo ${newRole.charAt(0) + newRole.slice(1).toLowerCase()}`
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
        signUp,
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
