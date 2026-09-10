import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/profile/', '/cart/', '/checkout/', '/admin-login/', '/forgot-password/', '/login/', '/signup/'],
    },
    sitemap: 'https://nivashop.in/sitemap.xml',
  };
}
