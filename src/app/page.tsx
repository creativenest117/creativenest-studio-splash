"use client";

import { useLiveBridge } from "../lib/useLiveBridge";
import DynamicResolver from "../components/DynamicResolver";

export default function Engine() {
  // Initial empty sections. In production, this would be fetched server-side for the current tenant.
  const sections = useLiveBridge([]);

  return (
    <main className="flex min-h-screen flex-col w-full bg-white relative">
      {sections.length === 0 ? (
        <div className="flex h-screen items-center justify-center bg-gray-50 flex-col gap-4 text-center">
           <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
           <p className="text-gray-500 font-medium">CreativeNest Splash Engine Active.<br/>Waiting for Studio connection...</p>
        </div>
      ) : (
        <DynamicResolver sections={sections} />
      )}
    </main>
  );
}
