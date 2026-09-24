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
  Receipt,
  RefreshCw,
  Clock,
  ChevronRight,
  ListOrdered
} from 'lucide-react';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tab: 'DAY' (single day view) | 'MONTH' (month view) | 'LEDGER' (365-day ledger)
  const [viewTab, setViewTab] = useState('DAY');

  // Dates helpers
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getYesterdayString = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getThisMonthString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [selectedMonth, setSelectedMonth] = useState(getThisMonthString());

  // Load orders & payments
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
      console.error('Failed to load sales data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatToLocalDate = (dateVal) => {
    if (!dateVal) return '';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatToYearMonth = (dateVal) => {
    if (!dateVal) return '';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const formatReadableDate = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatReadableMonth = (ymStr) => {
    if (!ymStr) return '';
    const [y, m] = ymStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, 1);
    return dateObj.toLocaleDateString('en-IN', {
      month: 'long',
      year: 'numeric'
    });
  };

  // Payment mapping
  const paymentMap = useMemo(() => {
    return new Map(payments.map((p) => [p.order_id, p]));
  }, [payments]);

  // Selected Day Calculations
  const dayOrders = useMemo(() => {
    return orders.filter((o) => {
      const isCompleted = o.status === 'COMPLETED' || o.status === 'SERVED';
      if (!isCompleted) return false;
      const orderDay = formatToLocalDate(o.created_at || o.completed_at || o.updated_at);
      return orderDay === selectedDate;
    });
  }, [orders, selectedDate]);

  const dayTotalSales = useMemo(() => {
    return dayOrders.reduce((sum, o) => sum + Number(o.total_amount || o.subtotal || 0), 0);
  }, [dayOrders]);

  const dayTotalOrders = dayOrders.length;

  const dayCashSales = useMemo(() => {
    return dayOrders.reduce((sum, o) => {
      const pay = paymentMap.get(o.id);
      const method = pay?.payment_method || o.payment_method || 'CASH';
      return method === 'CASH' ? sum + Number(o.total_amount || o.subtotal || 0) : sum;
    }, 0);
  }, [dayOrders, paymentMap]);

  const dayUpiSales = useMemo(() => {
    return dayOrders.reduce((sum, o) => {
      const pay = paymentMap.get(o.id);
      const method = pay?.payment_method || o.payment_method || 'CASH';
      return method === 'UPI' ? sum + Number(o.total_amount || o.subtotal || 0) : sum;
    }, 0);
  }, [dayOrders, paymentMap]);

  // Selected Month Calculations
  const monthOrders = useMemo(() => {
    return orders.filter((o) => {
      const isCompleted = o.status === 'COMPLETED' || o.status === 'SERVED';
      if (!isCompleted) return false;
      const orderMonth = formatToYearMonth(o.created_at || o.completed_at || o.updated_at);
      return orderMonth === selectedMonth;
    });
  }, [orders, selectedMonth]);

  const monthTotalSales = useMemo(() => {
    return monthOrders.reduce((sum, o) => sum + Number(o.total_amount || o.subtotal || 0), 0);
  }, [monthOrders]);

  const monthTotalOrders = monthOrders.length;

  const monthCashSales = useMemo(() => {
    return monthOrders.reduce((sum, o) => {
      const pay = paymentMap.get(o.id);
      const method = pay?.payment_method || o.payment_method || 'CASH';
      return method === 'CASH' ? sum + Number(o.total_amount || o.subtotal || 0) : sum;
    }, 0);
  }, [monthOrders, paymentMap]);

  const monthUpiSales = useMemo(() => {
    return monthOrders.reduce((sum, o) => {
      const pay = paymentMap.get(o.id);
      const method = pay?.payment_method || o.payment_method || 'CASH';
      return method === 'UPI' ? sum + Number(o.total_amount || o.subtotal || 0) : sum;
    }, 0);
  }, [monthOrders, paymentMap]);

  // 365-Day Daily Ledger
  const dailyLedger = useMemo(() => {
    const dayMap = {};
    orders.forEach((o) => {
      if (o.status !== 'COMPLETED' && o.status !== 'SERVED') return;
      const dateStr = formatToLocalDate(o.created_at || o.completed_at || o.updated_at);
      if (!dateStr) return;

      if (!dayMap[dateStr]) {
        dayMap[dateStr] = {
          date: dateStr,
          totalSales: 0,
          totalOrders: 0,
          cashSales: 0,
          upiSales: 0
        };
      }

      const amt = Number(o.total_amount || o.subtotal || 0);
      dayMap[dateStr].totalSales += amt;
      dayMap[dateStr].totalOrders += 1;

      const pay = paymentMap.get(o.id);
      const method = pay?.payment_method || o.payment_method || 'CASH';
      if (method === 'UPI') {
        dayMap[dateStr].upiSales += amt;
      } else {
        dayMap[dateStr].cashSales += amt;
      }
    });

    return Object.values(dayMap).sort((a, b) => b.date.localeCompare(a.date));
  }, [orders, paymentMap]);

  const isToday = selectedDate === getTodayString();
  const isYesterday = selectedDate === getYesterdayString();

  // Active Display Info
  const displaySalesTitle = useMemo(() => {
    if (viewTab === 'MONTH') {
      return `${formatReadableMonth(selectedMonth).toUpperCase()} SALES`;
    }
    if (isToday) return "TODAY'S TOTAL SALES";
    if (isYesterday) return "YESTERDAY'S TOTAL SALES";
    return `SALES ON ${formatReadableDate(selectedDate).toUpperCase()}`;
  }, [viewTab, isToday, isYesterday, selectedDate, selectedMonth]);

  const displaySalesMention = useMemo(() => {
    if (viewTab === 'MONTH') {
      return `Total revenue in ${formatReadableMonth(selectedMonth)}`;
    }
    if (isToday) return `Live revenue for Today (${formatReadableDate(selectedDate)})`;
    if (isYesterday) return `Sales on Yesterday (${formatReadableDate(selectedDate)})`;
    return `Sales on ${formatReadableDate(selectedDate)}`;
  }, [viewTab, isToday, isYesterday, selectedDate, selectedMonth]);

  const displayOrdersTitle = useMemo(() => {
    if (viewTab === 'MONTH') {
      return `${formatReadableMonth(selectedMonth).toUpperCase()} ORDERS`;
    }
    if (isToday) return "TODAY'S ORDERS";
    if (isYesterday) return "YESTERDAY'S ORDERS";
    return `ORDERS ON ${formatReadableDate(selectedDate).toUpperCase()}`;
  }, [viewTab, isToday, isYesterday, selectedDate, selectedMonth]);

  const displayOrdersMention = useMemo(() => {
    if (viewTab === 'MONTH') {
      return `Orders placed in ${formatReadableMonth(selectedMonth)}`;
    }
    if (isToday) return `Orders placed Today (${formatReadableDate(selectedDate)})`;
    if (isYesterday) return `Orders placed Yesterday (${formatReadableDate(selectedDate)})`;
    return `Orders on ${formatReadableDate(selectedDate)}`;
  }, [viewTab, isToday, isYesterday, selectedDate, selectedMonth]);

  const activeTotalSales = viewTab === 'MONTH' ? monthTotalSales : dayTotalSales;
  const activeTotalOrders = viewTab === 'MONTH' ? monthTotalOrders : dayTotalOrders;
  const activeCashSales = viewTab === 'MONTH' ? monthCashSales : dayCashSales;
  const activeUpiSales = viewTab === 'MONTH' ? monthUpiSales : dayUpiSales;
  const activeOrdersList = viewTab === 'MONTH' ? monthOrders : dayOrders;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#FAF6F0] text-[#2C1A14]">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-24 lg:pb-0">
        {/* Header */}
        <header className="bg-white px-4 sm:px-6 lg:px-8 py-4 border-b border-[#EFE6D8] sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div>
            <span className="text-[10px] font-bold text-[#C8963E] uppercase tracking-widest font-mono">
              DAILY & MONTHLY REVENUE ANALYTICS
            </span>
            <h1 className="font-serif font-bold text-xl sm:text-2xl text-[#2C1A14]">
              Sales Dashboard
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-[#FAF6F0] text-[#2C1A14] hover:bg-[#EFE6D8] border border-[#EFE6D8] shadow-xs flex items-center space-x-1.5 text-xs font-bold"
              title="Refresh Sales Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </header>

        {/* View Mode Tabs: Single Day | Monthly Sales | 365-Day Daily Ledger */}
        <div className="bg-white px-4 sm:px-8 border-b border-[#EFE6D8] flex space-x-3 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setViewTab('DAY')}
            className={`py-3.5 px-3 border-b-2 flex items-center space-x-2 transition-all shrink-0 ${
              viewTab === 'DAY'
                ? 'border-[#2C1A14] text-[#2C1A14]'
                : 'border-transparent text-stone-500 hover:text-[#2C1A14]'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-[#C8963E]" />
            <span>DAILY SALES (TODAY / YESTERDAY / PICK DATE)</span>
          </button>

          <button
            onClick={() => setViewTab('MONTH')}
            className={`py-3.5 px-3 border-b-2 flex items-center space-x-2 transition-all shrink-0 ${
              viewTab === 'MONTH'
                ? 'border-[#2C1A14] text-[#2C1A14]'
                : 'border-transparent text-stone-500 hover:text-[#2C1A14]'
            }`}
          >
            <Calendar className="w-4 h-4 text-[#C8963E]" />
            <span>MONTHLY SALES</span>
          </button>

          <button
            onClick={() => setViewTab('LEDGER')}
            className={`py-3.5 px-3 border-b-2 flex items-center space-x-2 transition-all shrink-0 ${
              viewTab === 'LEDGER'
                ? 'border-[#2C1A14] text-[#2C1A14]'
                : 'border-transparent text-stone-500 hover:text-[#2C1A14]'
            }`}
          >
            <ListOrdered className="w-4 h-4 text-[#C8963E]" />
            <span>365-DAY SALES LEDGER (DAY BY DAY)</span>
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <LoadingSpinner message="Syncing Live Sales Records..." />
          </div>
        ) : (
          <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">

            {/* If in DAY or MONTH view */}
            {viewTab !== 'LEDGER' && (
              <div className="space-y-6">

                {/* ========================================================= */}
                {/* QUICK DATE SWITCHER BAR                                  */}
                {/* ========================================================= */}
                <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#EFE6D8] shadow-xs flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Today Button */}
                    <button
                      onClick={() => {
                        setSelectedDate(getTodayString());
                        setViewTab('DAY');
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                        viewTab === 'DAY' && isToday
                          ? 'bg-[#2C1A14] text-[#E5C170] shadow-sm'
                          : 'bg-[#FAF6F0] text-[#2C1A14] hover:bg-[#EFE6D8] border border-[#EFE6D8]'
                      }`}
                    >
                      <span>☀️ Today's Sales</span>
                    </button>

                    {/* Yesterday Button */}
                    <button
                      onClick={() => {
                        setSelectedDate(getYesterdayString());
                        setViewTab('DAY');
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                        viewTab === 'DAY' && isYesterday
                          ? 'bg-[#2C1A14] text-[#E5C170] shadow-sm'
                          : 'bg-[#FAF6F0] text-[#2C1A14] hover:bg-[#EFE6D8] border border-[#EFE6D8]'
                      }`}
                    >
                      <span>⏱️ Yesterday's Sales</span>
                    </button>

                    {/* Pick Any Date Input */}
                    <div className="flex items-center space-x-1 bg-[#FAF6F0] border border-[#EFE6D8] px-3 py-1 rounded-xl">
                      <span className="text-[11px] font-bold text-[#6D4C41]">📅 Any Date:</span>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => {
                          setSelectedDate(e.target.value);
                          setViewTab('DAY');
                        }}
                        className="bg-transparent text-[#2C1A14] font-bold text-xs p-1 focus:outline-none cursor-pointer"
                      />
                    </div>

                    {/* Pick Month Input */}
                    <div className="flex items-center space-x-1 bg-[#FAF6F0] border border-[#EFE6D8] px-3 py-1 rounded-xl">
                      <span className="text-[11px] font-bold text-[#6D4C41]">🗓️ Pick Month:</span>
                      <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => {
                          setSelectedMonth(e.target.value);
                          setViewTab('MONTH');
                        }}
                        className="bg-transparent text-[#2C1A14] font-bold text-xs p-1 focus:outline-none cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Active view indicator */}
                  <div className="text-xs">
                    <span className="text-stone-500 font-medium mr-1.5">Viewing:</span>
                    <span className="font-bold text-[#2C1A14] bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200/60">
                      {viewTab === 'DAY'
                        ? isToday
                          ? `Today (${formatReadableDate(selectedDate)})`
                          : isYesterday
                          ? `Yesterday (${formatReadableDate(selectedDate)})`
                          : `Date: ${formatReadableDate(selectedDate)}`
                        : `Month: ${formatReadableMonth(selectedMonth)}`}
                    </span>
                  </div>
                </div>

                {/* ========================================================= */}
                {/* 5 PRIMARY METRIC CARDS                                    */}
                {/* ========================================================= */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  
                  {/* Card 1: TODAY'S TOTAL SALES / YESTERDAY SALES (CLICKABLE) */}
                  <div className="bg-white p-5 rounded-3xl border-2 border-[#2C1A14] shadow-sm relative overflow-hidden flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-extrabold text-[#2C1A14] uppercase tracking-wider font-mono">
                          {displaySalesTitle}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-[#2C1A14] text-[#E5C170] flex items-center justify-center">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="font-serif font-extrabold text-2xl sm:text-3xl text-[#2C1A14]">
                        ₹{activeTotalSales.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[11px] text-emerald-700 font-bold mt-2 block">
                        {displaySalesMention}
                      </span>
                    </div>

                    {/* Clickable Quick Switches right on the card */}
                    <div className="mt-3 pt-3 border-t border-[#EFE6D8] flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedDate(getTodayString());
                          setViewTab('DAY');
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                          viewTab === 'DAY' && isToday
                            ? 'bg-[#2C1A14] text-[#E5C170]'
                            : 'bg-[#FAF6F0] text-stone-600 hover:bg-[#EFE6D8]'
                        }`}
                      >
                        Today
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDate(getYesterdayString());
                          setViewTab('DAY');
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                          viewTab === 'DAY' && isYesterday
                            ? 'bg-[#2C1A14] text-[#E5C170]'
                            : 'bg-[#FAF6F0] text-stone-600 hover:bg-[#EFE6D8]'
                        }`}
                      >
                        Yesterday
                      </button>
                    </div>
                  </div>

                  {/* Card 2: TODAY'S ORDERS / YESTERDAY ORDERS (CLICKABLE) */}
                  <div className="bg-white p-5 rounded-3xl border border-[#EFE6D8] shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-[#6D4C41] uppercase tracking-wider font-mono">
                          {displayOrdersTitle}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-[#FAF6F0] text-[#2C1A14] flex items-center justify-center">
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="font-serif font-extrabold text-2xl sm:text-3xl text-[#2C1A14]">
                        {activeTotalOrders}
                      </div>
                      <span className="text-[11px] text-stone-500 font-medium mt-2 block">
                        {displayOrdersMention}
                      </span>
                    </div>

                    {/* Clickable Quick Switches right on the card */}
                    <div className="mt-3 pt-3 border-t border-[#EFE6D8] flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedDate(getTodayString());
                          setViewTab('DAY');
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                          viewTab === 'DAY' && isToday
                            ? 'bg-[#2C1A14] text-[#E5C170]'
                            : 'bg-[#FAF6F0] text-stone-600 hover:bg-[#EFE6D8]'
                        }`}
                      >
                        Today
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDate(getYesterdayString());
                          setViewTab('DAY');
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                          viewTab === 'DAY' && isYesterday
                            ? 'bg-[#2C1A14] text-[#E5C170]'
                            : 'bg-[#FAF6F0] text-stone-600 hover:bg-[#EFE6D8]'
                        }`}
                      >
                        Yesterday
                      </button>
                    </div>
                  </div>

                  {/* Card 3: CASH SALES */}
                  <div className="bg-white p-5 rounded-3xl border border-[#EFE6D8] shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-[#6D4C41] uppercase tracking-wider font-mono">
                        CASH SALES
                      </span>
                      <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                        <Banknote className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="font-serif font-extrabold text-2xl sm:text-3xl text-emerald-800">
                      ₹{activeCashSales.toLocaleString('en-IN')}
                    </div>
                    <span className="text-[11px] text-stone-500 font-medium mt-2 block">
                      Cash collected in counter
                    </span>
                  </div>

                  {/* Card 4: UPI SALES */}
                  <div className="bg-white p-5 rounded-3xl border border-[#EFE6D8] shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-[#6D4C41] uppercase tracking-wider font-mono">
                        UPI SALES
                      </span>
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center">
                        <QrCode className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="font-serif font-extrabold text-2xl sm:text-3xl text-blue-800">
                      ₹{activeUpiSales.toLocaleString('en-IN')}
                    </div>
                    <span className="text-[11px] text-stone-500 font-medium mt-2 block">
                      QR / Bank UPI transfers
                    </span>
                  </div>

                  {/* Card 5: TOTAL ORDERS (ALL TIME) */}
                  <div className="bg-white p-5 rounded-3xl border border-[#EFE6D8] shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-[#6D4C41] uppercase tracking-wider font-mono">
                        TOTAL ORDERS
                      </span>
                      <div className="w-8 h-8 rounded-full bg-[#FAF6F0] text-[#C8963E] flex items-center justify-center">
                        <Receipt className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="font-serif font-extrabold text-2xl sm:text-3xl text-[#2C1A14]">
                      {orders.length}
                    </div>
                    <span className="text-[11px] text-stone-500 font-medium mt-2 block">
                      All-time completed orders
                    </span>
                  </div>

                </div>

                {/* ========================================================= */}
                {/* COMPLETED ORDERS TABLE FOR THE SELECTED DATE/MONTH        */}
                {/* ========================================================= */}
                <div className="bg-white rounded-3xl border border-[#EFE6D8] p-5 sm:p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Receipt className="w-5 h-5 text-[#C8963E]" />
                      <h3 className="font-serif font-bold text-lg text-[#2C1A14]">
                        {viewTab === 'DAY'
                          ? isToday
                            ? `Today's Completed Orders (${formatReadableDate(selectedDate)})`
                            : isYesterday
                            ? `Yesterday's Completed Orders (${formatReadableDate(selectedDate)})`
                            : `Completed Orders on ${formatReadableDate(selectedDate)}`
                          : `Completed Orders in ${formatReadableMonth(selectedMonth)}`}
                      </h3>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#6D4C41] bg-[#FAF6F0] px-3 py-1 rounded-xl border border-[#EFE6D8]">
                      {activeOrdersList.length} orders
                    </span>
                  </div>

                  {activeOrdersList.length === 0 ? (
                    <div className="text-center py-12 text-[#6D4C41] text-xs">
                      No completed orders recorded for this selection.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                          <tr className="bg-[#FAF6F0] border-b border-[#EFE6D8] text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider">
                            <th className="p-3.5 pl-4">Order #</th>
                            <th className="p-3.5">Customer</th>
                            <th className="p-3.5">Time</th>
                            <th className="p-3.5">Payment</th>
                            <th className="p-3.5">Items Ordered</th>
                            <th className="p-3.5 pr-4 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EFE6D8] text-xs">
                          {activeOrdersList.map((order) => {
                            const pay = paymentMap.get(order.id);
                            const d = new Date(order.created_at || order.completed_at || Date.now());
                            const itemsList = order.order_items || order.items || [];

                            return (
                              <tr key={order.id} className="hover:bg-[#FAF6F0]/60 transition-colors">
                                <td className="p-3.5 pl-4 font-mono font-bold text-[#2C1A14]">
                                  #{order.order_number || order.id.slice(0, 6)}
                                </td>
                                <td className="p-3.5 font-semibold text-[#2C1A14]">
                                  {order.customer_name || 'Guest'}
                                </td>
                                <td className="p-3.5 text-stone-500 font-mono text-[11px]">
                                  {d.toLocaleTimeString('en-IN', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </td>
                                <td className="p-3.5">
                                  {pay ? (
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                                      pay.payment_method === 'CASH'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-blue-100 text-blue-800'
                                    }`}>
                                      {pay.payment_method}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-stone-100 text-stone-600">
                                      CASH
                                    </span>
                                  )}
                                </td>
                                <td className="p-3.5 text-stone-600 truncate max-w-xs">
                                  {itemsList.map(i => `${i.item_name || i.name} x${i.quantity}`).join(', ') || 'Menu items'}
                                </td>
                                <td className="p-3.5 pr-4 text-right font-serif font-extrabold text-sm text-[#2C1A14]">
                                  ₹{order.total_amount || order.subtotal || 0}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="bg-[#FAF6F0] border-t-2 border-[#2C1A14] font-bold text-xs">
                            <td colSpan="5" className="p-3.5 pl-4 text-right uppercase font-mono text-[#2C1A14]">
                              TOTAL SALES:
                            </td>
                            <td className="p-3.5 pr-4 text-right font-serif font-extrabold text-base text-[#2C1A14]">
                              ₹{activeTotalSales.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* ========================================================= */}
            {/* TAB: 365-DAY SALES LEDGER (DAY BY DAY)                     */}
            {/* ========================================================= */}
            {viewTab === 'LEDGER' && (
              <div className="bg-white rounded-3xl border border-[#EFE6D8] p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-[#2C1A14]">
                      Day-by-Day Sales Ledger
                    </h3>
                    <p className="text-xs text-stone-500">
                      Shows daily breakdown of Total Sales, Orders, Cash, and UPI for every single active day. Click any row to inspect!
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#C8963E] bg-[#FAF6F0] px-3 py-1.5 rounded-xl border border-[#EFE6D8]">
                    {dailyLedger.length} active business days
                  </span>
                </div>

                {dailyLedger.length === 0 ? (
                  <div className="text-center py-12 text-[#6D4C41] text-xs">
                    No sales records found.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[650px]">
                      <thead>
                        <tr className="bg-[#FAF6F0] border-b border-[#EFE6D8] text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider">
                          <th className="p-3.5 pl-4">Date</th>
                          <th className="p-3.5 text-center">Total Orders</th>
                          <th className="p-3.5 text-right">Cash Sales</th>
                          <th className="p-3.5 text-right">UPI Sales</th>
                          <th className="p-3.5 text-right">Total Sales</th>
                          <th className="p-3.5 pr-4 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EFE6D8] text-xs">
                        {dailyLedger.map((row) => {
                          const isRowToday = row.date === getTodayString();
                          const isRowYesterday = row.date === getYesterdayString();

                          return (
                            <tr
                              key={row.date}
                              className={`transition-colors hover:bg-[#FAF6F0]/60 ${
                                selectedDate === row.date && viewTab === 'DAY' ? 'bg-amber-50/70 font-semibold' : ''
                              }`}
                            >
                              <td className="p-3.5 pl-4 font-mono font-bold text-[#2C1A14]">
                                {formatReadableDate(row.date)}
                                {isRowToday && (
                                  <span className="ml-2 px-2 py-0.5 rounded text-[9px] font-bold bg-[#2C1A14] text-[#E5C170] uppercase">
                                    Today
                                  </span>
                                )}
                                {isRowYesterday && (
                                  <span className="ml-2 px-2 py-0.5 rounded text-[9px] font-bold bg-[#6D4C41] text-[#FDFBF7] uppercase">
                                    Yesterday
                                  </span>
                                )}
                              </td>
                              <td className="p-3.5 text-center font-bold">
                                {row.totalOrders}
                              </td>
                              <td className="p-3.5 text-right text-emerald-800 font-mono font-bold">
                                ₹{row.cashSales.toLocaleString('en-IN')}
                              </td>
                              <td className="p-3.5 text-right text-blue-800 font-mono font-bold">
                                ₹{row.upiSales.toLocaleString('en-IN')}
                              </td>
                              <td className="p-3.5 text-right font-serif font-extrabold text-sm text-[#2C1A14]">
                                ₹{row.totalSales.toLocaleString('en-IN')}
                              </td>
                              <td className="p-3.5 pr-4 text-center">
                                <button
                                  onClick={() => {
                                    setSelectedDate(row.date);
                                    setViewTab('DAY');
                                  }}
                                  className="px-3 py-1 rounded-lg bg-[#FAF6F0] hover:bg-[#2C1A14] hover:text-[#E5C170] border border-[#EFE6D8] text-[11px] font-bold text-[#2C1A14] transition-all flex items-center space-x-1 mx-auto"
                                >
                                  <span>View</span>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
}
