import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import { getExpenses, addExpense, deleteExpense } from '../../services/expenseService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Wallet,
  Plus,
  Trash2,
  Calendar,
  Banknote,
  QrCode,
  RefreshCw,
  X,
  Filter,
  ArrowDownCircle,
  Receipt,
  Search,
  CheckCircle2
} from 'lucide-react';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('ALL'); // 'ALL' | 'TODAY' | 'MONTH' | 'CUSTOM'

  const getTodayString = () => {
    const d = new Date();
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

  const [customDate, setCustomDate] = useState(getTodayString());

  // Add Expense Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Raw Materials');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expensePaymentMethod, setExpensePaymentMethod] = useState('CASH');
  const [expenseDate, setExpenseDate] = useState(getTodayString());
  const [expenseNotes, setExpenseNotes] = useState('');
  const [savingExpense, setSavingExpense] = useState(false);
  const [successBanner, setSuccessBanner] = useState('');

  const loadExpensesData = async () => {
    setLoading(true);
    try {
      const data = await getExpenses();
      setExpenses(data || []);
    } catch (err) {
      console.error('Failed to load cafe expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpensesData();
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

  // Overall Totals
  const todayStr = getTodayString();
  const thisMonthStr = getThisMonthString();

  const totalAllExpenses = useMemo(() => {
    return expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }, [expenses]);

  const todayExpenses = useMemo(() => {
    return expenses
      .filter((e) => (e.expense_date || formatToLocalDate(e.created_at)) === todayStr)
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }, [expenses, todayStr]);

  const monthExpenses = useMemo(() => {
    return expenses
      .filter((e) => formatToYearMonth(e.expense_date || e.created_at) === thisMonthStr)
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }, [expenses, thisMonthStr]);

  const cashExpenses = useMemo(() => {
    return expenses
      .filter((e) => (e.payment_method || 'CASH').toUpperCase() === 'CASH')
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }, [expenses]);

  const upiExpenses = useMemo(() => {
    return expenses
      .filter((e) => (e.payment_method || '').toUpperCase() === 'UPI')
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }, [expenses]);

  // Filtered List
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const expDate = e.expense_date || formatToLocalDate(e.created_at);
      const expMonth = formatToYearMonth(e.expense_date || e.created_at);

      if (filterMode === 'TODAY' && expDate !== todayStr) return false;
      if (filterMode === 'MONTH' && expMonth !== thisMonthStr) return false;
      if (filterMode === 'CUSTOM' && expDate !== customDate) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (e.title || '').toLowerCase().includes(q);
        const matchCat = (e.category || '').toLowerCase().includes(q);
        const matchNotes = (e.notes || '').toLowerCase().includes(q);
        if (!matchTitle && !matchCat && !matchNotes) return false;
      }

      return true;
    });
  }, [expenses, filterMode, todayStr, thisMonthStr, customDate, searchQuery]);

  const filteredTotal = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }, [filteredExpenses]);

  // Handle Add Expense
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

      // Show banner
      setSuccessBanner(`Added expense "${expenseTitle}" (₹${expenseAmount}) successfully!`);
      setTimeout(() => setSuccessBanner(''), 4000);

      // Reset form
      setExpenseTitle('');
      setExpenseAmount('');
      setExpenseNotes('');
      setExpenseDate(getTodayString());
      setIsModalOpen(false);

      // Reload
      await loadExpensesData();
    } catch (err) {
      alert(err.message || 'Failed to add expense');
    } finally {
      setSavingExpense(false);
    }
  };

  // Handle Delete Expense
  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete expense "${title}"?`)) return;
    try {
      await deleteExpense(id);
      await loadExpensesData();
    } catch (err) {
      alert('Failed to delete expense');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#FAF6F0] text-[#2C1A14]">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-24 lg:pb-0">
        {/* Header */}
        <header className="bg-white px-4 sm:px-6 lg:px-8 py-4 border-b border-[#EFE6D8] sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div>
            <span className="text-[10px] font-bold text-[#C8963E] uppercase tracking-widest font-mono">
              DAILY CAFE EXPENSES & OUTFLOWS
            </span>
            <h1 className="font-serif font-bold text-xl sm:text-2xl text-[#2C1A14]">
              Cafe Expenses
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#2C1A14] text-[#E5C170] hover:bg-[#3E2723] font-bold text-xs sm:text-sm flex items-center space-x-1.5 shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ ADD EXPENSE</span>
            </button>

            <button
              onClick={loadExpensesData}
              disabled={loading}
              className="p-2.5 rounded-xl bg-[#FAF6F0] text-[#2C1A14] hover:bg-[#EFE6D8] border border-[#EFE6D8] shadow-xs"
              title="Refresh Expenses"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {/* Success Banner */}
        {successBanner && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 text-xs text-emerald-800 font-bold flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successBanner}</span>
            </div>
            <button onClick={() => setSuccessBanner('')} className="text-emerald-700 hover:text-emerald-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <LoadingSpinner message="Loading Cafe Expenses..." />
          </div>
        ) : (
          <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">

            {/* ========================================================= */}
            {/* 5 KEY EXPENSE METRIC CARDS (TOTAL EXPENSES, TODAY, MONTH, CASH, UPI) */}
            {/* ========================================================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              
              {/* Card 1: TOTAL EXPENSES */}
              <div className="bg-white p-5 rounded-3xl border-2 border-[#2C1A14] shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-extrabold text-[#2C1A14] uppercase tracking-wider font-mono">
                    TOTAL EXPENSES
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#2C1A14] text-[#E5C170] flex items-center justify-center">
                    <Wallet className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-serif font-extrabold text-2xl sm:text-3xl text-rose-700">
                  ₹{totalAllExpenses.toLocaleString('en-IN')}
                </div>
                <span className="text-[11px] text-stone-500 font-semibold mt-2 block">
                  All-time total expenses ({expenses.length} entries)
                </span>
              </div>

              {/* Card 2: TODAY'S EXPENSES */}
              <div className="bg-white p-5 rounded-3xl border border-[#EFE6D8] shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-[#6D4C41] uppercase tracking-wider font-mono">
                    TODAY'S EXPENSES
                  </span>
                  <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-serif font-extrabold text-2xl sm:text-3xl text-rose-700">
                  ₹{todayExpenses.toLocaleString('en-IN')}
                </div>
                <span className="text-[11px] text-stone-500 font-medium mt-2 block">
                  Today ({formatReadableDate(todayStr)})
                </span>
              </div>

              {/* Card 3: THIS MONTH'S EXPENSES */}
              <div className="bg-white p-5 rounded-3xl border border-[#EFE6D8] shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-[#6D4C41] uppercase tracking-wider font-mono">
                    THIS MONTH'S EXPENSES
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#FAF6F0] text-[#C8963E] flex items-center justify-center">
                    <Receipt className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-serif font-extrabold text-2xl sm:text-3xl text-[#2C1A14]">
                  ₹{monthExpenses.toLocaleString('en-IN')}
                </div>
                <span className="text-[11px] text-stone-500 font-medium mt-2 block">
                  Total for {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </span>
              </div>

              {/* Card 4: CASH EXPENSES */}
              <div className="bg-white p-5 rounded-3xl border border-[#EFE6D8] shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-[#6D4C41] uppercase tracking-wider font-mono">
                    CASH EXPENSES
                  </span>
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Banknote className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-serif font-extrabold text-2xl sm:text-3xl text-emerald-800">
                  ₹{cashExpenses.toLocaleString('en-IN')}
                </div>
                <span className="text-[11px] text-stone-500 font-medium mt-2 block">
                  Cash paid from counter
                </span>
              </div>

              {/* Card 5: UPI EXPENSES */}
              <div className="bg-white p-5 rounded-3xl border border-[#EFE6D8] shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-[#6D4C41] uppercase tracking-wider font-mono">
                    UPI EXPENSES
                  </span>
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center">
                    <QrCode className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-serif font-extrabold text-2xl sm:text-3xl text-blue-800">
                  ₹{upiExpenses.toLocaleString('en-IN')}
                </div>
                <span className="text-[11px] text-stone-500 font-medium mt-2 block">
                  Paid via QR / UPI
                </span>
              </div>

            </div>

            {/* ========================================================= */}
            {/* FILTER CONTROLS & SEARCH                                  */}
            {/* ========================================================= */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#EFE6D8] shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setFilterMode('ALL')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    filterMode === 'ALL'
                      ? 'bg-[#2C1A14] text-[#E5C170] shadow-sm'
                      : 'bg-[#FAF6F0] text-[#2C1A14] hover:bg-[#EFE6D8] border border-[#EFE6D8]'
                  }`}
                >
                  All Expenses
                </button>

                <button
                  onClick={() => setFilterMode('TODAY')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    filterMode === 'TODAY'
                      ? 'bg-[#2C1A14] text-[#E5C170] shadow-sm'
                      : 'bg-[#FAF6F0] text-[#2C1A14] hover:bg-[#EFE6D8] border border-[#EFE6D8]'
                  }`}
                >
                  ☀️ Today's
                </button>

                <button
                  onClick={() => setFilterMode('MONTH')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    filterMode === 'MONTH'
                      ? 'bg-[#2C1A14] text-[#E5C170] shadow-sm'
                      : 'bg-[#FAF6F0] text-[#2C1A14] hover:bg-[#EFE6D8] border border-[#EFE6D8]'
                  }`}
                >
                  🗓️ This Month
                </button>

                <div className="flex items-center space-x-1 bg-[#FAF6F0] border border-[#EFE6D8] px-2.5 py-1 rounded-xl">
                  <span className="text-[11px] font-bold text-[#6D4C41]">📅 Pick Date:</span>
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => {
                      setCustomDate(e.target.value);
                      setFilterMode('CUSTOM');
                    }}
                    className="bg-transparent text-[#2C1A14] font-bold text-xs p-1 focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Search Box */}
              <div className="relative min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search milk, chicken, salary..."
                  className="w-full bg-[#FAF6F0] border border-[#EFE6D8] pl-9 pr-3 py-2 rounded-xl text-xs text-[#2C1A14] focus:outline-none focus:ring-1 focus:ring-[#C8963E]"
                />
              </div>
            </div>

            {/* ========================================================= */}
            {/* EXPENSES TABLE & TOTAL SUMMARY BAR                        */}
            {/* ========================================================= */}
            <div className="bg-white rounded-3xl border border-[#EFE6D8] p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <Wallet className="w-5 h-5 text-[#C8963E]" />
                  <h3 className="font-serif font-bold text-lg text-[#2C1A14]">
                    Recorded Expenses List
                  </h3>
                </div>

                <div className="bg-amber-50 border border-amber-200/80 px-4 py-1.5 rounded-xl flex items-center space-x-2">
                  <span className="text-xs text-stone-600 font-bold uppercase font-mono">
                    Total for Selection:
                  </span>
                  <span className="font-serif font-extrabold text-base text-rose-700">
                    ₹{filteredTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {filteredExpenses.length === 0 ? (
                <div className="text-center py-16 text-[#6D4C41] text-xs space-y-3">
                  <Wallet className="w-12 h-12 text-[#C8963E]/40 mx-auto" />
                  <p className="font-bold text-sm text-[#2C1A14]">No expenses found for this view.</p>
                  <p className="text-stone-500">
                    Click "+ ADD EXPENSE" to record daily milk, chicken, electricity bills, or worker salaries!
                  </p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#2C1A14] text-[#E5C170] text-xs font-bold hover:bg-[#3E2723]"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add First Expense</span>
                  </button>
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
                      {filteredExpenses.map((exp) => (
                        <tr key={exp.id} className="hover:bg-[#FAF6F0]/60 transition-colors">
                          <td className="p-3.5 pl-4 font-mono font-semibold text-[#2C1A14] whitespace-nowrap">
                            {formatReadableDate(exp.expense_date || formatToLocalDate(exp.created_at))}
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
                              (exp.payment_method || '').toUpperCase() === 'UPI'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {exp.payment_method || 'CASH'}
                            </span>
                          </td>
                          <td className="p-3.5 text-stone-500 max-w-xs truncate">
                            {exp.notes || '-'}
                          </td>
                          <td className="p-3.5 text-right font-serif font-extrabold text-sm text-rose-700 whitespace-nowrap">
                            ₹{Number(exp.amount || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="p-3.5 pr-4 text-center">
                            <button
                              onClick={() => handleDelete(exp.id, exp.title)}
                              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete expense"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-[#FAF6F0] border-t-2 border-[#2C1A14] font-bold text-xs">
                        <td colSpan="5" className="p-3.5 pl-4 text-right uppercase font-mono text-[#2C1A14]">
                          TOTAL EXPENSES ({filteredExpenses.length} items):
                        </td>
                        <td className="p-3.5 text-right font-serif font-extrabold text-base text-rose-700">
                          ₹{filteredTotal.toLocaleString('en-IN')}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL: ADD NEW CAFE EXPENSE                               */}
        {/* ========================================================= */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-3xl border border-[#EFE6D8] shadow-2xl p-6 space-y-5 animate-fade-in">
              
              <div className="flex items-center justify-between border-b border-[#EFE6D8] pb-3">
                <div className="flex items-center space-x-2">
                  <Wallet className="w-5 h-5 text-[#C8963E]" />
                  <h3 className="font-serif font-bold text-lg text-[#2C1A14]">
                    Add New Cafe Expense
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Common Items Preset Chips */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#6D4C41] uppercase font-mono block">
                  Quick Select Common Items:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: '🥛 Fresh Milk', cat: 'Raw Materials' },
                    { label: '🍗 Chicken', cat: 'Raw Materials' },
                    { label: '⚡ Current Bill', cat: 'Utilities & Bills' },
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
                    Expense Title / Item Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={expenseTitle}
                    onChange={(e) => setExpenseTitle(e.target.value)}
                    placeholder="e.g. Milk, Chicken, Current Bill, Worker Salary"
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
                      <option value="CASH">💵 Cash</option>
                      <option value="UPI">📱 UPI / QR Code</option>
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
                    Notes / Memo (Optional)
                  </label>
                  <input
                    type="text"
                    value={expenseNotes}
                    onChange={(e) => setExpenseNotes(e.target.value)}
                    placeholder="e.g. Paid cash for morning milk supply"
                    className="w-full bg-[#FAF6F0] border border-[#EFE6D8] px-3.5 py-2 rounded-xl text-xs text-[#2C1A14] focus:outline-none"
                  />
                </div>

                {/* Buttons */}
                <div className="pt-2 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
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
