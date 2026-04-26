"use client";
import React, { useEffect, useState } from "react";

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [browser, setBrowser] = useState<string>("");
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if currently running in standalone mode
    const checkStandalone = () => {
      return window.matchMedia('(display-mode: standalone)').matches || 
             (navigator as any).standalone === true;
    };

    // Set initial states
    const standalone = checkStandalone();
    setIsStandalone(standalone);

    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes("chrome") && !userAgent.includes("edg")) {
      setBrowser("chrome");
    } else if (userAgent.includes("safari") && !userAgent.includes("chrome")) {
      setBrowser("safari");
    } else if (userAgent.includes("firefox")) {
      setBrowser("firefox");
    }

    // Add event listener for install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      console.log("📱 beforeinstallprompt fired");
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      console.log("✅ App installed!");
      setShowInstallButton(false);
      setDeferredPrompt(null);
    };

    // Listen for standalone mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    mediaQuery.addEventListener('change', handleDisplayModeChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      mediaQuery.removeEventListener('change', handleDisplayModeChange);
    };
  }, []);

  const handleClick = async () => {
    if (!deferredPrompt) {
      console.log("❌ No deferredPrompt available");
      if (browser !== "chrome") {
        setShowPopup(true);
      }
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("🎉 User accepted install");
      setShowInstallButton(false);
    } else {
      console.log("🙅 User dismissed install");
      if (browser !== "chrome") {
        setShowPopup(true);
      }
    }

    setDeferredPrompt(null);
  };

  const handleOpenApp = () => {
    const manifestElement = document.querySelector('link[rel="manifest"]');
    const manifestUrl = manifestElement ? manifestElement.getAttribute('href') : null;
    
    if (manifestUrl) {
      fetch(manifestUrl)
        .then(response => response.json())
        .then(manifest => {
          const startUrl = manifest.start_url || '/';
          window.location.href = startUrl;
        })
        .catch(() => {
          window.location.href = "intent://localhost:3000/#Intent;scheme=http;package=com.creativenest.app;end";
        });
    } else {
      window.location.href = window.location.origin;
    }
  };

  const shouldShowOpenApp = !isStandalone && !showInstallButton;
  const shouldShowInstallButton = !isStandalone && showInstallButton;

  return (
    <>
      {shouldShowInstallButton && (
        <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 bg-slate-900/90 backdrop-blur-md border-t border-white/10 rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom-full duration-500">
          <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
            <div className="flex-1">
              <h3 className="text-white font-bold text-sm">Add to Home Screen</h3>
              <p className="text-slate-400 text-xs">Install for a faster, app-like experience.</p>
            </div>
            <button
              onClick={handleClick}
              className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full text-white font-bold text-sm shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
            >
              Install
            </button>
          </div>
        </div>
      )}

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
                Please use the browser menu to install this app to your home screen.
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
