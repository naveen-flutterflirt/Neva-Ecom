import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://nivashop.in';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';

  let productUrls: MetadataRoute.Sitemap = [];

  try {
    // Fetch all products from your backend API
    const res = await fetch(`${apiUrl}/products`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      const products = data.data || [];
      
      // Map each product to a sitemap entry
      productUrls = products.map((product: any) => ({
        url: `${baseUrl}/products/${product.id}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      }));
    }
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
  }

  return [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/3d-product`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/iot-product`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/custom-product`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    ...productUrls,
  ];
}
