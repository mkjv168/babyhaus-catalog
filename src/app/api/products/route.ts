import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  const products = await prisma.product.findMany({ 
    orderBy: { createdAt: 'desc' },
    include: { images: { orderBy: { order: 'asc' } } },
  });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { images, ...productData } = body;
    
    const product = await prisma.product.create({ 
      data: {
        ...productData,
        images: images?.length > 0 ? {
          create: images.map((url: string, index: number) => ({ url, order: index })),
        } : undefined,
      },
      include: { images: { orderBy: { order: 'asc' } } },
    });
    return NextResponse.json(product);
  } catch (e: any) {
    if (e.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
