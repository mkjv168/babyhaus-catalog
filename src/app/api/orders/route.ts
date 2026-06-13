import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const orders = await prisma.order.findMany({
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(orders);
  } catch (e: any) {
    if (e.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // Graceful fallback when DB is unavailable (e.g. static deployment)
    if (e.name === 'PrismaClientInitializationError') {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const order = await prisma.order.create({
      data: {
        productId: body.productId,
        quantity: body.quantity || 1,
        customerName: body.customerName,
        telegramPhone: body.telegramPhone,
        deliveryAddress: body.deliveryAddress,
        paymentMethod: body.paymentMethod || 'cod',
        notes: body.notes,
      },
    });
    return NextResponse.json(order);
  } catch (e: any) {
    // Graceful fallback: if DB is missing, tell user to message on Telegram
    if (e.name === 'PrismaClientInitializationError') {
      return NextResponse.json(
        { fallback: true, message: 'Order received. Please confirm via Telegram @narote' },
        { status: 200 }
      );
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
