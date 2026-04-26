import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const domainName = searchParams.get('domainName');

  if (!domainName) {
    return NextResponse.json({ error: "Missing domainName" }, { status: 400 });
  }

  try {
    const studioResponse = await fetch(`${process.env.NEXT_PUBLIC_STUDIO_API}/public/${domainName}`, {
      cache: "no-store"
    });

    if (studioResponse.ok) {
      const appData = await studioResponse.json();
      
      const appName = appData.appName || appData.user?.displayName || "CreativeNest App";
      const appTagline = appData.appTagline || "Powered by CreativeNest";
      const profile = appData.themeConfig?.settings?.profile || {};
      const appIcon = appData.appIcon || profile.avatar || "/favicon.ico";
      
      // Default colors if not present in theme
      const bgColor = appData.themeConfig?.appearance?.backgroundColor || "#080610";
      const themeColor = appData.themeConfig?.appearance?.themeColor || "#080610";

      const manifestPayload = {
        name: appName,
        short_name: appName,
        description: appTagline,
        start_url: `/`, 
        display: "standalone",
        background_color: bgColor,
        theme_color: themeColor,
        icons: [
          {
            src: appIcon,
            sizes: "192x192",
            purpose: "any maskable"
          },
          {
            src: appIcon,
            sizes: "512x512",
            purpose: "any maskable"
          }
        ]
      };

      // Ensure start_url is relative to the root or correct origin
      manifestPayload.start_url = '/';

      return new NextResponse(JSON.stringify(manifestPayload), {
        status: 200,
        headers: {
          'Content-Type': 'application/manifest+json',
          'Cache-Control': 'no-cache'
        }
      });
    } else {
        return NextResponse.json({ error: "Studio config not found" }, { status: 404 });
    }
  } catch (err) {
    console.error("Manifest generation error:", err);
    return NextResponse.json({ error: 'Failed to fetch manifest' }, { status: 500 });
  }
}
