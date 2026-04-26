import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
  ],
};

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // Get hostname of request (e.g. prabhat.creativenest.app, creativenest.app)
  const hostname = req.headers.get("host") || "";

  // Define allowed domains (including localhost for dev)
  const isIpAddress = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}(:[0-9]+)?$/.test(hostname);
  const isLocalhost = hostname.includes("localhost") || hostname.includes("127.0.0.1") || isIpAddress;

  // Determine if it's a subdomain
  const isSubdomain =
    hostname !== "creativenest.app" &&
    hostname !== "www.creativenest.app" &&
    !isLocalhost &&
    hostname.includes(".");

  const path = url.pathname;

  // 1. Handle Subdomain (e.g., prabhat.creativenest.app -> /[domain]/)
  if (isSubdomain) {
    // Extract the subdomain (e.g. "prabhat")
    const domain = hostname.split(".")[0];
    return NextResponse.rewrite(new URL(`/${domain}${path === "/" ? "" : path}`, req.url));
  }

  // 2. Handle Path-based (e.g., creativenest.app/prabhat -> /[domain]/)
  // Assumes any top level path is a creator profile if not matched by standard routes
  if (path !== "/" && path.split("/").length >= 2) {
    const defaultPages = ["/about", "/contact", "/pricing", "/login", "/signup"];
    const baseSlug = `/${path.split("/")[1]}`;
    
    if (!defaultPages.includes(baseSlug)) {
        const domain = path.split("/")[1];
        const remainingPath = path.replace(`/${domain}`, "");
        return NextResponse.rewrite(new URL(`/${domain}${remainingPath === "/" ? "" : remainingPath}`, req.url));
    }
  }

  // Direct hit to creativenest.app/ -> standard landing page
  return NextResponse.rewrite(new URL(`/home${path === "/" ? "" : path}`, req.url));
}
