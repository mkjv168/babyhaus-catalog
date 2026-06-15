import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

interface ImportVariant {
  name: string;
  sku?: string;
  price?: number;
  stockStatus: string;
  stockQuantity: number;
}

interface ImportProduct {
  name: string;
  brand?: string;
  category: string;
  description?: string;
  featured: boolean;
  imageUrls: string[];
  variants: ImportVariant[];
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const { products } = await req.json();

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'No products provided' }, { status: 400 });
    }

    if (products.length > 200) {
      return NextResponse.json({ error: 'Maximum 200 products per import' }, { status: 400 });
    }

    const results = {
      created: 0,
      errors: [] as { row: number; message: string }[],
      total: products.length,
    };

    const batchSize = 10;
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (product: ImportProduct, batchIndex: number) => {
          const rowNumber = i + batchIndex + 1;

          try {
            if (!product.name?.trim()) {
              throw new Error('Name is required');
            }
            if (!product.category?.trim()) {
              throw new Error('Category is required');
            }
            if (!product.variants || product.variants.length === 0) {
              throw new Error('At least one variant is required');
            }

            // Validate variants
            for (const v of product.variants) {
              if (!v.name?.trim()) throw new Error('All variants must have a name');
            }

            const imageUrls = (product.imageUrls || [])
              .map((url: string) => url?.trim())
              .filter((url: string) => url && url.length > 0);

            const productData = {
              name: product.name.trim(),
              brand: product.brand?.trim() || null,
              category: product.category.trim(),
              description: product.description?.trim() || null,
              featured: product.featured === true,
              imageUrl: imageUrls.length > 0 ? imageUrls[0] : null,
            };

            const variantData = product.variants.map((v, idx) => {
              const baseSku = v.sku?.trim();
              const sku = baseSku || `AUTO-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
              return {
                name: v.name.trim(),
                sku,
                price: v.price != null ? parseFloat(String(v.price)) : null,
                stockStatus: ['instock', 'outofstock', 'preorder'].includes(v.stockStatus || '')
                  ? v.stockStatus
                  : 'instock',
                stockQuantity: v.stockQuantity != null ? parseInt(String(v.stockQuantity), 10) : 0,
              };
            });

            await prisma.$transaction(async (tx) => {
              const created = await tx.product.create({
                data: {
                  ...productData,
                  variants: { create: variantData },
                },
              });

              if (imageUrls.length > 0) {
                await tx.productImage.createMany({
                  data: imageUrls.map((url: string, idx: number) => ({
                    url,
                    order: idx,
                    productId: created.id,
                  })),
                });
              }
            });

            results.created++;
          } catch (err: any) {
            if (err.code === 'P2002') {
              results.errors.push({ row: rowNumber, message: `SKU already exists` });
            } else {
              results.errors.push({ row: rowNumber, message: err.message || 'Unknown error' });
            }
          }
        })
      );
    }

    return NextResponse.json(results);
  } catch (e: any) {
    if (e.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
