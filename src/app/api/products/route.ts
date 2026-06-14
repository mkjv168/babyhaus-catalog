import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const grouped = searchParams.get('grouped') === 'true';

    if (grouped) {
      const products = await prisma.product.findMany({
        include: { images: { orderBy: { order: 'asc' } } },
      });

      const groupsMap = new Map<string, typeof products>();
      for (const product of products) {
        const key = product.variantGroup || product.id;
        if (!groupsMap.has(key)) groupsMap.set(key, []);
        groupsMap.get(key)!.push(product);
      }

      const groups = Array.from(groupsMap.entries()).map(([groupSlug, variants]) => {
        variants.sort((a, b) => a.name.localeCompare(b.name));
        const first = variants[0];
        return {
          groupName: variants.length > 1
            ? groupSlug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
            : first.name,
          groupSlug,
          category: first.category,
          brand: first.brand,
          baseImageUrl: first.imageUrl,
          variants,
        };
      });

      groups.sort((a, b) => {
        const countDiff = b.variants.length - a.variants.length;
        if (countDiff !== 0) return countDiff;
        return a.groupName.localeCompare(b.groupName);
      });

      return NextResponse.json({ groups });
    }

    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: { images: { orderBy: { order: 'asc' } } },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
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
