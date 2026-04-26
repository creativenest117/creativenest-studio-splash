"use client";

import { useEffect, useState } from "react";
import { Section } from "./types";

export const useLiveBridge = (initialSections: Section[]) => {
  const [sections, setSections] = useState<Section[]>(initialSections);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // We listen for layout updates from the creative nest studio iframe parent
      if (event.data && event.data.type === 'STUDIO_UPDATE_SECTIONS') {
        const payload = event.data.payload as Section[];
        setSections([...payload].sort((a, b) => a.sortOrder - b.sortOrder));
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Ping parent Window so Studio knows the PWA app is alive and ready to receive JSON configs
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'PWA_BRIDGE_READY' }, '*');
    }

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return sections;
};
