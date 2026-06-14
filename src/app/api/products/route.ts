import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const products = await prisma.product.findMany({
      include: {
        variants: {
          orderBy: { name: 'asc' }
        },
        images: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('GET /api/products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, brand, category, description, featured, imageUrl, variants } = body;

    const product = await prisma.product.create({
      data: {
        name,
        brand,
        category,
        description,
        featured: featured || false,
        imageUrl,
        variants: {
          create: variants?.map((v: any) => ({
            sku: v.sku,
            name: v.name,
            price: v.price ? parseFloat(v.price) : null,
            stockQuantity: parseInt(v.stockQuantity) || 0,
            stockStatus: v.stockStatus || 'instock',
            imageUrl: v.imageUrl
          })) || []
        }
      },
      include: {
        variants: true,
        images: true
      }
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error('POST /api/products error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
