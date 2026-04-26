'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SpotifyTrack {
  id: string;
  name: string;
  artists: string;
  albumName: string;
  albumArt: string | null;
  previewUrl: string | null;
  durationMs: number;
  durationStr: string;
  spotifyUrl: string | null;
  uri?: string; // spotify:track:ID
}

interface SpotifyData {
  type: 'track' | 'album' | 'playlist' | 'artist';
  title: string;
  subtitle: string;
  coverArt: string | null;
  description?: string;
  spotifyUrl: string | null;
  spotifyUri?: string; // spotify:playlist/album:ID — used for context playback
  releaseYear?: string;
  totalTracks?: number;
  genres?: string[];
  tracks: SpotifyTrack[];
}

type PlayMode = 'preview' | 'sdk';
type ModalState = 'closed' | 'choosing' | 'connecting';

interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// ─── PKCE Helpers (all client-side, standard PKCE = no client_secret needed) ────

function base64urlEncode(buf: ArrayBuffer | Uint8Array): string {
  const arr = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return btoa(String.fromCharCode(...arr))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function generateVerifier(): string {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return base64urlEncode(arr);
}

async function generateChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64urlEncode(digest);
}

// ─── Session Storage Keys ─────────────────────────────────────────────────────

const SK = {
  ACCESS_TOKEN: 'cn_sp_access',
  REFRESH_TOKEN: 'cn_sp_refresh',
  EXPIRES_AT: 'cn_sp_expires',
  CODE_VERIFIER: 'cn_sp_verifier',
  PLAY_MODE: 'cn_sp_mode',          // 'preview' | 'sdk'
  PENDING_URI: 'cn_sp_pending_uri', // context/track URI to play after OAuth
  REDIRECT_URI: 'cn_sp_redir',
} as const;

function loadSession(): AuthSession | null {
  try {
    const at = sessionStorage.getItem(SK.ACCESS_TOKEN);
    const rt = sessionStorage.getItem(SK.REFRESH_TOKEN);
    const ex = sessionStorage.getItem(SK.EXPIRES_AT);
    if (at && rt && ex) return { accessToken: at, refreshToken: rt, expiresAt: parseInt(ex) };
  } catch {}
  return null;
}

function saveSession(s: AuthSession) {
  sessionStorage.setItem(SK.ACCESS_TOKEN, s.accessToken);
  sessionStorage.setItem(SK.REFRESH_TOKEN, s.refreshToken);
  sessionStorage.setItem(SK.EXPIRES_AT, String(s.expiresAt));
}

function clearSession() {
  Object.values(SK).forEach(k => sessionStorage.removeItem(k));
}

function formatProgress(seconds: number) {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
}

// ─── Spotify URI builder ──────────────────────────────────────────────────────
function toSpotifyUri(url: string): string {
  // https://open.spotify.com/playlist/ID → spotify:playlist:ID
  const m = url.match(/open\.spotify\.com\/(track|album|playlist|artist)\/([A-Za-z0-9]+)/);
  if (m) return `spotify:${m[1]}:${m[2]}`;
  return url;
}

// ─── Declare Spotify global types ─────────────────────────────────────────────
declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: any;
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function SpotifyPlayerBlock({ section }: { section: any }) {
  const url = section.url || section.content?.url || '';
  const blockTitle = section.title || section.content?.title || 'Music';

  const apiBase = process.env.NEXT_PUBLIC_STUDIO_API || 'http://localhost:4300';
  const spotifyUri = url ? toSpotifyUri(url) : '';

  // ── Metadata state ──────────────────────────────────────────────────────────
  const [data, setData] = useState<SpotifyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [metaError, setMetaError] = useState<string | null>(null);

  // ── Modal / auth state ──────────────────────────────────────────────────────
  const [modal, setModal] = useState<ModalState>('closed');
  const [session, setSession] = useState<AuthSession | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [sdkError, setSdkError] = useState<string | null>(null);
  const [pendingTrackIndex, setPendingTrackIndex] = useState<number | null>(null);
  const [playMode, setPlayMode] = useState<PlayMode | null>(null);

  // ── Preview player state ────────────────────────────────────────────────────
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(30);
  const [volume, setVolume] = useState(0.8);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── SDK player state ────────────────────────────────────────────────────────
  const sdkPlayerRef = useRef<any>(null);
  const [sdkState, setSdkState] = useState<any>(null); // WebPlaybackState

  // ── Fetch metadata (client-credentials, no user auth) ─────────────────────
  useEffect(() => {
    if (!url) return;
    setLoading(true);
    fetch(`${apiBase}/spotify/resolve?url=${encodeURIComponent(url)}`)
      .then(r => r.json())
      .then((d: any) => {
        if (d.error) throw new Error(d.error);
        // Attach spotify URIs to tracks
        d.tracks = (d.tracks || []).map((t: SpotifyTrack) => ({
          ...t,
          uri: t.spotifyUrl ? `spotify:track:${t.id}` : undefined,
        }));
        setData(d);
      })
      .catch(e => setMetaError(e.message))
      .finally(() => setLoading(false));
  }, [url, apiBase]);

  // ── Handle OAuth callback (code in URL params) ─────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('spotify_code');
    const state = params.get('spotify_state');
    if (!code || state !== 'cn_spotify') return;

    // Clean URL immediately
    const clean = window.location.pathname + window.location.hash;
    window.history.replaceState({}, '', clean);

    const verifier = sessionStorage.getItem(SK.CODE_VERIFIER);
    const redirectUri = sessionStorage.getItem(SK.REDIRECT_URI);
    if (!verifier || !redirectUri) return;

    setModal('connecting');

    fetch(`${apiBase}/spotify/exchange-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, redirect_uri: redirectUri, code_verifier: verifier }),
    })
      .then(r => r.json())
      .then((d: any) => {
        if (d.error) throw new Error(d.error);
        const sess: AuthSession = {
          accessToken: d.access_token,
          refreshToken: d.refresh_token,
          expiresAt: d.expiresAt,
        };
        saveSession(sess);
        setSession(sess);
        setPlayMode('sdk');
        sessionStorage.setItem(SK.PLAY_MODE, 'sdk');
        setModal('closed');
        // Load Web Playback SDK
        loadWebPlaybackSDK(sess.accessToken);
      })
      .catch(e => {
        setSdkError(e.message);
        setModal('closed');
      });
  }, [apiBase]);

  // ── Restore session on mount ───────────────────────────────────────────────
  useEffect(() => {
    const saved = loadSession();
    const savedMode = sessionStorage.getItem(SK.PLAY_MODE) as PlayMode | null;
    if (saved && savedMode === 'sdk') {
      setSession(saved);
      setPlayMode('sdk');
      // Only load SDK if token still valid
      if (Date.now() < saved.expiresAt - 60_000) {
        loadWebPlaybackSDK(saved.accessToken);
      }
    } else if (savedMode === 'preview') {
      setPlayMode('preview');
    }
  }, []);

  // ── Load Spotify Web Playback SDK ──────────────────────────────────────────
  const loadWebPlaybackSDK = useCallback((token: string) => {
    if (typeof window === 'undefined') return;
    if (sdkPlayerRef.current) {
      // Already loaded; reconnect
      sdkPlayerRef.current.connect();
      return;
    }

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'CreativeNest',
        getOAuthToken: (cb: (token: string) => void) => cb(token),
        volume: 0.8,
      });

      player.addListener('ready', ({ device_id }: { device_id: string }) => {
        setDeviceId(device_id);
        setSdkReady(true);
      });
      player.addListener('not_ready', () => setSdkReady(false));
      player.addListener('player_state_changed', (state: any) => setSdkState(state));
      player.addListener('initialization_error', ({ message }: any) => setSdkError(`Init: ${message}`));
      player.addListener('authentication_error', ({ message }: any) => {
        setSdkError(`Auth error: ${message}. Please reconnect.`);
        clearSession();
        setSession(null);
        setSdkReady(false);
      });
      player.addListener('account_error', () => {
        setSdkError('Spotify Premium is required to play full tracks here.');
        setPlayMode('preview');
      });
      player.addListener('playback_error', ({ message }: any) => setSdkError(`Playback: ${message}`));

      player.connect();
      sdkPlayerRef.current = player;
    };

    // Load the SDK script
    if (!document.getElementById('sp-sdk')) {
      const script = document.createElement('script');
      script.id = 'sp-sdk';
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      document.head.appendChild(script);
    } else if (window.Spotify) {
      // Script already loaded; fire manually
      window.onSpotifyWebPlaybackSDKReady();
    }
  }, []);

  // ── SDK: start playback via Web API ───────────────────────────────────────
  async function sdkPlay(trackIndex: number | null) {
    if (!deviceId || !session) return;
    const token = session.accessToken;
    const track = trackIndex !== null ? data?.tracks[trackIndex] : null;

    const body: any = {};
    if (track?.uri) {
      body.uris = [track.uri];
    } else {
      body.context_uri = spotifyUri;
      if (trackIndex !== null) body.offset = { position: trackIndex };
    }

    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setActiveIndex(trackIndex);
    setIsPlaying(true);
  }

  // ── Preview playback ───────────────────────────────────────────────────────
  function stopPreview() {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; }
    if (progressTimer.current) clearInterval(progressTimer.current);
    setIsPlaying(false);
    setProgress(0);
  }

  function playPreview(index: number) {
    const track = data?.tracks[index];
    if (!track?.previewUrl) return;

    if (activeIndex === index && isPlaying) {
      audioRef.current?.pause();
      if (progressTimer.current) clearInterval(progressTimer.current);
      setIsPlaying(false);
      return;
    }

    stopPreview();
    setActiveIndex(index);
    const audio = new Audio(track.previewUrl);
    audio.volume = volume;
    audioRef.current = audio;

    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration || 30));
    audio.addEventListener('ended', () => {
      setIsPlaying(false); setProgress(0);
      if (index + 1 < (data?.tracks.length || 0)) playPreview(index + 1);
    });

    audio.play().then(() => {
      setIsPlaying(true);
      progressTimer.current = setInterval(() => setProgress(audio.currentTime), 200);
    }).catch(() => setSdkError('Could not play preview.'));
  }

  // ── Unified: click play on a track ────────────────────────────────────────
  function handleTrackClick(index: number) {
    if (playMode === 'sdk') {
      if (sdkReady) sdkPlay(index);
      else setPendingTrackIndex(index); // will play once device is ready
      return;
    }
    if (playMode === 'preview') {
      playPreview(index);
      return;
    }
    // First time: show choice modal
    setPendingTrackIndex(index);
    setModal('choosing');
  }

  // Fire pending track once SDK device is ready
  useEffect(() => {
    if (sdkReady && pendingTrackIndex !== null && playMode === 'sdk') {
      sdkPlay(pendingTrackIndex);
      setPendingTrackIndex(null);
    }
  }, [sdkReady, pendingTrackIndex, playMode]);

  // ── OAuth: open Spotify login ──────────────────────────────────────────────
  async function startSpotifyAuth() {
    const configRes = await fetch(`${apiBase}/spotify/config`).catch(() => null);
    if (!configRes?.ok) {
      setSdkError('Spotify is not configured on this server.');
      setModal('closed');
      return;
    }
    const { clientId } = await configRes.json();

    const verifier = generateVerifier();
    const challenge = await generateChallenge(verifier);
    const redirectUri = `${window.location.origin}${window.location.pathname}`;

    sessionStorage.setItem(SK.CODE_VERIFIER, verifier);
    sessionStorage.setItem(SK.REDIRECT_URI, redirectUri);
    sessionStorage.setItem(SK.PENDING_URI, spotifyUri);

    const scopes = ['streaming', 'user-read-email', 'user-read-private', 'user-read-playback-state', 'user-modify-playback-state'].join(' ');

    const authUrl = new URL('https://accounts.spotify.com/authorize');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', 'cn_spotify');
    authUrl.searchParams.set('scope', scopes);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    authUrl.searchParams.set('code_challenge', challenge);

    window.location.href = authUrl.toString();
  }

  function openInSpotify() {
    const target = data?.spotifyUrl || url;
    window.open(target, '_blank', 'noopener,noreferrer');
    setModal('closed');
    // On mobile, try the deep link too
    window.location.href = `spotify:${toSpotifyUri(url).replace('spotify:', '')}`;
    setTimeout(() => {}, 1000);
  }

  function choosePreviewMode() {
    setPlayMode('preview');
    sessionStorage.setItem(SK.PLAY_MODE, 'preview');
    setModal('closed');
    if (pendingTrackIndex !== null) playPreview(pendingTrackIndex);
  }

  function disconnectSdk() {
    sdkPlayerRef.current?.disconnect();
    sdkPlayerRef.current = null;
    clearSession();
    setSession(null);
    setSdkReady(false);
    setDeviceId(null);
    setPlayMode(null);
    setIsPlaying(false);
    setActiveIndex(null);
    setSdkError(null);
  }

  useEffect(() => () => { stopPreview(); sdkPlayerRef.current?.disconnect(); }, []);

  // ── Derived values ─────────────────────────────────────────────────────────
  const progressPct = duration > 0 ? (progress / duration) * 100 : 0;
  // For SDK mode, derive playing/active from SDK state
  const sdkTrack = sdkState?.track_window?.current_track;
  const sdkIsPlaying = sdkState ? !sdkState.paused : false;
  const sdkProgress = sdkState?.position ? sdkState.position / 1000 : 0;
  const sdkDuration = sdkState?.duration ? sdkState.duration / 1000 : 0;

  const displayPlaying = playMode === 'sdk' ? sdkIsPlaying : isPlaying;
  const displayProgress = playMode === 'sdk' ? sdkProgress : progress;
  const displayDuration = playMode === 'sdk' ? sdkDuration : duration;
  const displayProgressPct = displayDuration > 0 ? (displayProgress / displayDuration) * 100 : 0;

  // ── Render loading ──────────────────────────────────────────────────────────
  if (!url) return null;
  if (loading) return <SpotifySkeleton />;
  if (metaError) return <SpotifyError url={url} error={metaError} />;
  if (!data) return null;

  return (
    <>
      {/* ── Choice / Connecting Modal ────────────────────────────────── */}
      {modal !== 'closed' && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={e => { if (e.target === e.currentTarget) setModal('closed'); }}
        >
          <div
            className="w-full max-w-md rounded-t-3xl p-6 pb-8"
            style={{
              background: 'linear-gradient(180deg, rgba(18,18,18,0.98) 0%, rgba(10,10,10,0.99) 100%)',
              border: '1px solid rgba(29,185,84,0.2)',
              borderBottom: 'none',
              animation: 'slideUp 0.3s ease',
            }}
          >
            {modal === 'connecting' ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin" style={{ border: '3px solid rgba(29,185,84,0.2)', borderTop: '3px solid #1db954' }} />
                <p className="text-white font-semibold mb-1">Connecting your Spotify…</p>
                <p className="text-white/40 text-sm">Exchanging tokens</p>
              </div>
            ) : (
              <>
                {/* Cover + Title */}
                <div className="flex items-center gap-4 mb-6">
                  {data.coverArt && (
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 shadow-lg">
                      <Image src={data.coverArt} alt="" fill className="object-cover" unoptimized />
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: '#1db954' }}>How would you like to listen?</p>
                    <p className="font-semibold text-white text-sm leading-snug">{data.title}</p>
                    <p className="text-xs text-white/50">{data.subtitle}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Option A: Open in Spotify app */}
                  <button
                    onClick={openInSpotify}
                    className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
                    style={{ background: 'rgba(29,185,84,0.12)', border: '1px solid rgba(29,185,84,0.3)' }}
                  >
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#1db954,#158a3e)' }}>
                      <SpotifyLogo className="w-6 h-6" fill="white" />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">Open in Spotify</p>
                      <p className="text-xs text-white/50">Full quality · Spotify app or web</p>
                    </div>
                    <svg viewBox="0 0 24 24" className="w-4 h-4 ml-auto shrink-0 text-white/30" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
                  </button>

                  {/* Option B: Play here (SDK) */}
                  <button
                    onClick={startSpotifyAuth}
                    className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }}
                  >
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">Play here</p>
                      <p className="text-xs text-white/50">Requires Spotify Premium · Login with Spotify</p>
                    </div>
                    <svg viewBox="0 0 24 24" className="w-4 h-4 ml-auto shrink-0 text-white/30" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
                  </button>

                  {/* Option C: 30s Preview (no auth) */}
                  <button
                    onClick={choosePreviewMode}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="rgba(255,255,255,0.6)"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
                    </div>
                    <div>
                      <p className="font-medium text-white/80 text-sm">30-second previews</p>
                      <p className="text-xs text-white/40">No login needed · Short clips</p>
                    </div>
                  </button>
                </div>

                <button onClick={() => setModal('closed')} className="mt-4 w-full text-center text-sm text-white/30 hover:text-white/50 transition-colors py-2">Cancel</button>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>

      {/* ── Player Card ──────────────────────────────────────────────── */}
      <section className="w-full px-4 py-5">
        <div
          className="w-full max-w-2xl mx-auto rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(29,185,84,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}
        >
          {/* ── Header ─────────────────────────────────────────────────── */}
          <div className="flex items-center gap-4 p-4 pb-0">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 shadow-lg">
              {data.coverArt ? (
                <Image src={data.coverArt} alt={data.title} fill className="object-cover" unoptimized />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#1db954,#158a3e)' }}>
                  <SpotifyLogo className="w-10 h-10" fill="white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <SpotifyLogo className="w-4 h-4 shrink-0" fill="#1db954" />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#1db954' }}>{data.type}</span>
              </div>
              <h3 className="font-bold text-white leading-snug text-base truncate">{data.title}</h3>
              <p className="text-xs truncate mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{data.subtitle}</p>
              {data.genres && data.genres.length > 0 && (
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  {data.genres.map(g => (
                    <span key={g} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(29,185,84,0.15)', color: '#1db954', border: '1px solid rgba(29,185,84,0.3)' }}>{g}</span>
                  ))}
                </div>
              )}
            </div>
            {/* Connect/Disconnect button */}
            {playMode === 'sdk' && session ? (
              <button onClick={disconnectSdk} title="Disconnect Spotify" className="shrink-0 p-2 rounded-full transition-opacity hover:opacity-70" style={{ background: 'rgba(29,185,84,0.15)' }}>
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#1db954"><path d="M13 3a9 9 0 0 1 9 9c0 1.88-.59 3.63-1.59 5.07L18 14H13V9l2.1 2.1A7 7 0 0 0 13 5H5v2H3V3h10zM3 21a9 9 0 0 1-1.41-12.93L3 10h5v5H6.41l1.59 1.59A7 7 0 0 0 19 14h2a9 9 0 0 1-18 7z"/></svg>
              </button>
            ) : (
              data.spotifyUrl && (
                <a href={data.spotifyUrl} target="_blank" rel="noopener noreferrer" title="Open in Spotify" className="shrink-0 p-2 rounded-full transition-opacity hover:opacity-70" style={{ background: 'rgba(29,185,84,0.15)' }}>
                  <SpotifyLogo className="w-4 h-4" fill="#1db954" />
                </a>
              )
            )}
          </div>

          {/* ── SDK Status Banner ──────────────────────────────────────── */}
          {playMode === 'sdk' && (
            <div className="mx-4 mt-3 px-3 py-2 rounded-xl flex items-center gap-2" style={{ background: sdkReady ? 'rgba(29,185,84,0.1)' : 'rgba(255,200,0,0.08)', border: `1px solid ${sdkReady ? 'rgba(29,185,84,0.2)' : 'rgba(255,200,0,0.2)'}` }}>
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: sdkReady ? '#1db954' : '#ffc800', animation: sdkReady ? 'none' : 'pulse 1.5s infinite' }} />
              <p className="text-xs" style={{ color: sdkReady ? '#1db954' : '#ffc800' }}>
                {sdkReady ? '● Connected — Full playback active (Spotify Premium)' : 'Connecting to Spotify…'}
              </p>
            </div>
          )}

          {/* ── Error Banner ──────────────────────────────────────────── */}
          {sdkError && (
            <div className="mx-4 mt-2 px-3 py-2 rounded-xl flex items-center justify-between gap-2" style={{ background: 'rgba(255,60,60,0.1)', border: '1px solid rgba(255,60,60,0.2)' }}>
              <p className="text-xs text-red-400 flex-1">{sdkError}</p>
              <button onClick={() => setSdkError(null)} className="text-red-400/60 hover:text-red-400 text-xs">✕</button>
            </div>
          )}

          {/* ── Now Playing Bar ───────────────────────────────────────── */}
          {(activeIndex !== null || (playMode === 'sdk' && sdkState)) && (
            <NowPlayingBar
              track={playMode === 'sdk' && sdkTrack
                ? { name: sdkTrack.name, artists: [sdkTrack.artists[0]?.name].filter(Boolean).join(', '), albumArt: sdkTrack.album_images?.[0]?.url || null }
                : activeIndex !== null && data.tracks[activeIndex]
                  ? { name: data.tracks[activeIndex].name, artists: data.tracks[activeIndex].artists, albumArt: data.tracks[activeIndex].albumArt }
                  : null
              }
              isPlaying={displayPlaying}
              progress={displayProgress}
              duration={displayDuration}
              progressPct={displayProgressPct}
              volume={volume}
              onToggle={() => {
                if (playMode === 'sdk') { sdkPlayerRef.current?.togglePlay(); }
                else if (activeIndex !== null) {
                  if (isPlaying) { audioRef.current?.pause(); setIsPlaying(false); }
                  else { audioRef.current?.play().then(() => setIsPlaying(true)); }
                }
              }}
              onPrev={() => {
                if (playMode === 'sdk') { sdkPlayerRef.current?.previousTrack(); }
                else if (activeIndex !== null && activeIndex > 0) playPreview(activeIndex - 1);
              }}
              onNext={() => {
                if (playMode === 'sdk') { sdkPlayerRef.current?.nextTrack(); }
                else if (activeIndex !== null && activeIndex < (data.tracks.length - 1)) playPreview(activeIndex + 1);
              }}
              onSeek={(ratio) => {
                if (playMode === 'sdk') { sdkPlayerRef.current?.seek(ratio * displayDuration * 1000); }
                else if (audioRef.current) { audioRef.current.currentTime = ratio * duration; setProgress(ratio * duration); }
              }}
              onVolume={(v) => {
                setVolume(v);
                if (playMode === 'sdk') sdkPlayerRef.current?.setVolume(v);
                else if (audioRef.current) audioRef.current.volume = v;
              }}
              mode={playMode}
            />
          )}

          {/* ── Track List ────────────────────────────────────────────── */}
          <div className="px-4 pb-4 mt-3 space-y-1 max-h-96 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(29,185,84,0.3) transparent' }}>
            {data.tracks.map((track, i) => {
              const isActiveTrack = playMode === 'sdk'
                ? sdkTrack?.name === track.name
                : activeIndex === i;
              const hasPreview = !!track.previewUrl;
              const canPlay = playMode === 'sdk' ? true : hasPreview;

              return (
                <button
                  key={track.id + i}
                  onClick={() => handleTrackClick(i)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group"
                  style={{
                    background: isActiveTrack ? 'rgba(29,185,84,0.15)' : 'transparent',
                    border: isActiveTrack ? '1px solid rgba(29,185,84,0.3)' : '1px solid transparent',
                    opacity: (!canPlay && playMode === 'preview') ? 0.4 : 1,
                    cursor: (!canPlay && playMode === 'preview') ? 'not-allowed' : 'pointer',
                  }}
                >
                  {/* Index / wave */}
                  <div className="w-7 text-center shrink-0">
                    {isActiveTrack && displayPlaying ? (
                      <SoundWave />
                    ) : (
                      <span className="text-xs font-mono group-hover:hidden block" style={{ color: isActiveTrack ? '#1db954' : 'rgba(255,255,255,0.3)' }}>{String(i + 1).padStart(2, '0')}</span>
                    )}
                    {(!isActiveTrack || !displayPlaying) && (
                      <svg viewBox="0 0 24 24" className="w-4 h-4 mx-auto hidden group-hover:block" fill="rgba(255,255,255,0.7)"><path d="M8 5v14l11-7z"/></svg>
                    )}
                  </div>

                  {/* Art */}
                  {track.albumArt && (
                    <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0">
                      <Image src={track.albumArt} alt="" fill className="object-cover" unoptimized />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight truncate" style={{ color: isActiveTrack ? '#1db954' : '#fff' }}>{track.name}</p>
                    <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{track.artists}</p>
                  </div>

                  {/* Duration + preview icon */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {!hasPreview && playMode !== 'sdk' && (
                      <span title="No preview available" className="text-[9px] px-1.5 py-0.5 rounded font-medium" style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.3)' }}>no preview</span>
                    )}
                    <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.35)' }}>{track.durationStr}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── Footer ───────────────────────────────────────────────── */}
          <div className="px-4 pb-3 pt-1 flex items-center justify-between border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2">
              {playMode === null && (
                <p className="text-[10px] text-white/25">Click any track to choose how to listen</p>
              )}
              {playMode === 'preview' && (
                <button onClick={() => { setPlayMode(null); sessionStorage.removeItem(SK.PLAY_MODE); }} className="text-[10px] text-white/30 hover:text-white/50 transition-colors">
                  Switch to Spotify Premium →
                </button>
              )}
              {playMode === 'sdk' && sdkReady && (
                <p className="text-[10px]" style={{ color: '#1db954' }}>🎵 Streaming via Spotify Premium</p>
              )}
            </div>
            {data.spotifyUrl && (
              <a href={data.spotifyUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-semibold hover:opacity-70 transition-opacity" style={{ color: '#1db954' }}>
                Open in Spotify →
              </a>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

// ─── Now Playing Bar Sub-component ───────────────────────────────────────────

interface NowPlayingProps {
  track: { name: string; artists: string; albumArt: string | null } | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  progressPct: number;
  volume: number;
  onToggle: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeek: (ratio: number) => void;
  onVolume: (v: number) => void;
  mode: PlayMode | null;
}

function NowPlayingBar({ track, isPlaying, progress, duration, progressPct, volume, onToggle, onPrev, onNext, onSeek, onVolume, mode }: NowPlayingProps) {
  return (
    <div className="mx-4 mt-3 rounded-xl p-3" style={{ background: 'rgba(29,185,84,0.1)', border: '1px solid rgba(29,185,84,0.2)' }}>
      <div className="flex items-center gap-3">
        {track?.albumArt && (
          <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
            <Image src={track.albumArt} alt="" fill className="object-cover" unoptimized />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{track?.name || '...'}</p>
          <p className="text-xs truncate text-white/50">{track?.artists || ''}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onPrev} className="p-1.5 rounded-full hover:opacity-70 transition-opacity"><SkipBackIcon /></button>
          <button onClick={onToggle} className="w-9 h-9 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform" style={{ background: '#1db954' }}>
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button onClick={onNext} className="p-1.5 rounded-full hover:opacity-70 transition-opacity"><SkipNextIcon /></button>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-2.5 flex items-center gap-2">
        <span className="text-[10px] font-mono tabular-nums text-white/40">{formatProgress(progress)}</span>
        <div
          className="flex-1 h-1 rounded-full cursor-pointer relative overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.15)' }}
          onClick={e => {
            const rect = e.currentTarget.getBoundingClientRect();
            onSeek((e.clientX - rect.left) / rect.width);
          }}
        >
          <div className="absolute left-0 top-0 h-full rounded-full" style={{ width: `${progressPct}%`, background: '#1db954', transition: 'width 0.2s linear' }} />
        </div>
        <span className="text-[10px] font-mono tabular-nums text-white/40">{formatProgress(duration)}</span>
      </div>

      {/* Volume */}
      <div className="mt-2 flex items-center gap-2">
        <svg viewBox="0 0 24 24" className="w-3 h-3 shrink-0 text-white/40" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
        <input type="range" min={0} max={1} step={0.05} value={volume} onChange={e => onVolume(parseFloat(e.target.value))} className="flex-1 h-1 cursor-pointer accent-green-500" style={{ accentColor: '#1db954' }} />
      </div>

      {mode === 'preview' && (
        <p className="text-center text-[10px] mt-1.5 text-white/30">30-second preview</p>
      )}
    </div>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────
function SpotifySkeleton() {
  return (
    <section className="w-full px-4 py-5">
      <div className="w-full max-w-2xl mx-auto rounded-2xl p-4 animate-pulse" style={{ background: 'rgba(29,185,84,0.06)', border: '1px solid rgba(29,185,84,0.12)' }}>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 rounded-xl bg-white/10 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-white/10 rounded w-3/4" />
            <div className="h-3 bg-white/10 rounded w-1/2" />
          </div>
        </div>
        {[1,2,3,4].map(i => <div key={i} className="h-10 bg-white/10 rounded-xl mb-1" />)}
      </div>
    </section>
  );
}

// ─── Error state ───────────────────────────────────────────────────────────────
function SpotifyError({ url, error }: { url: string; error: string }) {
  return (
    <section className="w-full px-4 py-5">
      <div className="w-full max-w-2xl mx-auto rounded-2xl p-5 text-center" style={{ background: 'rgba(29,185,84,0.06)', border: '1px solid rgba(29,185,84,0.15)' }}>
        <SpotifyLogo className="w-8 h-8 mx-auto mb-3" fill="rgba(29,185,84,0.5)" />
        <p className="text-white/40 text-xs mb-4">{error}</p>
        <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg,#1db954,#158a3e)' }}>
          Open on Spotify
        </a>
      </div>
    </section>
  );
}

// ─── SVG Icons ─────────────────────────────────────────────────────────────────
function SpotifyLogo({ className, fill }: { className?: string; fill?: string }) {
  return <svg viewBox="0 0 24 24" className={className} fill={fill || 'currentColor'}><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>;
}

function PlayIcon() { return <svg viewBox="0 0 24 24" className="w-5 h-5 ml-0.5" fill="white"><path d="M8 5v14l11-7z"/></svg>; }
function PauseIcon() { return <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>; }
function SkipBackIcon() { return <svg viewBox="0 0 24 24" className="w-4 h-4" fill="rgba(255,255,255,0.7)"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>; }
function SkipNextIcon() { return <svg viewBox="0 0 24 24" className="w-4 h-4" fill="rgba(255,255,255,0.7)"><path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 13.96V9.86zM16 6h2v12h-2z"/></svg>; }

function SoundWave() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#1db954">
      <rect x="2" y="10" width="3" height="4" rx="1"><animate attributeName="height" values="4;12;4" dur="0.8s" repeatCount="indefinite" begin="0s"/><animate attributeName="y" values="10;6;10" dur="0.8s" repeatCount="indefinite" begin="0s"/></rect>
      <rect x="7" y="7" width="3" height="10" rx="1"><animate attributeName="height" values="10;4;10" dur="0.8s" repeatCount="indefinite" begin="0.2s"/><animate attributeName="y" values="7;10;7" dur="0.8s" repeatCount="indefinite" begin="0.2s"/></rect>
      <rect x="12" y="5" width="3" height="14" rx="1"><animate attributeName="height" values="14;6;14" dur="0.8s" repeatCount="indefinite" begin="0.1s"/><animate attributeName="y" values="5;9;5" dur="0.8s" repeatCount="indefinite" begin="0.1s"/></rect>
      <rect x="17" y="8" width="3" height="8" rx="1"><animate attributeName="height" values="8;14;8" dur="0.8s" repeatCount="indefinite" begin="0.3s"/><animate attributeName="y" values="8;5;8" dur="0.3s" repeatCount="indefinite" begin="0.3s"/></rect>
    </svg>
  );
}
