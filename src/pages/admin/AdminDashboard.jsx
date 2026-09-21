import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import { getActiveOrders } from '../../services/orderService';
import { getPayments } from '../../services/paymentService';
import { DollarSign, ShoppingBag, CreditCard, Banknote, QrCode, TrendingUp, Clock } from 'lucide-react';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      try {
        const [ordData, payData] = await Promise.all([
          getActiveOrders(),
          getPayments()
        ]);
        setOrders(ordData);
        setPayments(payData);
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  // Compute metrics
  const totalSales = orders
    .filter(o => o.status === 'COMPLETED' || o.status === 'SERVED')
    .reduce((sum, o) => sum + Number(o.total_amount || o.subtotal), 0);

  const activeOrdersCount = orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length;
  const completedOrdersCount = orders.filter(o => o.status === 'COMPLETED').length;

  const cashSales = payments
    .filter(p => p.payment_method === 'CASH')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const upiSales = payments
    .filter(p => p.payment_method === 'UPI')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const cardSales = payments
    .filter(p => p.payment_method === 'CARD')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#FAF6F0] text-[#2C1A14]">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-24 lg:pb-0">
        <header className="bg-white px-4 sm:px-6 lg:px-8 py-3.5 sm:py-5 border-b border-[#EFE6D8] sticky top-0 z-20 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-bold text-[#C8963E] uppercase tracking-widest font-mono">
              BUSINESS METRICS OVERVIEW
            </span>
            <h1 className="font-serif font-bold text-xl sm:text-2xl text-[#2C1A14]">
              Trio Bean Café Sales Dashboard
            </h1>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Sales */}
            <div className="bg-white p-5 rounded-3xl border border-[#EFE6D8] shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-[#6D4C41] uppercase tracking-wider">
                  TODAY'S TOTAL SALES
                </span>
                <div className="w-8 h-8 rounded-full bg-[#FAF6F0] text-[#C8963E] flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="font-serif font-extrabold text-3xl text-[#2C1A14]">
                ₹{totalSales}
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
                Live accumulated revenue
              </span>
            </div>

            {/* Total Orders */}
            <div className="bg-white p-5 rounded-3xl border border-[#EFE6D8] shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-[#6D4C41] uppercase tracking-wider">
                  TOTAL ORDERS
                </span>
                <div className="w-8 h-8 rounded-full bg-[#FAF6F0] text-[#2C1A14] flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <div className="font-serif font-extrabold text-3xl text-[#2C1A14]">
                {orders.length}
              </div>
              <span className="text-[11px] text-stone-500 font-medium mt-1 block">
                {activeOrdersCount} currently active
              </span>
            </div>

            {/* Cash Sales */}
            <div className="bg-white p-5 rounded-3xl border border-[#EFE6D8] shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-[#6D4C41] uppercase tracking-wider">
                  CASH SALES
                </span>
                <Banknote className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="font-serif font-extrabold text-2xl text-[#2C1A14]">
                ₹{cashSales}
              </div>
            </div>

            {/* UPI Sales */}
            <div className="bg-white p-5 rounded-3xl border border-[#EFE6D8] shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-[#6D4C41] uppercase tracking-wider">
                  UPI SALES
                </span>
                <QrCode className="w-4 h-4 text-blue-600" />
              </div>
              <div className="font-serif font-extrabold text-2xl text-[#2C1A14]">
                ₹{upiSales}
              </div>
            </div>
          </div>

          {/* Recent Orders Overview */}
          <div className="bg-white rounded-3xl border border-[#EFE6D8] p-6 shadow-sm">
            <h3 className="font-serif font-bold text-lg text-[#2C1A14] mb-4">
              Recent Cafe Activity
            </h3>
            <div className="space-y-3">
              {orders.slice(0, 5).map((o) => (
                <div key={o.id} className="p-3.5 rounded-2xl bg-[#FAF6F0] flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-bold text-[#2C1A14] text-sm">
                      #{o.order_number || o.id.slice(0, 6)}
                    </span>
                    <span className="text-[#2C1A14] font-semibold">{o.customer_name || 'Guest'}</span>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="font-bold uppercase text-[10px] bg-white px-2.5 py-1 rounded-full border border-[#EFE6D8]">
                      {o.status}
                    </span>
                    <span className="font-serif font-bold text-sm text-[#2C1A14]">
                      ₹{o.total_amount || o.subtotal}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
