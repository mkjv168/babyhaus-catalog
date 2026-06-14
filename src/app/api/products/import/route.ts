import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

interface ImportProduct {
  name: string;
  brand?: string;
  category: string;
  description?: string;
  price?: number;
  sku?: string;
  stockStatus?: string;
  stockQuantity?: number;
  featured?: boolean;
  imageUrls?: string[];
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

            const imageUrls = (product.imageUrls || [])
              .map((url: string) => url?.trim())
              .filter((url: string) => url && url.length > 0);

            const productData: any = {
              name: product.name.trim(),
              brand: product.brand?.trim() || null,
              category: product.category.trim(),
              description: product.description?.trim() || null,
              featured: product.featured === true,
              imageUrl: imageUrls.length > 0 ? imageUrls[0] : null,
            };

            const variantData = {
              name: 'Default',
              sku: product.sku?.trim() || null,
              price: product.price != null ? parseFloat(String(product.price)) : null,
              stockStatus: ['instock', 'outofstock', 'preorder'].includes(product.stockStatus || '')
                ? product.stockStatus
                : 'instock',
              stockQuantity: product.stockQuantity != null ? parseInt(String(product.stockQuantity), 10) : 0,
            };

            await prisma.$transaction(async (tx) => {
              const created = await tx.product.create({
                data: {
                  ...productData,
                  variants: { create: [variantData] },
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
              results.errors.push({ row: rowNumber, message: `SKU "${product.sku}" already exists` });
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
