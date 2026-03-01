import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem('lc_theme') !== 'light'; } catch { return true; }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.style.setProperty('--bg-void', '#04040a');
      root.style.setProperty('--bg-deep', '#070712');
      root.style.setProperty('--bg-surface', '#0e0e1e');
      root.style.setProperty('--bg-card', '#111128');
      root.style.setProperty('--bg-card-hover', '#161630');
      root.style.setProperty('--text-primary', '#f0f0ff');
      root.style.setProperty('--text-secondary', '#8888aa');
      root.style.setProperty('--text-muted', '#44445a');
      root.style.setProperty('--border', 'rgba(255,255,255,0.06)');
      root.style.setProperty('--border-active', 'rgba(0,229,255,0.3)');
    } else {
      root.style.setProperty('--bg-void', '#f0f4ff');
      root.style.setProperty('--bg-deep', '#e8edf8');
      root.style.setProperty('--bg-surface', '#dde4f5');
      root.style.setProperty('--bg-card', '#ffffff');
      root.style.setProperty('--bg-card-hover', '#f5f7ff');
      root.style.setProperty('--text-primary', '#0a0a1a');
      root.style.setProperty('--text-secondary', '#444466');
      root.style.setProperty('--text-muted', '#8888aa');
      root.style.setProperty('--border', 'rgba(0,0,0,0.08)');
      root.style.setProperty('--border-active', 'rgba(0,150,255,0.3)');
    }
    try { localStorage.setItem('lc_theme', isDark ? 'dark' : 'light'); } catch {}
  }, [isDark]);

  const toggle = () => setIsDark(d => !d);

  return (
    <ThemeContext.Provider value={{ isDark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() { return useContext(ThemeContext); }

export function ThemeToggle() {
  const { isDark, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      style={{
        background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
        border: '1px solid var(--border)', borderRadius: 10,
        padding: '8px 14px', cursor: 'pointer', fontSize: 16,
        display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)',
        transition: 'all 0.2s', fontFamily: 'var(--font-body)', fontSize: 13
      }}
      onMouseOver={e => e.currentTarget.style.borderColor = 'var(--cyan)'}
      onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      {isDark ? '☀️' : '🌙'} {isDark ? 'Light' : 'Dark'}
    </button>
  );
}
