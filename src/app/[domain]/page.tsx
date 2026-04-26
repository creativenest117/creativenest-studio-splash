import React from 'react';
import AppShell from '../../components/AppShell';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

// Advanced ISR Engine: Revalidate at most every 30 seconds
export const revalidate = 30;
export const dynamicParams = true;

type Props = {
  params: { domain: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_STUDIO_API}/public/${params.domain}`, {
      next: { revalidate: 30 }
    });

    if (!res.ok) return null;

    const appConfig = await res.json();
    const title = appConfig.appName || appConfig.user?.displayName || 'CreativeNest App';
    const description = appConfig.appTagline || appConfig.themeConfig?.settings?.profile?.bio || 'Powered by CreativeNest';
    const image = appConfig.appIcon || '/logo.png';

    return {
      title: `${title} | CreativeNest`,
      description,
      manifest: `/manifest?domainName=${params.domain}`,
      icons: {
        icon: image,
      },
      openGraph: {
        title: `${title} | CreativeNest`,
        description,
        images: [
          {
            url: image,
            secureUrl: image,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
    };
  } catch (error) {
    return null;
  }
}

export default async function DomainRootPage({ params }: Props) {
  let appConfig = null;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_STUDIO_API}/public/${params.domain}`, {
      next: { revalidate: 30 }
    });

    if (!res.ok) {
      if (res.status === 404) return notFound();
      throw new Error(`Failed to fetch app configuration for ${params.domain}`);
    }
    appConfig = await res.json();
    console.log('====== FETCHED SPLASH DATA for', params.domain, '======');
    console.dir(appConfig, { depth: null });
  } catch (error) {
    console.error(error);
    // Fallback demo config so the UI is still beautiful
    appConfig = {
      appName: 'Alexander Wright',
      appIcon: null,
      themeConfig: {
        settings: {
          profile: {
            fullName: 'Alexander Wright',
            title: 'Architectural Visionary',
            bio: 'Curating spaces that transcend time, exploring the intersection of brutalist forms and delicate luxury across the globe.',
            tags: ['Architecture', 'Design', 'Luxury'],
            stats: { followers: '124k', views: '8.2M', projects: '42' },
          },
        },
        social: {
          instagram: 'alexander.wright',
          twitter: 'alexwright',
          youtube: 'alexanderwright',
          spotify: 'alexanderwright',
        },
      },
      sections: [],
      links: [],
    };
  }

  return <AppShell appConfig={appConfig} domain={params.domain} />;
}
