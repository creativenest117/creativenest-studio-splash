'use client';

import { useState, useEffect, useRef } from 'react';
import BottomNav, { NavTab, NavTabDef, buildTabsFromModules, ALL_TABS } from './BottomNav';
import ProfilePage from './ProfilePage';
import MagazinePage from './MagazinePage';
import GalleryPage from './GalleryPage';
import OTTPage from './OTTPage';
import RadioPage from './RadioPage';
import TVPage from './TVPage';
import MusicPlayerPage from './MusicPlayerPage';

interface AppShellProps {
  appConfig: any;
  domain: string;
}

// Smooth page transition wrapper
function PageTransition({ children, active }: { children: React.ReactNode; active: boolean }) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (active) {
      setMounted(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(t);
    }
  }, [active]);

  if (!mounted) return null;

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0px)' : 'translateY(12px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        position: 'absolute',
        inset: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      {children}
    </div>
  );
}

// Map tab ID → page component
function renderPage(tabId: NavTab, appConfig: any, domain: string) {
  switch (tabId) {
    case 'profile':
    case 'home':
      return <ProfilePage appConfig={appConfig} domain={domain} />;
    case 'magazine':
      return <MagazinePage appConfig={appConfig} />;
    case 'gallery':
      return <GalleryPage appConfig={appConfig} />;
    case 'ott':
      return <OTTPage appConfig={appConfig} />;
    case 'radio':
      return <RadioPage appConfig={appConfig} />;
    case 'tv':
      return <TVPage appConfig={appConfig} />;
    case 'music':
      return <MusicPlayerPage appConfig={appConfig} />;
    case 'books':
    case 'courses':
      return (
        <div className="flex flex-col items-center justify-center min-h-screen pb-24 px-8 text-center"
          style={{ background: '#080610' }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
            style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5" className="w-10 h-10">
              <path d="M12 2L2 7l10 5 10-5-10-5z" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-white mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {tabId === 'books' ? 'Books' : 'Courses'} Coming Soon
          </h2>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Add {tabId} content from your Studio dashboard to get started.
          </p>
        </div>
      );
    default:
      return null;
  }
}

export default function AppShell({ appConfig, domain }: AppShellProps) {
  // Build dynamic tabs from themeConfig
  const buildActiveTabs = (): NavTabDef[] => {
    const modules = appConfig?.themeConfig?.appearance?.modules;
    if (Array.isArray(modules) && modules.length > 0) {
      return buildTabsFromModules(modules);
    }
    // Legacy: use the bottom nav items if they exist  
    const navItems = appConfig?.themeConfig?.appearance?.bottomNavItems;
    if (Array.isArray(navItems) && navItems.length > 0) {
      return navItems
        .map((item: any) => {
          const found = ALL_TABS.find(t => 
            t.id === item.id || 
            t.label.toLowerCase() === item.title?.toLowerCase() ||
            item.path?.includes(t.id)
          );
          return found ? { ...found, label: item.title || found.label } : null;
        })
        .filter(Boolean) as NavTabDef[];
    }
    // Fallback defaults
    return [];
  };

  const activeTabs = buildActiveTabs();
  const defaultTab = activeTabs.length > 0 ? activeTabs[0].id : 'profile';
  
  const [activeTab, setActiveTab] = useState<NavTab>(defaultTab);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Reset scroll on tab change
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.scrollTo({ top: 0 });
  }, [activeTab]);

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
  };

  // All tab IDs that need to be rendered
  const tabIds = activeTabs.length > 0 
    ? activeTabs.map(t => t.id) 
    : ['profile', 'magazine', 'gallery', 'ott', 'radio', 'tv'] as NavTab[];

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        minHeight: '100svh',
        background: '#080610',
        paddingBottom: '80px',
      }}
    >
      {/* Page Stack */}
      <div className="relative w-full" style={{ minHeight: 'calc(100svh - 80px)' }}>
        {tabIds.map(tabId => (
          <PageTransition key={tabId} active={activeTab === tabId}>
            {renderPage(tabId, appConfig, domain)}
          </PageTransition>
        ))}
      </div>

      {/* Bottom Navigation */}
      <BottomNav 
        active={activeTab} 
        onChange={handleTabChange} 
        tabs={activeTabs.length > 0 ? activeTabs : undefined}
      />
    </div>
  );
}
