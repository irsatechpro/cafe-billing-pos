import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useTheme } from './ThemeContext';
import { useAuth } from './AuthContext';
import { supabase, isLiveSupabaseConfigured } from '../lib/supabase';

const DEFAULT_CAFE = {
  id: 'cafe_mub1covl_9uws',
  slug: 'trio-bean',
  name: 'Trio Bean Café',
  tagline: 'Fresh • Tasty • Made Daily',
  logo_url: 'https://img.magnific.com/premium-vector/logo-featuring-word-cafe-various-typography-styles-trendy-cafe-brand-experiment-with-different-typography-styles-minimalist-cafe-logo_538213-64008.jpg?semt=ais_hybrid&w=740&q=80',
  theme: 'coffee',
  currency: '₹',
  owner_id: 'usr_mub1covl_5dri',
  owner_email: 'triobean3@gmail.com',
};

const CafeContext = createContext(null);

export function CafeProvider({ children }) {
  const { setTheme } = useTheme();
  const { user } = useAuth();
  const [activeCafe, setActiveCafe] = useState(() => {
    try {
      const saved = localStorage.getItem('trio_active_cafe_profile');
      return saved ? JSON.parse(saved) : DEFAULT_CAFE;
    } catch {
      return DEFAULT_CAFE;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('trio_active_cafe_profile', JSON.stringify(activeCafe));
    if (activeCafe.theme) setTheme(activeCafe.theme);
  }, [activeCafe, setTheme]);

  const updateCafeSettings = async (updates) => {
    setLoading(true);
    try {
      const updated = {
        ...activeCafe,
        ...updates,
        updated_at: new Date().toISOString()
      };
      setActiveCafe(updated);
      localStorage.setItem('trio_active_cafe_profile', JSON.stringify(updated));

      // Sync to Supabase in background if configured
      if (isLiveSupabaseConfigured && supabase) {
        try {
          await supabase.from('cafes').upsert({
            id: activeCafe.id,
            name: updated.name,
            slug: updated.slug || 'trio-bean',
            tagline: updated.tagline || 'Fresh • Tasty • Made Daily',
            logo_url: updated.logoUrl || updated.logo_url || null,
            theme: updated.theme || 'coffee'
          });
        } catch (supaErr) {
          console.warn('Supabase cafe sync notice:', supaErr);
        }
      }
      return updated;
    } catch (err) {
      console.error('Failed to update cafe settings:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CafeContext.Provider
      value={{
        activeCafe,
        setActiveCafe,
        updateCafeSettings,
        loading,
        currency: activeCafe?.currency || '₹',
        cafeTheme: activeCafe?.theme || 'coffee'
      }}
    >
      {children}
    </CafeContext.Provider>
  );
}

export function useCafe() {
  const context = useContext(CafeContext);
  if (!context) {
    throw new Error('useCafe must be used within a CafeProvider');
  }
  return context;
}
