import React, { createContext, useContext, useState, useEffect } from 'react';

export const THEME_PRESETS = {
  // 1. ORIGINAL SIGNATURE TRIO BEAN COFFEE
  coffee: {
    id: 'coffee',
    name: 'Trio Bean Classic Coffee',
    category: 'Classic',
    description: 'Signature espresso dark woods, warm bronze gold, and cozy parchment cream',
    previewColors: ['#2C1A14', '#C8963E', '#FAF6F0'],
    vars: {
      '--color-primary': '#2C1A14',
      '--color-primary-hover': '#3E2723',
      '--color-accent': '#C8963E',
      '--color-accent-light': '#E5C170',
      '--color-accent-text': '#FFFFFF',
      '--color-bg': '#FAF6F0',
      '--color-surface': '#FDFBF7',
      '--color-border': '#EFE6D8',
      '--color-sidebar-bg': '#1F120C',
      '--color-sidebar-border': '#3E2723',
      '--color-text-main': '#2C1A14',
      '--color-text-muted': '#6D4C41',
    }
  },

  // 2. WARM GOLDEN HONEY YELLOW (For Yellow Cafes)
  yellow_honey: {
    id: 'yellow_honey',
    name: 'Warm Golden Honey (Yellow)',
    category: 'Yellow & Warm',
    description: 'Warm golden honey yellow, dark toasted caramel espresso, and cozy sunlit cream',
    previewColors: ['#2B1D04', '#F59E0B', '#FEF08A'],
    vars: {
      '--color-primary': '#2B1D04',
      '--color-primary-hover': '#422C06',
      '--color-accent': '#F59E0B',
      '--color-accent-light': '#FDE68A',
      '--color-accent-text': '#1C1302',
      '--color-bg': '#FFFDF0',
      '--color-surface': '#FFFFFF',
      '--color-border': '#FEF08A',
      '--color-sidebar-bg': '#1F1502',
      '--color-sidebar-border': '#3B2A06',
      '--color-text-main': '#2D1C04',
      '--color-text-muted': '#78530C',
    }
  },

  // 3. DARK YELLOWISH MUSTARD (For Yellow Cafes)
  yellow_mustard: {
    id: 'yellow_mustard',
    name: 'Dark Mustard Roast (Dark Yellow)',
    category: 'Yellow & Warm',
    description: 'Deep dark yellowish artisan mustard, charred cocoa espresso, and bakery warmth',
    previewColors: ['#261C02', '#CA8A04', '#FDE047'],
    vars: {
      '--color-primary': '#261C02',
      '--color-primary-hover': '#3D2C04',
      '--color-accent': '#CA8A04',
      '--color-accent-light': '#FACC15',
      '--color-accent-text': '#1A1301',
      '--color-bg': '#FEFCE8',
      '--color-surface': '#FFFFFF',
      '--color-border': '#FDE047',
      '--color-sidebar-bg': '#171101',
      '--color-sidebar-border': '#382903',
      '--color-text-main': '#231802',
      '--color-text-muted': '#6B4D06',
    }
  },

  // 4. BOTANICAL EMERALD
  emerald: {
    id: 'emerald',
    name: 'Botanical Evergreen & Matcha',
    category: 'Green',
    description: 'Lush Japanese matcha, deep forest evergreen, and organic botanical freshness',
    previewColors: ['#0F291E', '#059669', '#DCFCE7'],
    vars: {
      '--color-primary': '#0F291E',
      '--color-primary-hover': '#173C2C',
      '--color-accent': '#059669',
      '--color-accent-light': '#34D399',
      '--color-accent-text': '#FFFFFF',
      '--color-bg': '#F0FDF4',
      '--color-surface': '#FFFFFF',
      '--color-border': '#DCFCE7',
      '--color-sidebar-bg': '#061A12',
      '--color-sidebar-border': '#173C2C',
      '--color-text-main': '#064E3B',
      '--color-text-muted': '#047857',
    }
  },

  // 5. ROYAL CRIMSON
  crimson: {
    id: 'crimson',
    name: 'Royal Crimson & Velvet Wine',
    category: 'Red & Wine',
    description: 'Deep royal burgundy wine, rich velvety rose, and romantic evening bistro glow',
    previewColors: ['#3B0A14', '#E11D48', '#FFE4E6'],
    vars: {
      '--color-primary': '#3B0A14',
      '--color-primary-hover': '#4E0F1D',
      '--color-accent': '#E11D48',
      '--color-accent-light': '#FB7185',
      '--color-accent-text': '#FFFFFF',
      '--color-bg': '#FFF1F2',
      '--color-surface': '#FFFFFF',
      '--color-border': '#FFE4E6',
      '--color-sidebar-bg': '#24040B',
      '--color-sidebar-border': '#4E0F1D',
      '--color-text-main': '#4C0519',
      '--color-text-muted': '#881337',
    }
  },

  // 6. OCEAN SAPPHIRE
  sapphire: {
    id: 'sapphire',
    name: 'Midnight Navy & Ocean Sapphire',
    category: 'Blue',
    description: 'Deep midnight navy blue, electric coastal sapphire, and crisp clean maritime air',
    previewColors: ['#0F172A', '#2563EB', '#E0F2FE'],
    vars: {
      '--color-primary': '#0F172A',
      '--color-primary-hover': '#1E293B',
      '--color-accent': '#2563EB',
      '--color-accent-light': '#60A5FA',
      '--color-accent-text': '#FFFFFF',
      '--color-bg': '#F0F9FF',
      '--color-surface': '#FFFFFF',
      '--color-border': '#E0F2FE',
      '--color-sidebar-bg': '#020617',
      '--color-sidebar-border': '#1E293B',
      '--color-text-main': '#0C4A6E',
      '--color-text-muted': '#0369A1',
    }
  }
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('trio_cafe_active_theme');
      return (saved && THEME_PRESETS[saved]) ? saved : 'coffee';
    } catch {
      return 'coffee';
    }
  });

  // Apply CSS variables to root HTML whenever theme changes
  useEffect(() => {
    const preset = THEME_PRESETS[currentTheme] || THEME_PRESETS.coffee;
    const root = document.documentElement;

    Object.entries(preset.vars).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    try {
      localStorage.setItem('trio_cafe_active_theme', currentTheme);
    } catch (e) {}
  }, [currentTheme]);

  const setTheme = (themeId) => {
    if (THEME_PRESETS[themeId]) {
      setCurrentTheme(themeId);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        themePreset: THEME_PRESETS[currentTheme] || THEME_PRESETS.coffee,
        setTheme,
        availableThemes: Object.values(THEME_PRESETS)
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
