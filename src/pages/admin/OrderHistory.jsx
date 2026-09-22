import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import { getActiveOrders, deleteOrder, deleteAllOrders } from '../../services/orderService';
import { getPayments } from '../../services/paymentService';
import { Receipt, Search, Filter, Calendar, CheckCircle2, DollarSign, Trash2 } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('ALL');

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordData, payData] = await Promise.all([
        getActiveOrders(),
        getPayments()
      ]);
      setOrders(ordData);
      setPayments(payData);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteSingle = async (orderId, orderNum) => {
    if (!window.confirm(`Delete Order #${orderNum || orderId.slice(0, 6)}?`)) return;
    try {
      await deleteOrder(orderId);
      loadData();
    } catch (err) {
      alert('Failed to delete order');
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('⚠️ Delete ALL historical orders for testing?')) return;
    try {
      await deleteAllOrders();
      loadData();
      alert('All orders wiped clean.');
    } catch (err) {
      alert('Failed to delete all orders');
    }
  };

  const paymentMap = new Map(payments.map(p => [p.order_id, p]));

  const filteredOrders = orders.filter(o => {
    if (o.status === 'CANCELLED' && statusFilter !== 'CANCELLED') return false;
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const paymentRecord = paymentMap.get(o.id);
    const matchesPayment = paymentMethodFilter === 'ALL' || (paymentRecord && paymentRecord.payment_method === paymentMethodFilter);
    return matchesStatus && matchesPayment;
  });

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#FAF6F0] text-[#2C1A14]">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-24 lg:pb-0">
        <header className="bg-white px-4 sm:px-6 lg:px-8 py-3.5 sm:py-5 border-b border-[#EFE6D8] sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div>
            <span className="text-[10px] font-bold text-[#C8963E] uppercase tracking-widest font-mono">
              COMPLETED & HISTORICAL TRANSACTIONS
            </span>
            <h1 className="font-serif font-bold text-xl sm:text-2xl text-[#2C1A14]">
              Order & Sales History
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            {orders.length > 0 && (
              <button
                onClick={handleDeleteAll}
                className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-xs"
                title="Wipe all orders"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>DELETE ALL ORDERS</span>
              </button>
            )}
          </div>
        </header>

        {/* Filters */}
        <div className="px-4 sm:px-6 lg:px-8 py-3 bg-[#FDFBF7] border-b border-[#EFE6D8] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <span className="font-bold text-[#6D4C41]">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-[#EFE6D8] px-3 py-1.5 rounded-xl font-medium text-[#2C1A14]"
              >
                <option value="ALL">All Statuses</option>
                <option value="COMPLETED">Completed</option>
                <option value="SERVED">Served</option>
                <option value="NEW">New</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Payment Method Filter */}
            <div className="flex items-center space-x-2">
              <span className="font-bold text-[#6D4C41]">Payment Method:</span>
              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                className="bg-white border border-[#EFE6D8] px-3 py-1.5 rounded-xl font-medium text-[#2C1A14]"
              >
                <option value="ALL">All Methods</option>
                <option value="CASH">CASH</option>
                <option value="UPI">UPI</option>
                <option value="CARD">CARD</option>
              </select>
            </div>
          </div>

          <div className="text-xs font-mono font-bold text-[#C8963E]">
            {filteredOrders.length} records found
          </div>
        </div>

        {/* History Table */}
        <div className="p-4 sm:p-6 lg:p-8">
          {loading ? (
            <div className="py-20 flex items-center justify-center">
              <LoadingSpinner message="Loading Trio Bean Order History..." />
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-[#EFE6D8] shadow-sm overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="bg-[#FAF6F0] border-b border-[#EFE6D8] text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider">
                    <th className="p-4 pl-6">Order #</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Date & Time</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4 text-right">Total Amount</th>
                    <th className="p-4 pr-6 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE6D8] text-xs">
                  {filteredOrders.map((order) => {
                    const payRecord = paymentMap.get(order.id);

                    return (
                      <tr key={order.id} className="hover:bg-[#FAF6F0]/60 transition-colors">
                        <td className="p-4 pl-6 font-mono font-bold text-[#2C1A14]">
                          #{order.order_number || order.id.slice(0, 6)}
                        </td>

                        <td className="p-4 font-semibold text-[#2C1A14]">
                          {order.customer_name || 'Guest'}
                        </td>

                        <td className="p-4 text-stone-500 font-mono text-[11px]">
                          {new Date(order.created_at).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>

                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                            order.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-[#F5EFE6] text-[#2C1A14]'
                          }`}>
                            {order.status}
                          </span>
                        </td>

                        <td className="p-4">
                          {payRecord ? (
                            <span className="font-bold text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                              {payRecord.payment_method} • PAID
                            </span>
                          ) : (
                            <span className="text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 font-medium">
                              Pending Cashier
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-right font-serif font-bold text-sm text-[#2C1A14]">
                          ₹{order.total_amount || order.subtotal}
                        </td>

                        <td className="p-4 pr-6 text-center">
                          <button
                            onClick={() => handleDeleteSingle(order.id, order.order_number)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
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
      </main>
    </div>
  );
}
