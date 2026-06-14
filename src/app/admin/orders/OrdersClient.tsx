'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, Download } from 'lucide-react';
import { Pagination } from '@/components/Pagination';
import StatusButton from './StatusButton';

interface Order {
  id: string;
  variantId: string;
  quantity: number;
  customerName: string;
  telegramPhone: string;
  deliveryAddress: string | null;
  paymentMethod: string;
  notes: string | null;
  status: string;
  createdAt: Date;
  variant: {
    id: string;
    sku: string;
    name: string;
    price: number | null;
    product: {
      name: string;
    } | null;
  } | null;
}

type StatusFilter = 'all' | 'pending' | 'confirmed' | 'delivered';

const ORDERS_PER_PAGE = 15;

const statusOptions: { value: StatusFilter; label: string; color: string }[] = [
  { value: 'all', label: 'All', color: 'bg-[#2d2d2d] text-white' },
  { value: 'pending', label: 'Pending', color: 'bg-amber-50 text-amber-600' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-50 text-blue-600' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-50 text-green-600' },
];

interface OrdersClientProps {
  orders: Order[];
}

export default function OrdersClient({ orders }: OrdersClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (statusFilter !== 'all') {
      result = result.filter((o) => o.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.customerName.toLowerCase().includes(q) ||
          o.telegramPhone.toLowerCase().includes(q) ||
          o.variant?.name.toLowerCase().includes(q) ||
          o.variant?.product?.name.toLowerCase().includes(q) ||
          (o.notes && o.notes.toLowerCase().includes(q))
      );
    }

    return result;
  }, [orders, statusFilter, searchQuery]);

  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ORDERS_PER_PAGE;
    return filteredOrders.slice(start, start + ORDERS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStatusChange = (status: StatusFilter) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="flex items-center gap-2">
          <a
            href="/api/orders/export"
            download
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#e8e4df] text-[#2d2d2d] font-semibold rounded-full hover:border-[#d4a574] hover:text-[#d4a574] transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </a>
          <div className="flex items-center gap-2 text-sm text-[#7a7a7a]">
            <Filter className="w-4 h-4" />
            <span>{filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3 mb-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a7a7a]" />
          <input
            type="text"
            placeholder="Search by customer, phone, or product..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e8e4df] rounded-xl text-sm text-[#2d2d2d] focus:border-[#d4a574] focus:ring-2 focus:ring-[#d4a574]/20 focus:outline-none transition-all"
          />
        </div>

        {/* Status pills */}
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleStatusChange(opt.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                statusFilter === opt.value
                  ? opt.value === 'all'
                    ? 'bg-[#2d2d2d] text-white'
                    : opt.color.replace('text-', 'bg-').replace('50', '100') + ' ' + opt.color.split(' ')[1]
                  : 'bg-white border border-[#e8e4df] text-[#7a7a7a] hover:border-[#d4a574] hover:text-[#d4a574]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#e8e4df] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#e8e4df] text-xs font-semibold uppercase tracking-wider text-[#7a7a7a]">
                <th className="pb-3 pt-4 px-6">Date</th>
                <th className="pb-3 pt-4 pr-4">Product</th>
                <th className="pb-3 pt-4 pr-4">Customer</th>
                <th className="pb-3 pt-4 pr-4">Telegram</th>
                <th className="pb-3 pt-4 pr-4">Notes</th>
                <th className="pb-3 pt-4 pr-4">Status</th>
                <th className="pb-3 pt-4 px-6">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((o) => (
                <tr key={o.id} className="border-b border-[#e8e4df]/60 hover:bg-[#faf8f5] transition-colors">
                  <td className="py-3 px-6 text-sm text-[#7a7a7a] whitespace-nowrap">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 pr-4">
                    <p className="font-semibold">{o.variant?.product?.name || 'Unknown'}</p>
                    <p className="text-xs text-[#7a7a7a]">{o.variant?.name}</p>
                  </td>
                  <td className="py-3 pr-4">{o.customerName}</td>
                  <td className="py-3 pr-4 text-[#d4a574] font-medium">{o.telegramPhone}</td>
                  <td className="py-3 pr-4 text-sm text-[#7a7a7a] max-w-[200px] truncate">
                    {o.notes || '-'}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        o.status === 'pending'
                          ? 'bg-amber-50 text-amber-600'
                          : o.status === 'confirmed'
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-green-50 text-green-600'
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3 px-6">
                    <StatusButton id={o.id} currentStatus={o.status} />
                  </td>
                </tr>
              ))}
              {paginatedOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#7a7a7a]">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
    </>
  );
}
