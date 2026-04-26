'use client';

import { useEffect, useRef, useState } from 'react';

export type NavTab = 'profile' | 'magazine' | 'gallery' | 'ott' | 'radio' | 'tv' | 'music' | 'home' | 'books' | 'courses';

export interface NavTabDef {
  id: NavTab;
  label: string;
  icon: React.ReactNode;
}

interface BottomNavProps {
  active: NavTab;
  onChange: (tab: NavTab) => void;
  tabs?: NavTabDef[]; // If provided, use these tabs; otherwise use defaults
}

// ── SVG Icons ─────────────────────────────────────────────────────────────────

const ICONS: Record<NavTab, React.ReactNode> = {
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 21V12h6v9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
    </svg>
  ),
  magazine: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M8 7h8M8 11h8M8 15h5" strokeLinecap="round" />
    </svg>
  ),
  gallery: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" />
    </svg>
  ),
  ott: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
      <rect x="2" y="4" width="20" height="14" rx="2" />
      <path d="M8 20h8M12 18v2" strokeLinecap="round" />
      <polygon points="10,9 10,14 15,11.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  radio: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
      <circle cx="12" cy="13" r="4" />
      <circle cx="12" cy="13" r="1.5" fill="currentColor" stroke="none" />
      <path d="M4 8.5C5.5 5.5 8.5 3.5 12 3.5s6.5 2 8 5" strokeLinecap="round" />
      <path d="M7 11.5a5.5 5.5 0 0 1 5-3.5 5.5 5.5 0 0 1 5 3.5" strokeLinecap="round" />
    </svg>
  ),
  tv: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
      <rect x="2" y="6" width="20" height="13" rx="2" />
      <path d="M7 3l5 3 5-3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 21h6" strokeLinecap="round" />
      <circle cx="12" cy="12.5" r="2" fill="none" />
    </svg>
  ),
  music: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
      <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  ),
  books: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  courses: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
      <path d="M12 2L2 7l10 5 10-5-10-5z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

// Default tab set (used when no config provided)
const DEFAULT_TABS: NavTabDef[] = [
  { id: 'profile', label: 'Profile', icon: ICONS.profile },
  { id: 'magazine', label: 'Magazine', icon: ICONS.magazine },
  { id: 'gallery', label: 'Gallery', icon: ICONS.gallery },
  { id: 'ott', label: 'OTT', icon: ICONS.ott },
  { id: 'radio', label: 'Radio', icon: ICONS.radio },
  { id: 'tv', label: 'TV', icon: ICONS.tv },
];

// All available tabs (for dynamic config)
export const ALL_TABS: NavTabDef[] = [
  { id: 'home', label: 'Home', icon: ICONS.home },
  { id: 'profile', label: 'Profile', icon: ICONS.profile },
  { id: 'magazine', label: 'Magazine', icon: ICONS.magazine },
  { id: 'books', label: 'Books', icon: ICONS.books },
  { id: 'courses', label: 'Courses', icon: ICONS.courses },
  { id: 'gallery', label: 'Gallery', icon: ICONS.gallery },
  { id: 'ott', label: 'OTT', icon: ICONS.ott },
  { id: 'radio', label: 'Radio', icon: ICONS.radio },
  { id: 'tv', label: 'TV', icon: ICONS.tv },
  { id: 'music', label: 'Music', icon: ICONS.music },
];

// Build tabs from module config (saved in themeConfig)
export function buildTabsFromModules(modules: Array<{ id: string; label?: string; enabled: boolean }>): NavTabDef[] {
  if (!modules || modules.length === 0) return DEFAULT_TABS;
  return modules
    .filter(m => m.enabled)
    .map(m => {
      const base = ALL_TABS.find(t => t.id === m.id);
      if (!base) return null;
      return { ...base, label: m.label || base.label };
    })
    .filter(Boolean) as NavTabDef[];
}

export default function BottomNav({ active, onChange, tabs }: BottomNavProps) {
  const activeTabs = tabs && tabs.length > 0 ? tabs : DEFAULT_TABS;
  const indicatorRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const idx = activeTabs.findIndex(t => t.id === active);
    const el = tabRefs.current[idx];
    if (el) {
      const rect = el.getBoundingClientRect();
      const parentRect = el.closest('nav')?.getBoundingClientRect();
      if (parentRect) {
        setIndicatorStyle({
          left: rect.left - parentRect.left + rect.width / 2 - 20,
          width: 40,
        });
      }
    }
  }, [active, activeTabs]);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-end justify-around overflow-x-auto"
      style={{
        background: 'rgba(8,6,18,0.85)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        borderTop: '1px solid rgba(212,175,55,0.15)',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.6), 0 -1px 0 rgba(212,175,55,0.08)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        paddingTop: '8px',
      }}
    >
      {/* Golden indicator line */}
      <div
        ref={indicatorRef}
        className="absolute top-0 h-[2px] rounded-full transition-all duration-300 ease-out"
        style={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
          background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
          transition: 'left 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.3s ease',
        }}
      />
      {activeTabs.map((tab, idx) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            ref={el => { tabRefs.current[idx] = el; }}
            onClick={() => onChange(tab.id)}
            className="flex flex-col items-center gap-1 px-2 pb-3 pt-1 min-w-[52px] transition-all duration-200 active:scale-90 select-none"
            style={{
              color: isActive ? '#D4AF37' : 'rgba(255,255,255,0.38)',
              transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
              transition: 'color 0.25s ease, transform 0.25s ease',
            }}
            aria-label={tab.label}
          >
            <span
              className="transition-all duration-200"
              style={{
                filter: isActive ? 'drop-shadow(0 0 8px rgba(212,175,55,0.6))' : 'none',
                transform: isActive ? 'scale(1.1)' : 'scale(1)',
              }}
            >
              {tab.icon}
            </span>
            <span
              className="text-[10px] font-semibold tracking-wider uppercase"
              style={{ letterSpacing: '0.06em' }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
