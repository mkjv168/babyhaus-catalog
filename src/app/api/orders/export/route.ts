import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminUser } from '@/lib/auth';

export async function GET() {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const orders = await prisma.order.findMany({
      include: { variant: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });

    // CSV headers
    const headers = ['Date', 'Product', 'Variant', 'Customer', 'Telegram', 'Quantity', 'Payment', 'Address', 'Notes', 'Status'];

    // CSV rows
    const rows = orders.map((o) => [
      new Date(o.createdAt).toLocaleDateString(),
      o.variant?.product?.name || 'Unknown',
      o.variant?.name || '-',
      o.customerName,
      o.telegramPhone,
      String(o.quantity),
      o.paymentMethod,
      o.deliveryAddress || '-',
      o.notes || '-',
      o.status,
    ]);

    // Escape CSV values
    const escapeCsv = (val: string) => {
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    };

    const csv = [headers.join(','), ...rows.map((r) => r.map(escapeCsv).join(','))].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="babyhaus-orders-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
