import React, { useState } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import { useCafe } from '../../context/CafeContext';
import { useTheme } from '../../context/ThemeContext';
import { uploadMenuImage } from '../../services/menuService';
import { Store, Palette, Upload, Check, Sparkles, Image as ImageIcon, CheckCircle2, RefreshCw, Eye, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SettingsPage() {
  const { activeCafe, updateCafeSettings, loading } = useCafe();
  const { currentTheme, setTheme, availableThemes } = useTheme();

  const [name, setName] = useState(activeCafe?.name || 'Trio Bean Café');
  const [tagline, setTagline] = useState(activeCafe?.tagline || 'Fresh • Tasty • Made Daily');
  const [logoUrl, setLogoUrl] = useState(activeCafe?.logo_url || '');
  const [selectedThemeId, setSelectedThemeId] = useState(activeCafe?.theme || currentTheme || 'coffee');
  const [activeThemeCategory, setActiveThemeCategory] = useState('All');

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(activeCafe?.logo_url || '');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleLogoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleThemeSelect = (themeId) => {
    setSelectedThemeId(themeId);
    // Instant live preview of the theme!
    setTheme(themeId);
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      let finalLogoUrl = logoUrl;
      if (logoFile) {
        finalLogoUrl = await uploadMenuImage(logoFile);
      }

      await updateCafeSettings({
        name: name.trim(),
        tagline: tagline.trim(),
        logo_url: finalLogoUrl,
        theme: selectedThemeId
      });

      // Confetti celebration
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch (err) {}

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to save cafe settings:', err);
      alert('Failed to save settings: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--color-bg,#FAF6F0)] text-[var(--color-text-main,#2C1A14)]">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-24 lg:pb-0">
        {/* Header */}
        <header className="bg-white px-4 sm:px-6 lg:px-8 py-4 sm:py-5 border-b border-[var(--color-border,#EFE6D8)] sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div>
            <span className="text-[10px] font-bold text-[var(--color-accent,#C8963E)] uppercase tracking-widest font-mono">
              CAFE BRANDING & CONFIGURATION
            </span>
            <h1 className="font-serif font-bold text-xl sm:text-2xl text-stone-900">
              Cafe Settings & Theme Engine
            </h1>
          </div>

          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-[var(--color-primary,#2C1A14)] text-[var(--color-accent-light,#E5C170)] hover:opacity-95 font-bold text-xs flex items-center space-x-2 shadow-md transition-all active:scale-98 disabled:opacity-50"
          >
            {saving ? (
              <span>Saving Changes...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>SAVE ALL CHANGES</span>
              </>
            )}
          </button>
        </header>

        {/* Success Alert Banner */}
        {savedSuccess && (
          <div className="mx-4 sm:mx-8 mt-4 p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between animate-fade-in shadow-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
              <span>
                Cafe branding & color theme saved successfully! All connected phones and customers will now see the new branding.
              </span>
            </div>
          </div>
        )}

        <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-5xl">
          {/* Section 1: Cafe Identity */}
          <div className="bg-white rounded-3xl p-6 border border-[var(--color-border,#EFE6D8)] shadow-xs space-y-6">
            <div className="border-b border-[var(--color-border,#EFE6D8)] pb-3 flex items-center space-x-2.5">
              <Store className="w-5 h-5 text-[var(--color-accent,#C8963E)]" />
              <div>
                <h2 className="font-serif font-bold text-lg text-stone-900">
                  Cafe Identity & Logo
                </h2>
                <p className="text-xs text-stone-500">
                  Customize your business name, tagline, and uploaded logo displayed across the entire customer menu.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {/* Cafe Name */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Cafe / Restaurant Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Trio Bean Café"
                    className="w-full bg-[var(--color-bg,#FAF6F0)] px-4 py-2.5 rounded-xl border border-[var(--color-border,#EFE6D8)] text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent,#C8963E)]"
                  />
                </div>

                {/* Tagline */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Cafe Tagline
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Fresh • Tasty • Made Daily"
                    className="w-full bg-[var(--color-bg,#FAF6F0)] px-4 py-2.5 rounded-xl border border-[var(--color-border,#EFE6D8)] text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent,#C8963E)]"
                  />
                </div>
              </div>

              {/* Cafe Logo */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Cafe Brand Logo
                </label>
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 rounded-2xl bg-[var(--color-bg,#FAF6F0)] border border-[var(--color-border,#EFE6D8)] overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Cafe Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Store className="w-8 h-8 text-[var(--color-accent,#C8963E)] opacity-60" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileChange}
                      className="text-xs text-stone-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-[var(--color-primary,#2C1A14)] file:text-[var(--color-accent-light,#E5C170)] file:font-bold file:text-xs hover:file:opacity-90 cursor-pointer"
                    />
                    <input
                      type="url"
                      placeholder="Or enter logo image URL..."
                      value={logoUrl}
                      onChange={(e) => {
                        setLogoUrl(e.target.value);
                        setLogoPreview(e.target.value);
                        setLogoFile(null);
                      }}
                      className="w-full bg-[var(--color-bg,#FAF6F0)] text-[11px] px-3 py-1.5 rounded-xl border border-[var(--color-border,#EFE6D8)] focus:outline-none"
                    />
                    <p className="text-[10px] text-stone-400">
                      Square logos (PNG or JPG) look best in headers and receipts.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

            {/* Section 2: Dynamic Website Color Theme */}
            <div className="bg-white rounded-3xl p-6 border border-[var(--color-border,#EFE6D8)] shadow-xs space-y-5">
              <div className="border-b border-[var(--color-border,#EFE6D8)] pb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2.5">
                  <Palette className="w-5 h-5 text-[var(--color-accent,#C8963E)]" />
                  <div>
                    <h2 className="font-serif font-bold text-lg text-stone-900">
                      Website Color Theme (6 Brand Styles)
                    </h2>
                    <p className="text-xs text-stone-500">
                      Choose your cafe's style. Trio Bean Classic is default, plus 2 Yellowish variations for yellow cafes, Green, Red, and Navy!
                    </p>
                  </div>
                </div>
              </div>

              {/* 6 Clean Theme Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableThemes.map((theme) => {
                  const isSelected = selectedThemeId === theme.id;
                  const isDefaultTrio = theme.id === 'coffee';
                  const isYellow = theme.id.startsWith('yellow_');
                  return (
                    <div
                      key={theme.id}
                      onClick={() => handleThemeSelect(theme.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                        isSelected
                          ? 'border-[var(--color-accent,#C8963E)] shadow-md bg-[var(--color-bg,#FAF6F0)]/40 scale-[1.02]'
                          : 'border-[var(--color-border,#EFE6D8)] hover:border-stone-400/50 bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-stone-900">
                            {theme.name}
                          </span>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-[var(--color-accent,#C8963E)] text-white flex items-center justify-center">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </div>

                        {isDefaultTrio && (
                          <span className="inline-block bg-[#FAF6F0] text-[#C8963E] border border-[#EFE6D8] text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider mb-1.5">
                            ☕ Original Trio Bean
                          </span>
                        )}

                        {isYellow && (
                          <span className="inline-block bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider mb-1.5">
                            ⭐ Yellow Cafe Theme
                          </span>
                        )}

                        <p className="text-[11px] text-stone-500 leading-relaxed mb-3">
                          {theme.description}
                        </p>
                      </div>

                      {/* Color Swatch Dots */}
                      <div className="flex items-center space-x-1.5 pt-2 border-t border-stone-100">
                        {theme.previewColors.map((color, idx) => (
                          <div
                            key={idx}
                            className="w-5 h-5 rounded-full border border-black/10 shadow-xs"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                        <span className="text-[10px] font-mono text-stone-400 pl-2">
                          {isSelected ? 'Selected' : 'Click to apply'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          {/* Section 3: Live Theme Preview */}
          <div className="bg-white rounded-3xl p-6 border border-[var(--color-border,#EFE6D8)] shadow-xs space-y-4">
            <div className="border-b border-[var(--color-border,#EFE6D8)] pb-3 flex items-center space-x-2">
              <Eye className="w-4 h-4 text-[var(--color-accent,#C8963E)]" />
              <h3 className="font-serif font-bold text-base text-stone-900">
                Live Theme Preview: {name}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Customer View Preview */}
              <div className="p-4 rounded-2xl bg-[var(--color-surface,#FDFBF7)] border border-[var(--color-border,#EFE6D8)] space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted,#6D4C41)] font-mono block">
                  Customer Menu Header & Button Preview
                </span>
                <div className="p-3.5 rounded-xl bg-[var(--color-primary,#2C1A14)] text-[#FDFBF7] flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[var(--color-accent,#C8963E)] text-[var(--color-primary,#2C1A14)] flex items-center justify-center font-bold">
                        <Store className="w-4 h-4" />
                      </div>
                    )}
                    <div>
                      <span className="font-serif font-bold text-sm block leading-tight">{name}</span>
                      <span className="text-[9px] text-[var(--color-accent-light,#E5C170)] font-mono">{tagline}</span>
                    </div>
                  </div>
                  <button className="px-3 py-1 rounded-lg bg-[var(--color-accent,#C8963E)] text-[var(--color-primary,#2C1A14)] font-bold text-[10px]">
                    Cart (2)
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[var(--color-border,#EFE6D8)]">
                  <div>
                    <span className="font-bold text-xs text-[var(--color-text-main,#2C1A14)] block">Specialty Roast Coffee</span>
                    <span className="text-[10px] text-stone-400 font-mono">Freshly brewed item</span>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg bg-[var(--color-primary,#2C1A14)] text-[var(--color-accent-light,#E5C170)] font-bold text-xs">
                    Add • ₹35
                  </button>
                </div>
              </div>

              {/* Staff Portal Preview */}
              <div className="p-4 rounded-2xl bg-[var(--color-sidebar-bg,#1F120C)] text-[#FDFBF7] border border-[var(--color-sidebar-border,#3E2723)] space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent-light,#E5C170)] font-mono block">
                  Staff Portal Sidebar Preview
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-accent,#C8963E)] text-[var(--color-primary,#2C1A14)] flex items-center justify-center font-bold">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-serif font-bold text-sm block">{name}</span>
                    <span className="text-[9px] text-[var(--color-accent-light,#E5C170)] font-mono">Staff Portal • ADMIN</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-[var(--color-accent,#C8963E)] text-[var(--color-primary,#2C1A14)] font-bold text-xs flex justify-between items-center">
                  <span>Cafe Live Orders</span>
                  <span className="text-[9px] bg-rose-600 text-white px-1.5 py-0.5 rounded-full uppercase">Realtime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
