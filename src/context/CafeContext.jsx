import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useTheme } from './ThemeContext';
import { useAuth } from './AuthContext';
import { supabase, isLiveSupabaseConfigured } from '../lib/supabase';

const DEFAULT_CAFE = {
  id: 'cafe-default-001',
  slug: 'trio-bean',
  name: 'Trio Bean Café',
  tagline: 'Fresh • Tasty • Made Daily',
  logo_url: '',
  theme: 'coffee',
  currency: '₹',
  owner_id: 'staff-demo',
  owner_email: 'admin@triobean.com',
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

  const fetchCafeByIdOrSlug = useCallback(async (query) => {
    try {
      const res = await fetch(`/api/cafes/${encodeURIComponent(query)}`);
      if (res.ok) {
        const cafeData = await res.json();
        if (cafeData && cafeData.id) {
          setActiveCafe(cafeData);
          if (cafeData.theme) setTheme(cafeData.theme);
          return cafeData;
        }
      }
    } catch (e) {
      console.warn('Could not fetch cafe from query:', e);
    }
    return null;
  }, [setTheme]);

  // Load cafe based on authenticated user or URL query parameter
  const loadCafeForUser = useCallback(async (currentUser) => {
    const params = new URLSearchParams(window.location.search);
    const cafeQuery = params.get('cafe');
    const isCustomerRoute = !window.location.pathname.startsWith('/admin') && !window.location.pathname.startsWith('/cafe');

    // If customer scanned a specific cafe's QR code (e.g. ?cafe=tempting-cafe)
    if (isCustomerRoute && cafeQuery) {
      await fetchCafeByIdOrSlug(cafeQuery);
      return;
    }

    if (!currentUser) {
      if (cafeQuery) {
        await fetchCafeByIdOrSlug(cafeQuery);
      } else {
        setActiveCafe(DEFAULT_CAFE);
      }
      return;
    }

    // Find registered cafe strictly owned by this authenticated user
    try {
      const res = await fetch('/api/cafes');
      if (res.ok) {
        const cafes = await res.json();
        const found = cafes.find(c =>
          (currentUser.id && c.owner_id === currentUser.id) ||
          (currentUser.cafe_id && c.id === currentUser.cafe_id) ||
          (currentUser.email && c.owner_email?.toLowerCase() === currentUser.email?.toLowerCase())
        );
        if (found) {
          setActiveCafe(found);
          if (found.theme) setTheme(found.theme);
          return;
        }
      }
    } catch (e) {
      console.warn('Error fetching cafes for user lookup:', e);
    }

    if (currentUser.email === 'admin@triobean.com') {
      setActiveCafe(DEFAULT_CAFE);
      if (DEFAULT_CAFE.theme) setTheme(DEFAULT_CAFE.theme);
      return;
    }

    // If new user does not have a cafe yet, automatically register one for them
    const newCafeName = currentUser.cafe_name || currentUser.name || (currentUser.email ? `${currentUser.email.split('@')[0]} Cafe` : 'My Cafe');
    await registerNewCafe({
      name: newCafeName,
      ownerId: currentUser.id,
      ownerEmail: currentUser.email
    });
  }, [fetchCafeByIdOrSlug, setTheme]);

  // Sync active cafe whenever user changes
  useEffect(() => {
    loadCafeForUser(user);
  }, [user, loadCafeForUser]);

  // Sync theme whenever active cafe changes
  useEffect(() => {
    if (activeCafe?.theme) {
      setTheme(activeCafe.theme);
    }
    try {
      localStorage.setItem('trio_active_cafe_profile', JSON.stringify(activeCafe));
    } catch (e) {}
  }, [activeCafe, setTheme]);

  // Realtime Live SSE subscription for multi-tenant cafe updates across all devices & phones
  useEffect(() => {
    let eventSource = null;
    try {
      eventSource = new EventSource('/api/menu/stream');
      eventSource.addEventListener('cafe_updated', (e) => {
        try {
          const data = JSON.parse(e.data);
          if (Array.isArray(data)) {
            const updated = data.find(c => c.id === activeCafe.id || c.slug === activeCafe.slug);
            if (updated) {
              setActiveCafe(updated);
              if (updated.theme) setTheme(updated.theme);
            }
          } else if (data && (data.id === activeCafe.id || data.slug === activeCafe.slug)) {
            setActiveCafe(data);
            if (data.theme) setTheme(data.theme);
          }
        } catch (err) {
          console.error('Error parsing cafe SSE update:', err);
        }
      });
    } catch (e) {
      console.warn('SSE cafe connection unavailable:', e);
    }

    const handleStorage = (e) => {
      if (e.key === 'trio_active_cafe_profile' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setActiveCafe(parsed);
          if (parsed.theme) setTheme(parsed.theme);
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      if (eventSource) eventSource.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, [activeCafe.id, activeCafe.slug, setTheme]);


  const updateCafeSettings = async (updates) => {
    setLoading(true);
    try {
      const updated = {
        ...activeCafe,
        ...updates,
        updated_at: new Date().toISOString()
      };

      // 1. Primary: Save to server API
      try {
        const res = await fetch(`/api/cafes/${encodeURIComponent(activeCafe.id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        });
        if (res.ok) {
          const savedData = await res.json();
          if (savedData && savedData.id) {
            setActiveCafe(savedData);
            if (savedData.theme) setTheme(savedData.theme);
          }
        }
      } catch (err) {
        console.warn('Server API cafe update error, falling back to local:', err);
      }

      // 2. Sync to Supabase in background if configured
      if (isLiveSupabaseConfigured && supabase) {
        try {
          await supabase.from('cafes').upsert({
            id: activeCafe.id === 'cafe-default-001' ? 'd8a9f0e1-4b2c-4e3a-8f5d-6c7b8a9e0f1a' : activeCafe.id,
            name: updated.name,
            slug: updated.slug || 'trio-bean',
            tagline: updated.tagline || 'Fresh • Tasty • Made Daily',
            logo_url: updated.logoUrl || updated.logo_url || null,
            theme: updated.theme || 'coffee',
            updated_at: new Date().toISOString()
          });
        } catch (sErr) {
          console.warn('Supabase background cafe update:', sErr);
        }
      }

      // 3. Local fallback
      setActiveCafe(updated);
      if (updated.theme) setTheme(updated.theme);
      localStorage.setItem('trio_active_cafe_profile', JSON.stringify(updated));
      return updated;
    } finally {
      setLoading(false);
    }
  };

  const registerNewCafe = async ({ name, ownerId, ownerEmail }) => {
    setLoading(true);
    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `cafe-${Date.now()}`;
      const newCafe = {
        id: `cafe-${Date.now().toString(36)}`,
        slug,
        name: name.trim(),
        tagline: 'Fresh • Tasty • Made Daily',
        logo_url: '',
        theme: 'coffee',
        currency: '₹',
        owner_id: ownerId,
        owner_email: ownerEmail,
        created_at: new Date().toISOString()
      };

      try {
        const res = await fetch('/api/cafes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newCafe)
        });
        if (res.ok) {
          const saved = await res.json();
          // Sync to Supabase in background
          if (isLiveSupabaseConfigured && supabase) {
            try {
              await supabase.from('cafes').upsert({
                id: saved.id.startsWith('cafe-') ? undefined : saved.id,
                name: saved.name,
                slug: saved.slug,
                tagline: saved.tagline,
                theme: saved.theme
              });
            } catch (err) {
              console.warn('Supabase register cafe error:', err);
            }
          }
          setActiveCafe(saved);
          return saved;
        }
      } catch (e) {
        console.warn('Server API register cafe fallback:', e);
      }

      if (isLiveSupabaseConfigured && supabase) {
        try {
          await supabase.from('cafes').insert({
            name: newCafe.name,
            slug: newCafe.slug,
            tagline: newCafe.tagline,
            theme: newCafe.theme
          });
        } catch (err) {
          console.warn('Supabase register cafe fallback insert:', err);
        }
      }

      setActiveCafe(newCafe);
      return newCafe;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CafeContext.Provider
      value={{
        activeCafe,
        setActiveCafe,
        loading,
        updateCafeSettings,
        registerNewCafe,
        fetchCafeByIdOrSlug,
        loadCafeForUser
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
