"use client";
import React, { useEffect, useState } from 'react';

export default function InstallPwaButton({ appName }: { appName?: string }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent browser from automatically showing the prompt natively immediately
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Reveal the custom Install CTA Button
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the actual browser native install prompt
    deferredPrompt.prompt();
    
    // Wait for user interaction
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    // Dispose the prompt mapping until next event fired
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  if (!isInstallable) return null;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 mb-6 flex flex-col items-center justify-center text-center bg-gradient-to-tr from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-3xl border border-blue-100 dark:border-gray-700 shadow-sm mx-4 transition-all w-[calc(100%-2rem)]">
      <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-full mb-3 shadow-inner">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Get the {appName || "Creator"} App
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 max-w-sm">
        Add this Creator profile directly to your home screen for an app-like experience and quick access.
      </p>
      <button 
        onClick={handleInstallClick}
        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold rounded-full shadow-lg transition-all active:scale-95"
      >
        Install Now
      </button>
    </div>
  );
}
