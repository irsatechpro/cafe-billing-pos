import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import { getActiveOrders } from '../../services/orderService';
import { getPayments } from '../../services/paymentService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  TrendingUp,
  ShoppingBag,
  Banknote,
  QrCode,
  Calendar,
  CreditCard,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  RefreshCw,
  Receipt
} from 'lucide-react';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Date Range Filter States (Two-Date Filter)
  const [dateFilterPreset, setDateFilterPreset] = useState('ALL'); // 'TODAY', 'YESTERDAY', '7DAYS', 'MONTH', 'CUSTOM', 'ALL'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordData, payData] = await Promise.all([
        getActiveOrders(),
        getPayments()
      ]);
      setOrders(ordData || []);
      setPayments(payData || []);
    } catch (err) {
      console.error('Failed to load sales stats from Supabase:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Helpers for dates
  const isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const isSameMonth = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth()
    );
  };

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  // Parse order date
  const getOrderDate = (order) => {
    return new Date(order.created_at || order.completed_at || order.updated_at || Date.now());
  };

  // 1. TODAY'S SALES
  const todayCompletedOrders = orders.filter((o) => {
    const isCompleted = o.status === 'COMPLETED' || o.status === 'SERVED';
    if (!isCompleted) return false;
    const d = getOrderDate(o);
    return isSameDay(d, now);
  });
  const todayTotalSales = todayCompletedOrders.reduce(
    (sum, o) => sum + Number(o.total_amount || o.subtotal || 0),
    0
  );

  // 2. YESTERDAY'S SALES
  const yesterdayCompletedOrders = orders.filter((o) => {
    const isCompleted = o.status === 'COMPLETED' || o.status === 'SERVED';
    if (!isCompleted) return false;
    const d = getOrderDate(o);
    return isSameDay(d, yesterday);
  });
  const yesterdayTotalSales = yesterdayCompletedOrders.reduce(
    (sum, o) => sum + Number(o.total_amount || o.subtotal || 0),
    0
  );

  // 3. THIS MONTH'S SALES
  const monthCompletedOrders = orders.filter((o) => {
    const isCompleted = o.status === 'COMPLETED' || o.status === 'SERVED';
    if (!isCompleted) return false;
    const d = getOrderDate(o);
    return isSameMonth(d, now);
  });
  const monthlyTotalSales = monthCompletedOrders.reduce(
    (sum, o) => sum + Number(o.total_amount || o.subtotal || 0),
    0
  );

  // 4. CASH & UPI TOTALS (from payments table)
  const cashSales = payments
    .filter((p) => p.payment_method === 'CASH')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const upiSales = payments
    .filter((p) => p.payment_method === 'UPI')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const cardSales = payments
    .filter((p) => p.payment_method === 'CARD')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  // Handle Preset Clicks
  const handlePresetSelect = (preset) => {
    setDateFilterPreset(preset);
    const todayStr = now.toISOString().split('T')[0];

    if (preset === 'TODAY') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === 'YESTERDAY') {
      const yStr = yesterday.toISOString().split('T')[0];
      setStartDate(yStr);
      setEndDate(yStr);
    } else if (preset === '7DAYS') {
      const past7 = new Date(now);
      past7.setDate(past7.getDate() - 6);
      setStartDate(past7.toISOString().split('T')[0]);
      setEndDate(todayStr);
    } else if (preset === 'MONTH') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(firstDay.toISOString().split('T')[0]);
      setEndDate(todayStr);
    } else if (preset === 'ALL') {
      setStartDate('');
      setEndDate('');
    }
  };

  // FILTERED ORDERS BY TWO-DATE FILTER
  const filteredOrders = useMemo(() => {
    if (!startDate && !endDate) return orders;

    const start = startDate ? new Date(`${startDate}T00:00:00`) : new Date(0);
    const end = endDate ? new Date(`${endDate}T23:59:59.999`) : new Date(8640000000000000);

    return orders.filter((o) => {
      const orderDate = getOrderDate(o);
      return orderDate >= start && orderDate <= end;
    });
  }, [orders, startDate, endDate]);

  const filteredCompletedOrders = filteredOrders.filter(
    (o) => o.status === 'COMPLETED' || o.status === 'SERVED'
  );
  const filteredTotalRevenue = filteredCompletedOrders.reduce(
    (sum, o) => sum + Number(o.total_amount || o.subtotal || 0),
    0
  );

  const paymentMap = useMemo(() => {
    return new Map(payments.map((p) => [p.order_id, p]));
  }, [payments]);

  // Comparison difference between Today and Yesterday
  const salesDiff = todayTotalSales - yesterdayTotalSales;
  const isGrowth = salesDiff >= 0;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#FAF6F0] text-[#2C1A14]">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-24 lg:pb-0">
        {/* Header */}
        <header className="bg-white px-4 sm:px-6 lg:px-8 py-3.5 sm:py-5 border-b border-[#EFE6D8] sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div>
            <span className="text-[10px] font-bold text-[#C8963E] uppercase tracking-widest font-mono">
              REAL-TIME SALES & FINANCIAL ANALYTICS
            </span>
            <h1 className="font-serif font-bold text-xl sm:text-2xl text-[#2C1A14]">
              Trio Bean Sales Dashboard
            </h1>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-[#FAF6F0] text-[#2C1A14] hover:bg-[#EFE6D8] border border-[#EFE6D8] font-bold text-xs flex items-center space-x-2 transition-all shadow-xs active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>REFRESH DATA</span>
          </button>
        </header>

        {loading ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <LoadingSpinner message="Calculating Trio Bean Sales & Analytics..." />
          </div>
        ) : (
          <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto w-full">
            
            {/* Top Primary Metrics Cards (Grid of 4) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Today's Sales Card */}
              <div className="bg-white p-5 rounded-3xl border border-[#EFE6D8] shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-[#6D4C41] uppercase tracking-wider font-mono">
                    TODAY'S TOTAL SALES
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#FAF6F0] text-[#C8963E] flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-serif font-extrabold text-3xl text-[#2C1A14]">
                  ₹{todayTotalSales.toLocaleString('en-IN')}
                </div>
                <div className="flex items-center space-x-1.5 mt-2 text-[11px] font-semibold">
                  {isGrowth ? (
                    <span className="text-emerald-700 flex items-center">
                      <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                      +₹{salesDiff.toLocaleString('en-IN')} vs yesterday
                    </span>
                  ) : (
                    <span className="text-amber-700 flex items-center">
                      <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                      -₹{Math.abs(salesDiff).toLocaleString('en-IN')} vs yesterday
                    </span>
                  )}
                </div>
              </div>

              {/* Yesterday's Sales Card */}
              <div className="bg-white p-5 rounded-3xl border border-[#EFE6D8] shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-[#6D4C41] uppercase tracking-wider font-mono">
                    YESTERDAY'S SALES
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#FAF6F0] text-[#6D4C41] flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-serif font-extrabold text-3xl text-[#2C1A14]">
                  ₹{yesterdayTotalSales.toLocaleString('en-IN')}
                </div>
                <span className="text-[11px] text-stone-500 font-medium mt-2 block">
                  {yesterdayCompletedOrders.length} orders completed
                </span>
              </div>

              {/* Monthly Sales (This Month) */}
              <div className="bg-white p-5 rounded-3xl border border-[#EFE6D8] shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-[#6D4C41] uppercase tracking-wider font-mono">
                    MONTHLY SALES ({now.toLocaleString('default', { month: 'short' })})
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#FAF6F0] text-[#C8963E] flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-serif font-extrabold text-3xl text-[#2C1A14]">
                  ₹{monthlyTotalSales.toLocaleString('en-IN')}
                </div>
                <span className="text-[11px] text-stone-500 font-medium mt-2 block">
                  {monthCompletedOrders.length} monthly orders
                </span>
              </div>

              {/* Total Orders Card */}
              <div className="bg-white p-5 rounded-3xl border border-[#EFE6D8] shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-[#6D4C41] uppercase tracking-wider font-mono">
                    TOTAL ORDERS
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#FAF6F0] text-[#2C1A14] flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-serif font-extrabold text-3xl text-[#2C1A14]">
                  {orders.length}
                </div>
                <span className="text-[11px] text-emerald-700 font-semibold mt-2 block">
                  {orders.filter((o) => o.status === 'COMPLETED').length} settled & paid
                </span>
              </div>

            </div>

            {/* Payment Method Breakdown Cards (Cash vs UPI vs Card) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Cash Sales */}
              <div className="bg-white p-5 rounded-3xl border border-[#EFE6D8] shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#6D4C41] uppercase tracking-wider font-mono block mb-1">
                    CASH SALES
                  </span>
                  <div className="font-serif font-extrabold text-2xl text-[#2C1A14]">
                    ₹{cashSales.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-stone-500 font-medium">
                    {payments.filter((p) => p.payment_method === 'CASH').length} cash transactions
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Banknote className="w-6 h-6" />
                </div>
              </div>

              {/* UPI Sales */}
              <div className="bg-white p-5 rounded-3xl border border-[#EFE6D8] shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#6D4C41] uppercase tracking-wider font-mono block mb-1">
                    UPI / QR SALES
                  </span>
                  <div className="font-serif font-extrabold text-2xl text-[#2C1A14]">
                    ₹{upiSales.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-stone-500 font-medium">
                    {payments.filter((p) => p.payment_method === 'UPI').length} UPI transactions
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                  <QrCode className="w-6 h-6" />
                </div>
              </div>

              {/* Card / Other Sales */}
              <div className="bg-white p-5 rounded-3xl border border-[#EFE6D8] shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#6D4C41] uppercase tracking-wider font-mono block mb-1">
                    CARD / OTHER SALES
                  </span>
                  <div className="font-serif font-extrabold text-2xl text-[#2C1A14]">
                    ₹{cardSales.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-stone-500 font-medium">
                    {payments.filter((p) => p.payment_method === 'CARD').length} card transactions
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                  <CreditCard className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* TWO-DATE FILTER SECTION */}
            <div className="bg-white rounded-3xl p-6 border border-[#EFE6D8] shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EFE6D8] pb-3">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-[#C8963E]" />
                  <h3 className="font-serif font-bold text-base text-[#2C1A14]">
                    Custom Date Range Filter (Two-Date Filter)
                  </h3>
                </div>

                {/* Preset Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'ALL', label: 'All Time' },
                    { id: 'TODAY', label: 'Today' },
                    { id: 'YESTERDAY', label: 'Yesterday' },
                    { id: '7DAYS', label: 'Last 7 Days' },
                    { id: 'MONTH', label: 'This Month' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handlePresetSelect(p.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        dateFilterPreset === p.id
                          ? 'bg-[#2C1A14] text-[#E5C170] shadow-xs'
                          : 'bg-[#FAF6F0] text-[#2C1A14] hover:bg-[#EFE6D8]'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Two Date Inputs: From Date & To Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-[11px] font-bold text-[#6D4C41] mb-1.5 uppercase font-mono">
                    From Date (Start):
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setDateFilterPreset('CUSTOM');
                    }}
                    className="w-full bg-[#FAF6F0] border border-[#EFE6D8] px-3.5 py-2 rounded-xl text-xs font-semibold text-[#2C1A14] focus:outline-none focus:ring-2 focus:ring-[#C8963E]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#6D4C41] mb-1.5 uppercase font-mono">
                    To Date (End):
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setDateFilterPreset('CUSTOM');
                    }}
                    className="w-full bg-[#FAF6F0] border border-[#EFE6D8] px-3.5 py-2 rounded-xl text-xs font-semibold text-[#2C1A14] focus:outline-none focus:ring-2 focus:ring-[#C8963E]"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePresetSelect('ALL')}
                    className="px-4 py-2 rounded-xl bg-[#FAF6F0] text-[#6D4C41] hover:bg-[#EFE6D8] text-xs font-bold transition-all"
                  >
                    Reset Filter
                  </button>
                </div>
              </div>

              {/* Filtered Results Summary Banner */}
              {(startDate || endDate) && (
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block font-mono">
                      Filtered Period: {startDate || 'Beginning'} &rarr; {endDate || 'Today'}
                    </span>
                    <span className="text-xs text-amber-950 font-medium">
                      Showing <strong>{filteredOrders.length}</strong> orders (<strong>{filteredCompletedOrders.length}</strong> completed)
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block font-mono">
                      Period Revenue:
                    </span>
                    <span className="font-serif font-extrabold text-xl text-[#2C1A14]">
                      ₹{filteredTotalRevenue.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Orders & Activity Table */}
            <div className="bg-white rounded-3xl border border-[#EFE6D8] p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Receipt className="w-5 h-5 text-[#C8963E]" />
                  <h3 className="font-serif font-bold text-lg text-[#2C1A14]">
                    Recent Order Transactions
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-[#6D4C41]">
                  {filteredOrders.length} orders
                </span>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="text-center py-12 text-[#6D4C41] text-xs">
                  No orders found for the selected date range.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-[#FAF6F0] border-b border-[#EFE6D8] text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider">
                        <th className="p-3.5 pl-4">Order #</th>
                        <th className="p-3.5">Customer</th>
                        <th className="p-3.5">Date & Time</th>
                        <th className="p-3.5">Payment</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 pr-4 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFE6D8] text-xs">
                      {filteredOrders.slice(0, 15).map((order) => {
                        const pay = paymentMap.get(order.id);
                        const d = getOrderDate(order);

                        return (
                          <tr key={order.id} className="hover:bg-[#FAF6F0]/60 transition-colors">
                            <td className="p-3.5 pl-4 font-mono font-bold text-[#2C1A14]">
                              #{order.order_number || order.id.slice(0, 6)}
                            </td>
                            <td className="p-3.5 font-semibold text-[#2C1A14]">
                              {order.customer_name || 'Guest'}
                            </td>
                            <td className="p-3.5 text-stone-500 font-mono text-[11px]">
                              {d.toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short'
                              })}{' '}
                              {d.toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="p-3.5">
                              {pay ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  {pay.payment_method}
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-stone-100 text-stone-600">
                                  PENDING
                                </span>
                              )}
                            </td>
                            <td className="p-3.5">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  order.status === 'COMPLETED'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : order.status === 'CANCELLED'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {order.status}
                              </span>
                            </td>
                            <td className="p-3.5 pr-4 text-right font-serif font-extrabold text-sm text-[#2C1A14]">
                              ₹{order.total_amount || order.subtotal || 0}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
