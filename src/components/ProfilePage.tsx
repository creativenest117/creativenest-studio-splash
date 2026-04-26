'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import DynamicResolver from './DynamicResolver';
import LinksBlock from './LinksBlock';
import { usePWAInstall } from '../lib/usePWAInstall';

// ─── Social Platforms Config ─────────────────────────────────────────────────

const SOCIAL_PLATFORMS: Record<string, { label: string; baseUrl: string; color: string; iconPath: string }> = {
  instagram: {
    label: 'Instagram', baseUrl: 'https://instagram.com/',
    color: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
    iconPath: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
  },
  twitter: {
    label: 'X / Twitter', baseUrl: 'https://x.com/',
    color: 'linear-gradient(135deg, #1a1a2e, #16213e)',
    iconPath: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  },
  youtube: {
    label: 'YouTube', baseUrl: 'https://youtube.com/@',
    color: 'linear-gradient(135deg, #ff0000, #cc0000)',
    iconPath: 'M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z',
  },
  spotify: {
    label: 'Spotify', baseUrl: 'https://open.spotify.com/artist/',
    color: 'linear-gradient(135deg, #1DB954, #158a3e)',
    iconPath: 'M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z',
  },
  linkedin: {
    label: 'LinkedIn', baseUrl: 'https://linkedin.com/in/',
    color: 'linear-gradient(135deg, #0A66C2, #064e94)',
    iconPath: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  },
  tiktok: {
    label: 'TikTok', baseUrl: 'https://tiktok.com/@',
    color: 'linear-gradient(135deg, #010101, #2f2f2f)',
    iconPath: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z',
  },
  twitch: {
    label: 'Twitch', baseUrl: 'https://twitch.tv/',
    color: 'linear-gradient(135deg, #9146FF, #6441a5)',
    iconPath: 'M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z',
  },
};

function buildSocialUrl(platform: string, usernameOrUrl: string): string {
  if (!usernameOrUrl) return '';
  if (usernameOrUrl.startsWith('http://') || usernameOrUrl.startsWith('https://')) return usernameOrUrl;
  const config = SOCIAL_PLATFORMS[platform];
  if (config) return `${config.baseUrl}${usernameOrUrl}`;
  return `https://${platform}.com/${usernameOrUrl}`;
}

// ─── Stats Counter ────────────────────────────────────────────────────────────

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-xl font-bold" style={{ color: '#D4AF37', fontFamily: "'Outfit', sans-serif" }}>
        {value}
      </span>
      <span className="text-[10px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
        {label}
      </span>
    </div>
  );
}

// ─── Social Icon ──────────────────────────────────────────────────────────────

function SocialIcon({ platform, username }: { platform: string; username: string }) {
  const config = SOCIAL_PLATFORMS[platform];
  if (!config || !username) return null;
  const url = buildSocialUrl(platform, username);
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={config.label}
      className="group relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 hover:scale-110 hover:-translate-y-1 active:scale-95"
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
      }}
    >
      <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ background: config.color, opacity: 0 }} />
      <svg viewBox="0 0 24 24" className="w-4 h-4 relative z-10" fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d={config.iconPath} />
      </svg>
    </a>
  );
}

// ─── Install Button ────────────────────────────────────────────────────────────

function InstallButton() {
  const { isInstallable, promptInstall, isStandalone, browser } = usePWAInstall();
  const [showPopup, setShowPopup] = useState(false);

  // If already installed/standalone, never show the button
  if (isStandalone) return null;

  // If it's Chrome and not installable, it means it's either already installed or missing criteria.
  // We hide the button so they don't get the confusing fallback popup.
  if (browser === "chrome" && !isInstallable) return null;

  const handleClick = async () => {
    if (isInstallable) {
      await promptInstall();
    } else {
      setShowPopup(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="mt-4 mr-3 flex items-center justify-center px-4 h-9 rounded-full transition-all active:scale-90 font-bold text-xs tracking-wider uppercase text-black"
        style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #B8962E 100%)', boxShadow: '0 4px 12px rgba(212,175,55,0.3)' }}
      >
        Install App
      </button>

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[9999]">
          <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl shadow-2xl w-80 text-center animate-in zoom-in-95 duration-200">
            <h2 className="text-lg font-bold text-white">Install App</h2>
            {browser === "safari" ? (
              <p className="text-slate-300 text-sm mt-3">
                Open Safari, tap the <strong>Share</strong> button at the bottom, then select{" "}
                <strong>Add to Home Screen</strong>.
              </p>
            ) : browser === "firefox" ? (
              <p className="text-slate-300 text-sm mt-3">
                Open Firefox menu, tap <strong>Install</strong> or manually add
                the app to your home screen.
              </p>
            ) : (
              <p className="text-slate-300 text-sm mt-3">
                Please use your browser menu to add this app to your home screen.
              </p>
            )}
            <button
              onClick={() => setShowPopup(false)}
              className="mt-6 w-full py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Main ProfilePage ─────────────────────────────────────────────────────────

export default function ProfilePage({ appConfig, domain }: { appConfig: any; domain: string }) {
  const [showFullBio, setShowFullBio] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  const profile = appConfig?.themeConfig?.settings?.profile || {};
  const social = appConfig?.themeConfig?.social || {};
  const displayName = appConfig?.appName || profile.fullName || 'CreativeNest Creator';
  const title = profile.title || profile.subtitle || 'Creative Visionary';
  const bio = profile.bio || '';
  const bannerImg = profile.banner || null;
  const avatarImg = appConfig?.appIcon || profile.avatar || null;
  const tags: string[] = Array.isArray(profile.tags) ? profile.tags : [];
  const stats = profile.stats || {};
  const sections = appConfig?.sections || [];
  const links = appConfig?.links || [];
  const socialEntries = Object.entries(social).filter(([, val]) => !!val);

  // Parallax banner
  useEffect(() => {
    const handleScroll = () => {
      if (bannerRef.current) {
        const scrollY = window.scrollY;
        bannerRef.current.style.transform = `translateY(${scrollY * 0.4}px)`;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const truncatedBio = bio.length > 120 ? bio.slice(0, 120) + '...' : bio;

  return (
    <div className="w-full min-h-screen" style={{ background: '#080610' }}>
      {/* ─── Banner ─────────────────────────────────────────────────────── */}
      <div className="relative w-full h-[260px] md:h-[340px] overflow-hidden">
        <div ref={bannerRef} className="absolute inset-0 will-change-transform">
          {bannerImg ? (
            <Image src={bannerImg} alt="Banner" fill className="object-cover" unoptimized priority />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, #1a1028 0%, #2d1f42 30%, #1f2a4a 60%, #0f1a2e 100%)',
              }}
            >
              {/* Luxury gold light rays */}
              <div className="absolute inset-0" style={{
                background: 'radial-gradient(ellipse at 30% 20%, rgba(212,175,55,0.12) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(139,92,246,0.08) 0%, transparent 60%)',
              }} />
              {/* Ambient city-light bokeh */}
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: `${40 + i * 20}px`,
                    height: `${40 + i * 20}px`,
                    left: `${10 + i * 15}%`,
                    top: `${20 + (i % 3) * 25}%`,
                    background: i % 2 === 0
                      ? 'rgba(212,175,55,0.06)'
                      : 'rgba(139,92,246,0.05)',
                    filter: 'blur(20px)',
                    animation: `float${i % 3} ${3 + i}s ease-in-out infinite`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, rgba(8,6,16,0) 0%, rgba(8,6,16,0.3) 50%, rgba(8,6,16,0.95) 100%)',
        }} />
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-safe">
          <div className="mt-4 w-8 h-8" />
          <div className="flex items-center">
            <InstallButton />
            <button
              className="mt-4 flex items-center justify-center w-9 h-9 rounded-full transition-all active:scale-90"
              style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-5 h-5">
                <circle cx="12" cy="5" r="1.5" fill="white" />
                <circle cx="12" cy="12" r="1.5" fill="white" />
                <circle cx="12" cy="19" r="1.5" fill="white" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Profile Card ────────────────────────────────────────────────── */}
      <div className="relative px-4 -mt-24 z-10">
        <div
          className="w-full max-w-lg mx-auto rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(15,12,28,0.85)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            border: '1px solid rgba(212,175,55,0.15)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(212,175,55,0.1)',
          }}
        >
          {/* Avatar Row */}
          <div className="flex items-end gap-4 px-5 pt-5 pb-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div
                className="w-24 h-24 rounded-2xl overflow-hidden"
                style={{
                  border: '2px solid rgba(212,175,55,0.35)',
                  boxShadow: '0 0 0 4px rgba(212,175,55,0.06), 0 8px 32px rgba(0,0,0,0.5)',
                }}
              >
                {avatarImg ? (
                  <Image src={avatarImg} alt="Avatar" width={96} height={96} className="object-cover w-full h-full" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #8b5cf6 100%)' }}>
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              {/* Online indicator */}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: '#D4AF37', boxShadow: '0 0 12px rgba(212,175,55,0.6)' }}>
                <svg viewBox="0 0 24 24" fill="white" className="w-3 h-3">
                  <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </div>
            </div>

            {/* Name & Title */}
            <div className="flex-1 min-w-0 pb-1">
              <h1 className="text-2xl font-black tracking-tight leading-none text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {displayName}
              </h1>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase mt-1" style={{ color: '#D4AF37' }}>
                {title}
              </p>
              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background: 'rgba(212,175,55,0.12)',
                        border: '1px solid rgba(212,175,55,0.25)',
                        color: 'rgba(212,175,55,0.9)',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          {bio && (
            <div className="px-5 pb-4">
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {showFullBio ? bio : truncatedBio}
              </p>
              {bio.length > 120 && (
                <button
                  onClick={() => setShowFullBio(!showFullBio)}
                  className="text-xs font-semibold mt-1 transition-colors"
                  style={{ color: '#D4AF37' }}
                >
                  {showFullBio ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>
          )}

          {/* Stats */}
          {(stats.followers || stats.views || stats.projects) && (
            <div className="flex items-center justify-around px-5 py-3 mx-5 mb-4 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <StatCard value={stats.followers || '124k'} label="Followers" />
              <div className="h-8 w-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <StatCard value={stats.views || '8.2M'} label="Views" />
              <div className="h-8 w-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <StatCard value={stats.projects || '42'} label="Projects" />
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex gap-3 px-5 pb-5">
            <button
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold uppercase tracking-wider transition-all duration-200 hover:scale-[1.02] active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #D4AF37 0%, #B8962E 100%)',
                color: '#0a0810',
                boxShadow: '0 6px 24px rgba(212,175,55,0.3)',
                letterSpacing: '0.08em',
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" />
              </svg>
              Join Exclusive
            </button>
            <button
              className="flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" className="w-5 h-5">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </button>
          </div>

          {/* Social Icons */}
          {socialEntries.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 px-5 pb-5 border-t border-white/[0.05] pt-4">
              {socialEntries.map(([platform, username]) => (
                <SocialIcon key={platform} platform={platform} username={username as string} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Links Block ─────────────────────────────────────────────────── */}
      {links.length > 0 && (
        <div className="mt-4">
          <LinksBlock links={links} domain={domain} />
        </div>
      )}

      {/* ─── Content Sections ────────────────────────────────────────────── */}
      {sections.length > 0 && (
        <div className="mt-2 pb-2">
          <DynamicResolver sections={sections} />
        </div>
      )}
    </div>
  );
}
