'use client';

import Image from 'next/image';

// Platform config: maps stored key → { full URL builder, brand color, SVG icon path }
const SOCIAL_PLATFORMS: Record<string, { label: string; baseUrl: string; color: string; iconPath: string }> = {
  instagram: {
    label: 'Instagram',
    baseUrl: 'https://instagram.com/',
    color: '#E1306C',
    iconPath: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
  },
  twitter: {
    label: 'X / Twitter',
    baseUrl: 'https://x.com/',
    color: '#000000',
    iconPath: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  },
  linkedin: {
    label: 'LinkedIn',
    baseUrl: 'https://linkedin.com/in/',
    color: '#0A66C2',
    iconPath: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  },
  youtube: {
    label: 'YouTube',
    baseUrl: 'https://youtube.com/@',
    color: '#FF0000',
    iconPath: 'M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z',
  },
  spotify: {
    label: 'Spotify',
    baseUrl: 'https://open.spotify.com/artist/',
    color: '#1DB954',
    iconPath: 'M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z',
  },
  applemusic: {
    label: 'Apple Music',
    baseUrl: 'https://music.apple.com/artist/',
    color: '#FC3C44',
    iconPath: 'M23.994 6.124a9.23 9.23 0 0 0-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 0 0-1.877-.726 10.496 10.496 0 0 0-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026C4.786.07 4.043.15 3.34.428 2.004.958 1.04 1.88.475 3.208A4.98 4.98 0 0 0 .05 4.822c-.01.08-.014.162-.02.243V19.09c.006.065.012.13.017.195.03.382.105.757.2 1.12.285 1.107.876 2.014 1.79 2.734.607.484 1.304.806 2.064.965.382.08.77.13 1.16.144.12.005.24.01.358.012H19.73c1.272-.016 2.44-.38 3.46-1.1.76-.54 1.355-1.223 1.73-2.1.186-.43.293-.876.348-1.34.02-.16.032-.32.04-.48V6.334c-.003-.07-.006-.14-.01-.21zm-3.49 11.365c-.032.38-.13.73-.343 1.047-.342.513-.834.78-1.445.815-.524.03-1.004-.125-1.41-.475-.55-.474-.724-1.1-.583-1.797.115-.564.478-.928 1.002-1.12a4.6 4.6 0 0 1 1.367-.236c.29-.012.582-.005.85.062v-5.98a.23.23 0 0 0-.18-.22l-6.53-1.447a.232.232 0 0 0-.286.225v8.29c-.025.39-.108.764-.31 1.105-.337.575-.845.893-1.504.935-.5.03-.964-.093-1.37-.387-.71-.514-.944-1.302-.608-2.087.246-.58.686-.916 1.265-1.093a5.26 5.26 0 0 1 1.426-.195v-.001c.234 0 .47.018.7.065V7.01c0-.155.094-.286.243-.32l8.14-1.847c.156-.036.31.044.35.197.007.023.01.048.01.074v12.375z',
  },
  twitch: {
    label: 'Twitch',
    baseUrl: 'https://twitch.tv/',
    color: '#9146FF',
    iconPath: 'M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z',
  },
  facebook: {
    label: 'Facebook',
    baseUrl: 'https://facebook.com/',
    color: '#1877F2',
    iconPath: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  },
  github: {
    label: 'GitHub',
    baseUrl: 'https://github.com/',
    color: '#ffffff',
    iconPath: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
  },
  soundcloud: {
    label: 'SoundCloud',
    baseUrl: 'https://soundcloud.com/',
    color: '#FF5500',
    iconPath: 'M1.175 12.225C.5 12.225 0 12.75 0 13.4v.Ki 0 .65.5 1.175 1.175 1.175s1.175-.525 1.175-1.175v-.05c0-.65-.525-1.1-1.175-1.1zm-.899 2.105c-.14 0-.276-.056-.276-.19V12.5c0-.133.136-.19.276-.19.14 0 .275.057.275.19v1.64c0 .134-.136.19-.275.19zM24 11.525c0-1.8-1.45-3.25-3.25-3.25-.325 0-.65.05-.975.15-.425-2.25-2.4-3.95-4.8-3.95-1.45 0-2.75.575-3.7 1.5-.6.55-1.025 1.25-1.3 2C9.125 7.6 8.25 7.2 7.275 7.2c-1.9 0-3.45 1.525-3.5 3.4-.25.125-.45.3-.625.5C2.675 11.525 2.25 12.225 2.25 13c0 1.5 1.225 2.725 2.725 2.725H21.275C22.775 15.725 24 14.5 24 13c0-.55-.15-1.075-.425-1.5-.225-.5-.575-.95-.975-1.2-.225-.85-.85-1.575-1.6-1.775zM5.5 11.9c.175-.725.65-1.325 1.275-1.7-.5-.375-1.075-.575-1.7-.575-.75 0-1.425.3-1.925.775.15-.05.3-.075.45-.075.95 0 1.75.6 1.9 1.575z',
  },
};

function buildSocialUrl(platform: string, usernameOrUrl: string): string {
  if (!usernameOrUrl) return '';
  // If it's already a full URL, return as-is
  if (usernameOrUrl.startsWith('http://') || usernameOrUrl.startsWith('https://')) {
    return usernameOrUrl;
  }
  const config = SOCIAL_PLATFORMS[platform];
  if (config) return `${config.baseUrl}${usernameOrUrl}`;
  return `https://${platform}.com/${usernameOrUrl}`;
}

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
      className="group relative flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-300 hover:scale-110 hover:-translate-y-1 active:scale-95"
      style={{
        background: 'rgba(255,255,255,0.07)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.15)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
      }}
    >
      <span
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at center, ${config.color}33, transparent 70%)`,
        }}
      />
      <svg
        viewBox="0 0 24 24"
        className="w-5 h-5 relative z-10 transition-colors duration-300"
        fill={config.color}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={config.iconPath} />
      </svg>
    </a>
  );
}

export default function ProfileHeader({ themeConfig, appIcon, appName }: any) {
  const profile = themeConfig?.settings?.profile || {};
  const social = themeConfig?.social || {};

  const displayName = appName || profile.fullName || 'CreativeNest Creator';
  const bio = profile.bio || '';
  const bannerImg = profile.banner || null;
  const avatarImg = appIcon || profile.avatar || null;
  const tags: string[] = Array.isArray(profile.tags) ? profile.tags : [];

  const socialEntries = Object.entries(social).filter(([, val]) => !!val);

  return (
    <div className="w-full relative">
      {/* ─── Banner ─────────────────────────────────────────────────────── */}
      <div className="relative w-full h-52 md:h-72 overflow-hidden">
        {bannerImg ? (
          <Image src={bannerImg} alt="Banner" fill className="object-cover" unoptimized priority />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
            }}
          />
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      </div>

      {/* ─── Profile Card ──────────────────────────────────────────────── */}
      <div className="relative px-4 pb-6 -mt-20 flex flex-col items-center z-10">
        {/* Glassmorphic card */}
        <div
          className="w-full max-w-lg rounded-3xl px-6 pt-20 pb-7 flex flex-col items-center gap-3 relative"
          style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 8px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          {/* Avatar – sits half above the card */}
          <div
            className="absolute -top-14 left-1/2 -translate-x-1/2 w-[108px] h-[108px] rounded-full overflow-hidden"
            style={{
              border: '3px solid rgba(255,255,255,0.2)',
              boxShadow: '0 0 0 4px rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.6)',
            }}
          >
            {avatarImg ? (
              <Image src={avatarImg} alt="Avatar" fill className="object-cover" unoptimized priority />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-4xl font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
              >
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Name */}
          <h1
            className="text-2xl sm:text-3xl font-extrabold text-center tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #c8b6ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.2,
            }}
          >
            {displayName}
          </h1>

          {/* Bio */}
          {bio && (
            <p className="text-sm sm:text-base text-white/60 text-center leading-relaxed max-w-xs">
              {bio}
            </p>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-medium px-3 py-1 rounded-full"
                  style={{
                    background: 'rgba(139,92,246,0.2)',
                    border: '1px solid rgba(139,92,246,0.4)',
                    color: '#c4b5fd',
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Social Icons */}
          {socialEntries.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-3">
              {socialEntries.map(([platform, username]) => (
                <SocialIcon key={platform} platform={platform} username={username as string} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
