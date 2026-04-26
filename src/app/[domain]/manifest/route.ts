import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { domain: string } }) {
    try {
        // Fetch from studio backend
        // const res = await fetch(`${process.env.NEXT_PUBLIC_STUDIO_API}/studio/pwa/manifest?domainName=${params.domain}`, { cache: "no-store" });
        // const data = await res.json();
        
        // Mocked response for scaffolding
        const data = {
            name: `${params.domain} App`,
            short_name: params.domain,
            start_url: "/",
            display: "standalone",
            background_color: "#000000",
            theme_color: "#ffffff",
            icons: [
                {
                    src: "/icon-192x192.png",
                    sizes: "192x192",
                    type: "image/png"
                }
            ]
        };

        return new NextResponse(JSON.stringify(data), {
            status: 200,
            headers: {
                'Content-Type': 'application/manifest+json',
                'Cache-Control': 'no-cache'
            }
        });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to fetch PWA manifest' }, { status: 500 });
    }
}
