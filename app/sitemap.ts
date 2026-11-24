import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const defaultBase = 'https://fralda.online';
  const envBase = process.env.NEXT_PUBLIC_APP_URL;
  const baseUrl =
    envBase && !envBase.includes('localhost') && !envBase.includes('vercel.app')
      ? envBase.replace(/\/$/, '')
      : defaultBase;

  const now = new Date();

  return [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/demo`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cadastro`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/termos`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacidade`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
}
