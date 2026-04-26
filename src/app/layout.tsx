import type { Metadata, Viewport } from 'next';
import './globals.css';
import { headers } from 'next/headers';

export const metadata: Metadata = {
  title: 'CreativeNest',
  description: 'Creator & Business Platform — Magazine, Gallery, OTT, Radio, TV',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#080610',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body style={{ overscrollBehavior: 'none', userSelect: 'none' }}>
        {children}
      </body>
    </html>
  );
}
