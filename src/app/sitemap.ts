import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { categoryToSlug } from '@/lib/category';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://babyhaus-catalog.vercel.app';
  
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      select: {
        id: true,
        updatedAt: true,
      },
    }),
    prisma.product.groupBy({
      by: ['category'],
      _max: { updatedAt: true },
    }),
  ]);

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/checkout`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/wishlist`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ];

  // Product pages
  const productPages = products.map((product) => ({
    url: `${baseUrl}/product/${product.id}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  const categoryPages = categories.map((category) => ({
    url: `${baseUrl}/category/${categoryToSlug(category.category)}`,
    lastModified: category._max.updatedAt ?? new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}
