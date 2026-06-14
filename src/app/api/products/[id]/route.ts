import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { order: 'asc' } },
      variants: { orderBy: { name: 'asc' } }
    },
  });
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const { images, variants, ...productData } = body;

    const product = await prisma.$transaction(async (tx) => {
      // Delete existing images
      await tx.productImage.deleteMany({ where: { productId: id } });

      // Update product
      const updated = await tx.product.update({
        where: { id },
        data: productData,
      });

      // Create new images if provided
      if (images?.length > 0) {
        await tx.productImage.createMany({
          data: images.map((url: string, index: number) => ({
            url,
            order: index,
            productId: id,
          })),
        });
      }

      // Handle variants update
      if (variants) {
        // Delete variants not in the new list
        const newVariantIds = variants.filter((v: any) => v.id).map((v: any) => v.id);
        await tx.productVariant.deleteMany({
          where: { productId: id, id: { notIn: newVariantIds } }
        });

        // Upsert variants
        for (const v of variants) {
          if (v.id) {
            await tx.productVariant.update({
              where: { id: v.id },
              data: {
                sku: v.sku,
                name: v.name,
                price: v.price ? parseFloat(v.price) : null,
                stockQuantity: parseInt(v.stockQuantity) || 0,
                stockStatus: v.stockStatus || 'instock',
                imageUrl: v.imageUrl
              }
            });
          } else {
            await tx.productVariant.create({
              data: {
                productId: id,
                sku: v.sku,
                name: v.name,
                price: v.price ? parseFloat(v.price) : null,
                stockQuantity: parseInt(v.stockQuantity) || 0,
                stockStatus: v.stockStatus || 'instock',
                imageUrl: v.imageUrl
              }
            });
          }
        }
      }

      return updated;
    });

    const result = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        images: { orderBy: { order: 'asc' } },
        variants: { orderBy: { name: 'asc' } }
      },
    });

    return NextResponse.json(result);
  } catch (e: any) {
    if (e.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
