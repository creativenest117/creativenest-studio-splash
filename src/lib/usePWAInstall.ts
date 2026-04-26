"use client";
import { useEffect, useState, useCallback } from 'react';

// Global state for prompt so multiple components can access it
let globalDeferredPrompt: any = null;
let listeners: Array<(prompt: any) => void> = [];

const setGlobalPrompt = (prompt: any) => {
  globalDeferredPrompt = prompt;
  listeners.forEach(listener => listener(prompt));
};

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(globalDeferredPrompt);
  const [isStandalone, setIsStandalone] = useState(false);
  const [browser, setBrowser] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const listener = (prompt: any) => {
      setDeferredPrompt(prompt);
    };
    listeners.push(listener);

    const checkStandalone = () => {
      return window.matchMedia('(display-mode: standalone)').matches || 
             (navigator as any).standalone === true;
    };

    setIsStandalone(checkStandalone());

    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes("chrome") && !userAgent.includes("edg")) setBrowser("chrome");
    else if (userAgent.includes("safari") && !userAgent.includes("chrome")) setBrowser("safari");
    else if (userAgent.includes("firefox")) setBrowser("firefox");

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setGlobalPrompt(e);
    };

    const handleAppInstalled = () => {
      setGlobalPrompt(null);
    };

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    mediaQuery.addEventListener('change', handleDisplayModeChange);

    return () => {
      listeners = listeners.filter(l => l !== listener);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      mediaQuery.removeEventListener('change', handleDisplayModeChange);
    };
  }, []);

  const promptInstall = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setGlobalPrompt(null);
    }
    return outcome === "accepted";
  };

  const isInstallable = !!deferredPrompt && !isStandalone;

  return { isInstallable, promptInstall, isStandalone, browser };
}
