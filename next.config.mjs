/** @type {import('next').NextConfig} */
import withPWA from "@ducanh2912/next-pwa";

const withPWACustomConfig = withPWA({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: false, // Must be false to test PWA installation on mobile during dev
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "pub-*.r2.dev" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default withPWACustomConfig(nextConfig);
