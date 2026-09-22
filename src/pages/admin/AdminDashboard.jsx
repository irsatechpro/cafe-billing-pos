import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import { getActiveOrders } from '../../services/orderService';
import { getPayments } from '../../services/paymentService';
import { getExpenses, addExpense, deleteExpense } from '../../services/expenseService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  TrendingUp,
  ShoppingBag,
  Banknote,
  QrCode,
  Calendar,
  CreditCard,
  Clock,
  Plus,
  Trash2,
  Receipt,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  X,
  CheckCircle2
} from 'lucide-react';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Main Mode: 'SALES' | 'EXPENSES' | 'LEDGER'
  const [activeTab, setActiveTab] = useState('SALES');

  // Sales View Filter Mode: 'DAY' | 'MONTH'
  const [salesViewMode, setSalesViewMode] = useState('DAY');

  // Selected Day state (YYYY-MM-DD, defaults to today)
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

  // Add Expense Modal state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Raw Materials');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expensePaymentMethod, setExpensePaymentMethod] = useState('CASH');
  const [expenseDate, setExpenseDate] = useState(getTodayString());
  const [expenseNotes, setExpenseNotes] = useState('');
  const [savingExpense, setSavingExpense] = useState(false);

  // Fetch all orders, payments, expenses from Supabase
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [ordData, payData, expData] = await Promise.all([
        getActiveOrders(),
        getPayments(),
        getExpenses()
      ]);
      setOrders(ordData || []);
      setPayments(payData || []);
      setExpenses(expData || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Helper date conversions
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

  // Payment mapping: order_id -> payment record
  const paymentMap = useMemo(() => {
    return new Map(payments.map((p) => [p.order_id, p]));
  }, [payments]);

  // Handle Day Shift (-1 day, +1 day)
  const shiftDay = (days) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + days);
    const newY = dateObj.getFullYear();
    const newM = String(dateObj.getMonth() + 1).padStart(2, '0');
    const newD = String(dateObj.getDate()).padStart(2, '0');
    setSelectedDate(`${newY}-${newM}-${newD}`);
  };

  // ==========================================
  // 1. CALCULATE SINGLE DAY METRICS
  // ==========================================
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

  // Day Expenses
  const dayExpensesList = useMemo(() => {
    return expenses.filter((e) => {
      const expDay = e.expense_date || formatToLocalDate(e.created_at);
      return expDay === selectedDate;
    });
  }, [expenses, selectedDate]);

  const dayTotalExpenses = useMemo(() => {
    return dayExpensesList.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }, [dayExpensesList]);

  const dayNetProfit = dayTotalSales - dayTotalExpenses;

  // ==========================================
  // 2. CALCULATE MONTHLY METRICS
  // ==========================================
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

  // Month Expenses
  const monthExpensesList = useMemo(() => {
    return expenses.filter((e) => {
      const expMonth = formatToYearMonth(e.expense_date || e.created_at);
      return expMonth === selectedMonth;
    });
  }, [expenses, selectedMonth]);

  const monthTotalExpenses = useMemo(() => {
    return monthExpensesList.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }, [monthExpensesList]);

  const monthNetProfit = monthTotalSales - monthTotalExpenses;

  // ==========================================
  // 3. 365-DAY HISTORICAL DAILY LEDGER
  // ==========================================
  const dailyLedger = useMemo(() => {
    const dayMap = {};

    // Populate from orders
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
          upiSales: 0,
          totalExpenses: 0
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

    // Populate expenses into daily ledger
    expenses.forEach((e) => {
      const dateStr = e.expense_date || formatToLocalDate(e.created_at);
      if (!dateStr) return;

      if (!dayMap[dateStr]) {
        dayMap[dateStr] = {
          date: dateStr,
          totalSales: 0,
          totalOrders: 0,
          cashSales: 0,
          upiSales: 0,
          totalExpenses: 0
        };
      }

      dayMap[dateStr].totalExpenses += Number(e.amount || 0);
    });

    // Sort newest date first
    return Object.values(dayMap).sort((a, b) => b.date.localeCompare(a.date));
  }, [orders, expenses, paymentMap]);

  // Save new expense
  const handleSaveExpense = async (e) => {
    e.preventDefault();
    setSavingExpense(true);
    try {
      await addExpense({
        title: expenseTitle,
        category: expenseCategory,
        amount: expenseAmount,
        payment_method: expensePaymentMethod,
        expense_date: expenseDate,
        notes: expenseNotes
      });

      // Reset form
      setExpenseTitle('');
      setExpenseAmount('');
      setExpenseNotes('');
      setIsExpenseModalOpen(false);

      // Reload
      await loadAllData();
    } catch (err) {
      alert(err.message || 'Failed to add expense');
    } finally {
      setSavingExpense(false);
    }
  };

  // Delete an expense
  const handleDeleteExpense = async (id, title) => {
    if (!window.confirm(`Delete expense "${title}"?`)) return;
    try {
      await deleteExpense(id);
      await loadAllData();
    } catch (err) {
      alert('Failed to delete expense');
    }
  };

  // Format readable dates
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

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#FAF6F0] text-[#2C1A14]">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-24 lg:pb-0">
        {/* Header */}
        <header className="bg-white px-4 sm:px-6 lg:px-8 py-4 border-b border-[#EFE6D8] sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div>
            <span className="text-[10px] font-bold text-[#C8963E] uppercase tracking-widest font-mono">
              FINANCIAL ACCOUNTING & POS ANALYTICS
            </span>
            <h1 className="font-serif font-bold text-xl sm:text-2xl text-[#2C1A14]">
              Trio Bean Sales & Expenses
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#2C1A14] text-[#E5C170] hover:bg-[#3E2723] font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ ADD EXPENSE</span>
            </button>

            <button
              onClick={loadAllData}
              disabled={loading}
              className="p-2 rounded-xl bg-[#FAF6F0] text-[#2C1A14] hover:bg-[#EFE6D8] border border-[#EFE6D8] shadow-xs"
              title="Refresh Data from Supabase"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {/* Primary Navigation Tabs */}
        <div className="bg-white px-4 sm:px-8 border-b border-[#EFE6D8] flex space-x-3 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('SALES')}
            className={`py-3.5 px-3 border-b-2 flex items-center space-x-2 transition-all shrink-0 ${
              activeTab === 'SALES'
                ? 'border-[#2C1A14] text-[#2C1A14]'
                : 'border-transparent text-stone-500 hover:text-[#2C1A14]'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-[#C8963E]" />
            <span>SALES & REVENUE (DAY / MONTH)</span>
          </button>

          <button
            onClick={() => setActiveTab('EXPENSES')}
            className={`py-3.5 px-3 border-b-2 flex items-center space-x-2 transition-all shrink-0 ${
              activeTab === 'EXPENSES'
                ? 'border-[#2C1A14] text-[#2C1A14]'
                : 'border-transparent text-stone-500 hover:text-[#2C1A14]'
            }`}
          >
            <Wallet className="w-4 h-4 text-[#C8963E]" />
            <span>DAILY EXPENSES (MILK, CHICKEN, BILLS, SALARY)</span>
          </button>

          <button
            onClick={() => setActiveTab('LEDGER')}
            className={`py-3.5 px-3 border-b-2 flex items-center space-x-2 transition-all shrink-0 ${
              activeTab === 'LEDGER'
                ? 'border-[#2C1A14] text-[#2C1A14]'
                : 'border-transparent text-stone-500 hover:text-[#2C1A14]'
            }`}
          >
            <Calendar className="w-4 h-4 text-[#C8963E]" />
            <span>365-DAY DAILY LEDGER</span>
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <LoadingSpinner message="Syncing Trio Bean Financial Records from Supabase..." />
          </div>
        ) : (
          <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">

            {/* ========================================================================= */}
            {/* TAB 1: SALES OVERVIEW (BY DAY OR BY MONTH)                                */}
            {/* ========================================================================= */}
            {activeTab === 'SALES' && (
              <div className="space-y-6">

                {/* Filter Controls: Choose Single Day vs Month */}
                <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EFE6D8] shadow-xs flex flex-wrap items-center justify-between gap-4">
                  
                  {/* View Mode Toggle: Day vs Month */}
                  <div className="flex items-center space-x-2 bg-[#FAF6F0] p-1.5 rounded-2xl border border-[#EFE6D8]">
                    <button
                      onClick={() => setSalesViewMode('DAY')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        salesViewMode === 'DAY'
                          ? 'bg-[#2C1A14] text-[#E5C170] shadow-sm'
                          : 'text-[#6D4C41] hover:text-[#2C1A14]'
                      }`}
                    >
                      📅 Select Single Day
                    </button>
                    <button
                      onClick={() => setSalesViewMode('MONTH')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        salesViewMode === 'MONTH'
                          ? 'bg-[#2C1A14] text-[#E5C170] shadow-sm'
                          : 'text-[#6D4C41] hover:text-[#2C1A14]'
                      }`}
                    >
                      🗓️ Select Month
                    </button>
                  </div>

                  {/* Dynamic Date / Month Pickers */}
                  {salesViewMode === 'DAY' ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => shiftDay(-1)}
                        className="p-2 rounded-xl bg-[#FAF6F0] hover:bg-[#EFE6D8] text-[#2C1A14] border border-[#EFE6D8]"
                        title="Previous Day"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-[#FAF6F0] border border-[#C8963E] text-[#2C1A14] font-bold text-xs px-3.5 py-2 rounded-xl focus:outline-none"
                      />

                      <button
                        onClick={() => shiftDay(1)}
                        className="p-2 rounded-xl bg-[#FAF6F0] hover:bg-[#EFE6D8] text-[#2C1A14] border border-[#EFE6D8]"
                        title="Next Day"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setSelectedDate(getTodayString())}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          selectedDate === getTodayString()
                            ? 'bg-[#2C1A14] text-[#E5C170] border-[#2C1A14]'
                            : 'bg-white text-[#2C1A14] border-[#EFE6D8] hover:bg-[#FAF6F0]'
                        }`}
                      >
                        Today
                      </button>

                      <button
                        onClick={() => setSelectedDate(getYesterdayString())}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          selectedDate === getYesterdayString()
                            ? 'bg-[#2C1A14] text-[#E5C170] border-[#2C1A14]'
                            : 'bg-white text-[#2C1A14] border-[#EFE6D8] hover:bg-[#FAF6F0]'
                        }`}
                      >
                        Yesterday
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-bold text-[#6D4C41]">Select Month:</span>
                      <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="bg-[#FAF6F0] border border-[#C8963E] text-[#2C1A14] font-bold text-xs px-3.5 py-2 rounded-xl focus:outline-none"
                      />
                      <button
                        onClick={() => setSelectedMonth(getThisMonthString())}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          selectedMonth === getThisMonthString()
                            ? 'bg-[#2C1A14] text-[#E5C170] border-[#2C1A14]'
                            : 'bg-white text-[#2C1A14] border-[#EFE6D8] hover:bg-[#FAF6F0]'
                        }`}
                      >
                        This Month
                      </button>
                    </div>
                  )}

                </div>

                {/* Subtitle Banner Indicating Current Selection */}
                <div className="flex items-center justify-between text-xs px-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-[#6D4C41] uppercase tracking-wider font-mono">
                      {salesViewMode === 'DAY' ? 'DAILY SALES FOR:' : 'MONTHLY SALES FOR:'}
                    </span>
                    <span className="font-serif font-extrabold text-base text-[#2C1A14]">
                      {salesViewMode === 'DAY'
                        ? formatReadableDate(selectedDate)
                        : formatReadableMonth(selectedMonth)}
                    </span>
                  </div>
                </div>

                {/* =================================================================== */}
                {/* THE 4 PRIMARY METRIC CARDS (SALES, TOTAL ORDER, CASH, UPI)          */}
                {/* =================================================================== */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Card 1: Total Sales */}
                  <div className="bg-white p-5 rounded-3xl border border-[#EFE6D8] shadow-xs relative overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-[#6D4C41] uppercase tracking-wider font-mono">
                        {salesViewMode === 'DAY' ? "THAT DAY'S SALES" : "MONTH'S TOTAL SALES"}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-[#FAF6F0] text-[#C8963E] flex items-center justify-center">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="font-serif font-extrabold text-3xl text-[#2C1A14]">
                      ₹{(salesViewMode === 'DAY' ? dayTotalSales : monthTotalSales).toLocaleString('en-IN')}
                    </div>
                    <span className="text-[11px] text-emerald-700 font-semibold mt-2 block">
                      {salesViewMode === 'DAY' ? `On ${selectedDate}` : `For ${selectedMonth}`}
                    </span>
                  </div>

                  {/* Card 2: Total Orders */}
                  <div className="bg-white p-5 rounded-3xl border border-[#EFE6D8] shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-[#6D4C41] uppercase tracking-wider font-mono">
                        {salesViewMode === 'DAY' ? "THAT DAY'S ORDERS" : "MONTH'S TOTAL ORDERS"}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-[#FAF6F0] text-[#2C1A14] flex items-center justify-center">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="font-serif font-extrabold text-3xl text-[#2C1A14]">
                      {salesViewMode === 'DAY' ? dayTotalOrders : monthTotalOrders}
                    </div>
                    <span className="text-[11px] text-stone-500 font-medium mt-2 block">
                      Completed cafe orders
                    </span>
                  </div>

                  {/* Card 3: Cash Sales */}
                  <div className="bg-white p-5 rounded-3xl border border-[#EFE6D8] shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-[#6D4C41] uppercase tracking-wider font-mono">
                        {salesViewMode === 'DAY' ? "THAT DAY'S CASH" : "MONTH'S CASH SALES"}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                        <Banknote className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="font-serif font-extrabold text-3xl text-emerald-800">
                      ₹{(salesViewMode === 'DAY' ? dayCashSales : monthCashSales).toLocaleString('en-IN')}
                    </div>
                    <span className="text-[11px] text-stone-500 font-medium mt-2 block">
                      Cash in register
                    </span>
                  </div>

                  {/* Card 4: UPI Sales */}
                  <div className="bg-white p-5 rounded-3xl border border-[#EFE6D8] shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-[#6D4C41] uppercase tracking-wider font-mono">
                        {salesViewMode === 'DAY' ? "THAT DAY'S UPI" : "MONTH'S UPI SALES"}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center">
                        <QrCode className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="font-serif font-extrabold text-3xl text-blue-800">
                      ₹{(salesViewMode === 'DAY' ? dayUpiSales : monthUpiSales).toLocaleString('en-IN')}
                    </div>
                    <span className="text-[11px] text-stone-500 font-medium mt-2 block">
                      Bank / QR receipts
                    </span>
                  </div>

                </div>

                {/* Profit & Loss Mini Banner for this period */}
                <div className="bg-white rounded-3xl p-5 border border-[#EFE6D8] shadow-xs flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#FAF6F0] flex items-center justify-center text-[#C8963E]">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#6D4C41] uppercase tracking-wider font-mono block">
                        NET PROFIT (SALES MINUS EXPENSES)
                      </span>
                      <span className="text-xs text-stone-500">
                        {salesViewMode === 'DAY'
                          ? `Sales: ₹${dayTotalSales} | Expenses: -₹${dayTotalExpenses}`
                          : `Sales: ₹${monthTotalSales} | Expenses: -₹${monthTotalExpenses}`}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider font-mono block">
                      NET CASH IN HAND
                    </span>
                    <span className={`font-serif font-extrabold text-2xl ${
                      (salesViewMode === 'DAY' ? dayNetProfit : monthNetProfit) >= 0
                        ? 'text-emerald-700'
                        : 'text-rose-700'
                    }`}>
                      ₹{(salesViewMode === 'DAY' ? dayNetProfit : monthNetProfit).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* List of Orders for the selected period */}
                <div className="bg-white rounded-3xl border border-[#EFE6D8] p-5 sm:p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Receipt className="w-5 h-5 text-[#C8963E]" />
                      <h3 className="font-serif font-bold text-lg text-[#2C1A14]">
                        {salesViewMode === 'DAY'
                          ? `Orders Completed on ${formatReadableDate(selectedDate)}`
                          : `Orders Completed in ${formatReadableMonth(selectedMonth)}`}
                      </h3>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#6D4C41]">
                      {salesViewMode === 'DAY' ? dayOrders.length : monthOrders.length} orders
                    </span>
                  </div>

                  {(salesViewMode === 'DAY' ? dayOrders : monthOrders).length === 0 ? (
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
                            <th className="p-3.5">Items</th>
                            <th className="p-3.5 pr-4 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EFE6D8] text-xs">
                          {(salesViewMode === 'DAY' ? dayOrders : monthOrders).map((order) => {
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
                      </table>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 2: CAFE EXPENSES (MILK, CHICKEN, BILLS, SALARIES)                    */}
            {/* ========================================================================= */}
            {activeTab === 'EXPENSES' && (
              <div className="space-y-6">

                {/* Top Expenses Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Today's Expenses */}
                  <div className="bg-white p-5 rounded-3xl border border-[#EFE6D8] shadow-xs">
                    <span className="text-[10px] font-bold text-[#6D4C41] uppercase tracking-wider font-mono block mb-1">
                      TODAY'S EXPENSES ({getTodayString()})
                    </span>
                    <div className="font-serif font-extrabold text-3xl text-rose-700">
                      ₹{expenses
                        .filter((e) => (e.expense_date || formatToLocalDate(e.created_at)) === getTodayString())
                        .reduce((sum, e) => sum + Number(e.amount || 0), 0)
                        .toLocaleString('en-IN')}
                    </div>
                    <span className="text-[10px] text-stone-500 font-medium mt-1 block">
                      Supplies, daily groceries & cash payouts
                    </span>
                  </div>

                  {/* This Month's Expenses */}
                  <div className="bg-white p-5 rounded-3xl border border-[#EFE6D8] shadow-xs">
                    <span className="text-[10px] font-bold text-[#6D4C41] uppercase tracking-wider font-mono block mb-1">
                      MONTH'S EXPENSES ({getThisMonthString()})
                    </span>
                    <div className="font-serif font-extrabold text-3xl text-rose-700">
                      ₹{expenses
                        .filter((e) => formatToYearMonth(e.expense_date || e.created_at) === getThisMonthString())
                        .reduce((sum, e) => sum + Number(e.amount || 0), 0)
                        .toLocaleString('en-IN')}
                    </div>
                    <span className="text-[10px] text-stone-500 font-medium mt-1 block">
                      Salaries, bills, raw materials
                    </span>
                  </div>

                  {/* All-Time Total Expenses */}
                  <div className="bg-white p-5 rounded-3xl border border-[#EFE6D8] shadow-xs">
                    <span className="text-[10px] font-bold text-[#6D4C41] uppercase tracking-wider font-mono block mb-1">
                      TOTAL RECORDED EXPENSES
                    </span>
                    <div className="font-serif font-extrabold text-3xl text-[#2C1A14]">
                      ₹{expenses
                        .reduce((sum, e) => sum + Number(e.amount || 0), 0)
                        .toLocaleString('en-IN')}
                    </div>
                    <span className="text-[10px] text-stone-500 font-medium mt-1 block">
                      {expenses.length} total expense entries
                    </span>
                  </div>
                </div>

                {/* Expenses Table */}
                <div className="bg-white rounded-3xl border border-[#EFE6D8] p-5 sm:p-6 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <Wallet className="w-5 h-5 text-[#C8963E]" />
                      <h3 className="font-serif font-bold text-lg text-[#2C1A14]">
                        Expense History & Vouchers
                      </h3>
                    </div>

                    <button
                      onClick={() => setIsExpenseModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-[#2C1A14] text-[#E5C170] hover:bg-[#3E2723] font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ RECORD EXPENSE (MILK, CHICKEN, BILL, SALARY)</span>
                    </button>
                  </div>

                  {expenses.length === 0 ? (
                    <div className="text-center py-16 text-[#6D4C41] text-xs space-y-2">
                      <Wallet className="w-10 h-10 text-[#C8963E]/40 mx-auto" />
                      <p className="font-bold text-sm text-[#2C1A14]">No expenses recorded yet.</p>
                      <p>Click "+ RECORD EXPENSE" to track daily milk, chicken, electricity bills, or worker salaries!</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[650px]">
                        <thead>
                          <tr className="bg-[#FAF6F0] border-b border-[#EFE6D8] text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider">
                            <th className="p-3.5 pl-4">Date</th>
                            <th className="p-3.5">Expense Item</th>
                            <th className="p-3.5">Category</th>
                            <th className="p-3.5">Payment Method</th>
                            <th className="p-3.5">Notes</th>
                            <th className="p-3.5 text-right">Amount</th>
                            <th className="p-3.5 pr-4 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EFE6D8] text-xs">
                          {expenses.map((exp) => (
                            <tr key={exp.id} className="hover:bg-[#FAF6F0]/60 transition-colors">
                              <td className="p-3.5 pl-4 font-mono font-semibold text-[#2C1A14]">
                                {exp.expense_date || formatToLocalDate(exp.created_at)}
                              </td>
                              <td className="p-3.5 font-bold text-[#2C1A14]">
                                {exp.title}
                              </td>
                              <td className="p-3.5">
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF6F0] border border-[#EFE6D8] text-[#6D4C41]">
                                  {exp.category}
                                </span>
                              </td>
                              <td className="p-3.5">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                                  exp.payment_method === 'UPI'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {exp.payment_method}
                                </span>
                              </td>
                              <td className="p-3.5 text-stone-500 max-w-xs truncate">
                                {exp.notes || '-'}
                              </td>
                              <td className="p-3.5 text-right font-serif font-extrabold text-sm text-rose-700">
                                -₹{Number(exp.amount || 0).toLocaleString('en-IN')}
                              </td>
                              <td className="p-3.5 pr-4 text-center">
                                <button
                                  onClick={() => handleDeleteExpense(exp.id, exp.title)}
                                  className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  title="Delete expense"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 3: 365-DAY HISTORICAL DAILY LEDGER (DAY BY DAY)                       */}
            {/* ========================================================================= */}
            {activeTab === 'LEDGER' && (
              <div className="bg-white rounded-3xl border border-[#EFE6D8] p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-[#2C1A14]">
                      Day-by-Day Financial Ledger
                    </h3>
                    <p className="text-xs text-stone-500">
                      Shows daily breakdown of Total Sales, Orders, Cash, UPI, Expenses, and Net Profit for every day. Click any row to inspect!
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#C8963E]">
                    {dailyLedger.length} active business days recorded
                  </span>
                </div>

                {dailyLedger.length === 0 ? (
                  <div className="text-center py-12 text-[#6D4C41] text-xs">
                    No ledger entries recorded yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead>
                        <tr className="bg-[#FAF6F0] border-b border-[#EFE6D8] text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider">
                          <th className="p-3.5 pl-4">Date</th>
                          <th className="p-3.5 text-center">Orders</th>
                          <th className="p-3.5 text-right">Total Sales</th>
                          <th className="p-3.5 text-right">Cash Sales</th>
                          <th className="p-3.5 text-right">UPI Sales</th>
                          <th className="p-3.5 text-right">Expenses</th>
                          <th className="p-3.5 text-right">Net Profit</th>
                          <th className="p-3.5 pr-4 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EFE6D8] text-xs">
                        {dailyLedger.map((row) => {
                          const netProfit = row.totalSales - row.totalExpenses;
                          const isSelected = selectedDate === row.date;

                          return (
                            <tr
                              key={row.date}
                              className={`transition-colors ${
                                isSelected ? 'bg-amber-50/70 font-semibold' : 'hover:bg-[#FAF6F0]/60'
                              }`}
                            >
                              <td className="p-3.5 pl-4 font-mono font-bold text-[#2C1A14]">
                                {formatReadableDate(row.date)}
                                {row.date === getTodayString() && (
                                  <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#2C1A14] text-[#E5C170] uppercase">
                                    Today
                                  </span>
                                )}
                              </td>
                              <td className="p-3.5 text-center font-bold">
                                {row.totalOrders}
                              </td>
                              <td className="p-3.5 text-right font-serif font-extrabold text-sm text-[#2C1A14]">
                                ₹{row.totalSales.toLocaleString('en-IN')}
                              </td>
                              <td className="p-3.5 text-right text-emerald-800 font-mono font-bold">
                                ₹{row.cashSales.toLocaleString('en-IN')}
                              </td>
                              <td className="p-3.5 text-right text-blue-800 font-mono font-bold">
                                ₹{row.upiSales.toLocaleString('en-IN')}
                              </td>
                              <td className="p-3.5 text-right text-rose-700 font-mono font-bold">
                                {row.totalExpenses > 0 ? `-₹${row.totalExpenses.toLocaleString('en-IN')}` : '₹0'}
                              </td>
                              <td className={`p-3.5 text-right font-serif font-extrabold text-sm ${
                                netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'
                              }`}>
                                ₹{netProfit.toLocaleString('en-IN')}
                              </td>
                              <td className="p-3.5 pr-4 text-center">
                                <button
                                  onClick={() => {
                                    setSelectedDate(row.date);
                                    setSalesViewMode('DAY');
                                    setActiveTab('SALES');
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-[#FAF6F0] hover:bg-[#EFE6D8] border border-[#EFE6D8] text-[11px] font-bold text-[#2C1A14] transition-all"
                                >
                                  View Day &rarr;
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

        {/* ========================================================================= */}
        {/* MODAL: ADD NEW CAFE EXPENSE (MILK, CHICKEN, BILLS, SALARIES)              */}
        {/* ========================================================================= */}
        {isExpenseModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-3xl border border-[#EFE6D8] shadow-2xl p-6 space-y-5 animate-fade-in">
              
              <div className="flex items-center justify-between border-b border-[#EFE6D8] pb-3">
                <div className="flex items-center space-x-2">
                  <Wallet className="w-5 h-5 text-[#C8963E]" />
                  <h3 className="font-serif font-bold text-lg text-[#2C1A14]">
                    Record Cafe Expense
                  </h3>
                </div>
                <button
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="p-1 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Preset Buttons for Common Cafe Expenses */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#6D4C41] uppercase font-mono block">
                  Quick Common Items:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: '🥛 Fresh Milk', cat: 'Raw Materials' },
                    { label: '🍗 Chicken', cat: 'Raw Materials' },
                    { label: '⚡ Electricity Bill', cat: 'Utilities & Bills' },
                    { label: '👷 Worker Salary', cat: 'Staff Salary' },
                    { label: '🔥 Gas Cylinder', cat: 'Utilities & Bills' },
                    { label: '📦 Packaging / Cups', cat: 'Packaging' },
                    { label: '☕ Coffee Beans', cat: 'Raw Materials' }
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setExpenseTitle(preset.label.replace(/^[^\s]+\s/, ''));
                        setExpenseCategory(preset.cat);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#FAF6F0] hover:bg-[#EFE6D8] text-[11px] font-bold text-[#2C1A14] border border-[#EFE6D8] transition-all"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSaveExpense} className="space-y-4">
                
                {/* Expense Title */}
                <div>
                  <label className="block text-xs font-bold text-[#2C1A14] mb-1">
                    Expense Description / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={expenseTitle}
                    onChange={(e) => setExpenseTitle(e.target.value)}
                    placeholder="e.g. Milk (10 Liters), Chicken (5kg), Worker Salary"
                    className="w-full bg-[#FAF6F0] border border-[#EFE6D8] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C1A14] focus:outline-none focus:ring-2 focus:ring-[#C8963E]"
                  />
                </div>

                {/* Amount & Payment Method */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2C1A14] mb-1">
                      Amount (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      placeholder="e.g. 500"
                      className="w-full bg-[#FAF6F0] border border-[#EFE6D8] px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#2C1A14] focus:outline-none focus:ring-2 focus:ring-[#C8963E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2C1A14] mb-1">
                      Paid Via *
                    </label>
                    <select
                      value={expensePaymentMethod}
                      onChange={(e) => setExpensePaymentMethod(e.target.value)}
                      className="w-full bg-[#FAF6F0] border border-[#EFE6D8] px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#2C1A14] focus:outline-none focus:ring-2 focus:ring-[#C8963E]"
                    >
                      <option value="CASH">💵 Cash Payout</option>
                      <option value="UPI">📱 UPI / QR Scan</option>
                      <option value="CARD">💳 Card / Bank</option>
                    </select>
                  </div>
                </div>

                {/* Category & Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2C1A14] mb-1">
                      Category
                    </label>
                    <select
                      value={expenseCategory}
                      onChange={(e) => setExpenseCategory(e.target.value)}
                      className="w-full bg-[#FAF6F0] border border-[#EFE6D8] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C1A14] focus:outline-none focus:ring-2 focus:ring-[#C8963E]"
                    >
                      <option value="Raw Materials">Raw Materials & Milk</option>
                      <option value="Groceries">Groceries & Vegetables</option>
                      <option value="Utilities & Bills">Utilities (Current Bill, Gas)</option>
                      <option value="Staff Salary">Staff / Worker Salary</option>
                      <option value="Packaging">Packaging & Disposables</option>
                      <option value="Rent">Shop Rent</option>
                      <option value="Maintenance">Maintenance & Repairs</option>
                      <option value="Miscellaneous">Miscellaneous</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2C1A14] mb-1">
                      Expense Date
                    </label>
                    <input
                      type="date"
                      value={expenseDate}
                      onChange={(e) => setExpenseDate(e.target.value)}
                      className="w-full bg-[#FAF6F0] border border-[#EFE6D8] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C1A14] focus:outline-none focus:ring-2 focus:ring-[#C8963E]"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold text-[#2C1A14] mb-1">
                    Notes / Voucher Reference (Optional)
                  </label>
                  <input
                    type="text"
                    value={expenseNotes}
                    onChange={(e) => setExpenseNotes(e.target.value)}
                    placeholder="e.g. Paid to vendor for morning stock"
                    className="w-full bg-[#FAF6F0] border border-[#EFE6D8] px-3.5 py-2 rounded-xl text-xs text-[#2C1A14] focus:outline-none"
                  />
                </div>

                {/* Modal Buttons */}
                <div className="pt-2 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsExpenseModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingExpense}
                    className="px-5 py-2.5 rounded-xl bg-[#2C1A14] text-[#E5C170] hover:bg-[#3E2723] text-xs font-bold shadow-md transition-all active:scale-98 disabled:opacity-50"
                  >
                    {savingExpense ? 'Saving...' : 'Save Expense'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
