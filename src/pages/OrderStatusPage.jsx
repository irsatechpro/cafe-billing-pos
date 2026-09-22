import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById } from '../services/orderService';
import { useCart } from '../context/CartContext';
import { CheckCircle2, Clock, Coffee, ArrowLeft, RefreshCw, Sparkles, Utensils } from 'lucide-react';
import { supabase, isLiveSupabaseConfigured, localStore } from '../lib/supabase';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export default function OrderStatusPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { setActiveOrderId, clearCustomerSession } = useCart();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
    try {
      const data = await getOrderById(orderId);
      if (data) {
        setOrder(data);
        if (data.status === 'COMPLETED') {
          // Bill has been paid at cashier! Automatically wipe session so menu is fresh
          clearCustomerSession();
        }
      }
    } catch (err) {
      console.error('Error fetching order status:', err);
    } finally {
      setLoading(false);
    }
  }, [orderId, clearCustomerSession]);

  useEffect(() => {
    fetchOrder();

    if (isLiveSupabaseConfigured && supabase) {
      // Subscribe to both orders and order_items updates for live item list & total sync!
      const channel = supabase
        .channel(`order-live-sync-${orderId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
          () => fetchOrder()
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'order_items', filter: `order_id=eq.${orderId}` },
          () => fetchOrder()
        )
        .subscribe();

      return () => supabase.removeChannel(channel);
    } else {
      const unsub = localStore.subscribe((event) => {
        if (event === 'orders_updated') {
          fetchOrder();
        }
      });
      return unsub;
    }
  }, [orderId, fetchOrder]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center text-[#2C1A14] p-4">
        <LoadingSpinner message="Loading order status..." />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center text-[#2C1A14] p-6 text-center">
        <h2 className="font-serif font-bold text-xl text-rose-800 mb-2">Order Not Found</h2>
        <p className="text-xs text-[#6D4C41] mb-4">We could not locate this order.</p>
        <button
          onClick={() => navigate('/menu')}
          className="px-6 py-2.5 rounded-xl bg-[#2C1A14] text-[#E5C170] font-semibold text-xs"
        >
          Return to Trio Bean Menu
        </button>
      </div>
    );
  }

  const itemsList = order.order_items || order.items || [];
  // Calculate dynamic total directly from items array
  const dynamicTotal = itemsList.reduce((sum, item) => sum + Number(item.subtotal || (item.unit_price * item.quantity)), 0);
  const displayTotal = dynamicTotal > 0 ? dynamicTotal : Number(order.total_amount || order.subtotal || 0);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C1A14] pb-16">
      {/* Top Bar */}
      <div className="bg-[#2C1A14] text-[#FDFBF7] px-4 sm:px-6 py-4 sticky top-0 z-20 shadow-md">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/menu')}
            className="p-1.5 rounded-full bg-white/10 text-stone-200 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h1 className="font-serif font-bold text-lg text-[#E5C170] tracking-wide">
              TRIO BEAN CAFÉ
            </h1>
            <span className="text-[10px] text-stone-300 uppercase tracking-widest font-mono">
              Order Confirmation
            </span>
          </div>
          <button
            onClick={fetchOrder}
            className="p-1.5 rounded-full bg-white/10 text-stone-200 hover:text-white"
            title="Refresh Order"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 sm:px-6 pt-6 space-y-5 text-center">
        {/* Success Icon Badge */}
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-md border-4 border-white">
          <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
        </div>

        {/* Big Confirmation Header */}
        <div>
          <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider font-mono">
            ORDER PLACED SUCCESSFULLY
          </span>
          <h2 className="font-serif font-extrabold text-3xl text-[#2C1A14] mt-2 leading-tight">
            Order #{order.order_number || order.id.slice(0, 6)}
          </h2>
          <p className="text-sm font-semibold text-[#C8963E] mt-1">
            Customer: {order.customer_name || 'Guest'}
          </p>
        </div>

        {/* Served Soon Message Card */}
        <div className="bg-white p-6 rounded-3xl border border-[#EFE6D8] shadow-sm space-y-3 text-center">
          <div className="w-12 h-12 rounded-full bg-[#FAF6F0] text-[#2C1A14] flex items-center justify-center mx-auto">
            <Utensils className="w-6 h-6 text-[#C8963E]" />
          </div>
          
          <h3 className="font-serif font-bold text-lg text-[#2C1A14]">
            Your Food Will Be Served Soon!
          </h3>
          
          <p className="text-xs text-[#6D4C41] leading-relaxed max-w-xs mx-auto">
            Your order has been sent to the Trio Bean kitchen team. We are preparing your fresh food & beverages right now.
          </p>

          <div className="pt-3 border-t border-[#EFE6D8] flex items-center justify-center space-x-2 text-xs text-stone-500 font-mono">
            <Clock className="w-3.5 h-3.5 text-[#C8963E]" />
            <span>Order Placed: {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* Order Items Breakdown */}
        <div className="bg-white p-5 rounded-3xl border border-[#EFE6D8] shadow-sm text-left">
          <h4 className="font-serif font-bold text-sm text-[#2C1A14] mb-3 pb-2 border-b border-[#EFE6D8] flex items-center justify-between">
            <span>Ordered Items ({itemsList.length})</span>
            <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-mono font-bold">Live Synced</span>
          </h4>

          <div className="space-y-2 font-sans">
            {itemsList.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs py-1 border-b border-stone-100/70 last:border-0">
                <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                  <span className="font-mono text-[11px] font-bold text-stone-600 bg-[#FAF6F0] px-1.5 py-0.5 rounded border border-[#EFE6D8] shrink-0">
                    ₹{item.unit_price}
                  </span>
                  <div className="truncate flex-1">
                    <span className="font-bold text-[#2C1A14]">
                      {item.quantity} × {item.item_name}
                    </span>
                    {item.notes && (
                      <p className="text-[10px] text-[#C8963E] italic truncate">{item.notes}</p>
                    )}
                  </div>
                </div>
                <span className="font-mono font-extrabold text-[#2C1A14] shrink-0 pl-2">
                  ₹{item.subtotal || item.unit_price * item.quantity}
                </span>
              </div>
            ))}

            <div className="pt-3 border-t border-[#EFE6D8] flex justify-between font-serif font-extrabold text-lg text-[#2C1A14]">
              <span>Total Bill</span>
              <span className="text-[#C8963E]">₹{displayTotal}</span>
            </div>
          </div>
        </div>

        {/* Cashier Payment Instruction or Paid Confirmation */}
        {order.status === 'COMPLETED' ? (
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-300 space-y-1 text-center">
            <div className="flex items-center justify-center space-x-1.5 text-xs font-bold text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>BILL PAID & COMPLETED!</span>
            </div>
            <p className="text-[11px] text-emerald-800">
              Payment of <strong>₹{displayTotal}</strong> received for Order <strong>#{order.order_number}</strong>. Thank you for visiting Trio Bean Café!
            </p>
          </div>
        ) : (
          <div className="bg-[#FAF6F0] p-4 rounded-2xl border border-[#C8963E]/40 space-y-1 text-center">
            <div className="flex items-center justify-center space-x-1.5 text-xs font-bold text-[#2C1A14]">
              <Sparkles className="w-4 h-4 text-[#C8963E]" />
              <span>PAYMENT AT CASHIER COUNTER</span>
            </div>
            <p className="text-[11px] text-[#6D4C41]">
              Please present Order <strong>#{order.order_number}</strong> for <strong>{order.customer_name}</strong> at the Trio Bean cashier counter to complete your Cash / UPI / Card payment of <strong>₹{displayTotal}</strong>.
            </p>
          </div>
        )}

        {/* Action Button */}
        {order.status === 'COMPLETED' ? (
          <button
            onClick={() => {
              clearCustomerSession();
              navigate('/menu');
            }}
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all"
          >
            START A NEW ORDER FOR MY NEXT VISIT
          </button>
        ) : (
          <button
            onClick={() => navigate('/menu')}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#2C1A14] text-[#E5C170] hover:bg-[#3E2723] font-bold text-xs shadow-md transition-all"
          >
            ORDER MORE ITEMS
          </button>
        )}
      </div>
    </div>
  );
}
