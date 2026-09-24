import React, { useState } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import PaymentModal from '../../components/admin/PaymentModal';
import { useRealtimeOrders } from '../../hooks/useRealtimeOrders';
import { updateOrderStatus, deleteAllOrders, deleteOrder } from '../../services/orderService';
import { Bell, Check, Clock, Utensils, AlertCircle, RefreshCw, ChevronRight, DollarSign, User, Sparkles, Trash2, CheckCircle2 } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export default function CafeDashboard() {
  const { orders, loading, refetch, hasNewOrderAlert, clearNewOrderAlert } = useRealtimeOrders();
  const [activeTab, setActiveTab] = useState('ACTIVE');
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  // Line item serving status tracker
  const [servedItemsMap, setServedItemsMap] = useState(() => {
    try {
      const saved = localStorage.getItem('trio_bean_served_items_map');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleItemServed = (orderId, itemIdx) => {
    setServedItemsMap(prev => {
      const currentOrderServed = prev[orderId] || {};
      const updatedOrderServed = {
        ...currentOrderServed,
        [itemIdx]: !currentOrderServed[itemIdx]
      };
      const nextMap = { ...prev, [orderId]: updatedOrderServed };
      try {
        localStorage.setItem('trio_bean_served_items_map', JSON.stringify(nextMap));
      } catch (e) {}
      return nextMap;
    });
  };

  const markAllItemsServed = (orderId, itemsCount) => {
    setServedItemsMap(prev => {
      const updatedOrderServed = {};
      for (let i = 0; i < itemsCount; i++) {
        updatedOrderServed[i] = true;
      }
      const nextMap = { ...prev, [orderId]: updatedOrderServed };
      try {
        localStorage.setItem('trio_bean_served_items_map', JSON.stringify(nextMap));
      } catch (e) {}
      return nextMap;
    });
  };

  const handleStatusChange = async (orderId, nextStatus, totalItemsCount = 0) => {
    setActionLoadingId(orderId);
    try {
      if (nextStatus === 'SERVED' && totalItemsCount > 0) {
        markAllItemsServed(orderId, totalItemsCount);
      }
      await updateOrderStatus(orderId, nextStatus);
      refetch();
    } catch (err) {
      console.error('Failed to change status:', err);
      alert(err.message || 'Status update failed.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteSingle = async (orderId, orderNum) => {
    if (!window.confirm(`Are you sure you want to delete Order #${orderNum || orderId.slice(0, 6)}?`)) return;
    setActionLoadingId(orderId);
    try {
      await deleteOrder(orderId);
      refetch();
    } catch (err) {
      console.error('Failed to delete order:', err);
      alert(err.message || 'Failed to delete order.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('⚠️ ARE YOU SURE YOU WANT TO DELETE ALL ORDERS?\n\nThis will permanently wipe all active and historical orders for fresh testing!')) return;
    setIsDeletingAll(true);
    try {
      await deleteAllOrders();
      refetch();
      alert('All orders deleted successfully! System is fresh for new testing.');
    } catch (err) {
      console.error('Failed to delete all orders:', err);
      alert(err.message || 'Failed to delete all orders.');
    } finally {
      setIsDeletingAll(false);
    }
  };

  // Status Filter logic
  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'ACTIVE') return o.status !== 'COMPLETED' && o.status !== 'CANCELLED';
    if (activeTab === 'COMPLETED') return o.status === 'COMPLETED';
    return o.status !== 'CANCELLED';
  });

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#FAF6F0] text-[#2C1A14]">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-24 lg:pb-0">
        {/* Top Header Bar */}
        <header className="bg-white px-4 sm:px-6 lg:px-8 py-3.5 sm:py-5 border-b border-[#EFE6D8] sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div>
            <span className="text-[10px] font-bold text-[#C8963E] uppercase tracking-widest font-mono">
              REALTIME KITCHEN & CAFE DESK
            </span>
            <h1 className="font-serif font-bold text-xl sm:text-2xl text-[#2C1A14]">
              Cafe Live Order Management
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {hasNewOrderAlert && (
              <button
                onClick={clearNewOrderAlert}
                className="flex items-center space-x-2 bg-rose-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold animate-bounce shadow-md"
              >
                <Bell className="w-4 h-4" />
                <span>NEW ORDER!</span>
              </button>
            )}

            <button
              onClick={handleDeleteAll}
              disabled={isDeletingAll}
              className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-xs"
              title="Delete all active & completed orders"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isDeletingAll ? 'DELETING...' : 'DELETE ALL ORDERS'}</span>
            </button>

            <button
              onClick={refetch}
              className="p-2 sm:p-2.5 rounded-xl bg-[#F5EFE6] text-[#2C1A14] hover:bg-[#EFE6D8] transition-colors"
              title="Refresh Orders"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Tab Filter Navigation */}
        <div className="bg-[#FDFBF7] px-4 sm:px-6 lg:px-8 py-3 border-b border-[#EFE6D8] flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex space-x-2">
            {[
              { id: 'ACTIVE', label: 'Active Orders' },
              { id: 'COMPLETED', label: 'Completed' },
              { id: 'ALL', label: 'All Orders' }
            ].map((tab) => {
              const count = orders.filter(o => {
                if (tab.id === 'ACTIVE') return o.status !== 'COMPLETED' && o.status !== 'CANCELLED';
                if (tab.id === 'COMPLETED') return o.status === 'COMPLETED';
                return o.status !== 'CANCELLED';
              }).length;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-[#2C1A14] text-[#E5C170] shadow-md'
                      : 'bg-white text-[#6D4C41] border border-[#EFE6D8] hover:bg-[#F5EFE6]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                    activeTab === tab.id ? 'bg-[#C8963E] text-[#2C1A14]' : 'bg-[#F5EFE6] text-[#6D4C41]'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Orders Grid */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1">
          {loading ? (
            <div className="py-20 flex items-center justify-center">
              <LoadingSpinner message="Syncing live orders with Supabase..." />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-[#EFE6D8] text-center max-w-md mx-auto my-12 shadow-xs">
              <Utensils className="w-12 h-12 text-[#C8963E]/40 mx-auto mb-3" />
              <h3 className="font-serif font-bold text-lg text-[#2C1A14]">No orders in this view</h3>
              <p className="text-xs text-[#6D4C41] mt-1">
                All customer orders matching this category have been handled.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOrders.map((order) => {
                const customerName = order.customer_name || 'Guest';
                const itemsList = order.order_items || order.items || [];
                const isLoading = actionLoadingId === order.id;

                const dynamicTotal = itemsList.reduce((sum, item) => sum + Number(item.subtotal || (item.unit_price * item.quantity)), 0);
                const cardTotal = dynamicTotal > 0 ? dynamicTotal : Number(order.total_amount || order.subtotal || 0);

                // Count multi-rounds for this customer
                const customerOrderCount = orders.filter(o => 
                  (o.customer_name || 'Guest').trim().toLowerCase() === customerName.trim().toLowerCase() &&
                  o.status !== 'CANCELLED'
                ).length;

                // Item serving status calculation
                const orderServedObj = servedItemsMap[order.id] || {};
                const totalItemsCount = itemsList.length;
                const servedCount = itemsList.filter((_, idx) => Boolean(orderServedObj[idx])).length;
                const isAllServed = totalItemsCount > 0 && servedCount === totalItemsCount;
                const pendingItems = itemsList.filter((_, idx) => !orderServedObj[idx]);

                return (
                  <div
                    key={order.id}
                    className={`bg-white rounded-3xl border overflow-hidden shadow-sm flex flex-col justify-between transition-all ${
                      order.status === 'NEW'
                        ? 'border-rose-300 ring-2 ring-rose-500/20'
                        : order.status === 'READY'
                        ? 'border-emerald-300 ring-2 ring-emerald-500/20'
                        : 'border-[#EFE6D8]'
                    }`}
                  >
                    {/* Order Top Bar */}
                    <div>
                      <div className="p-4 bg-[#FAF6F0] border-b border-[#EFE6D8] flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-bold text-[#6D4C41] uppercase tracking-wider block">
                              ORDER #{order.order_number || order.id.slice(0, 6)}
                            </span>
                            {order.updated_at && order.created_at && order.updated_at !== order.created_at && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-200 text-amber-900 border border-amber-300 uppercase">
                                ⚡ MORE ITEMS ADDED
                              </span>
                            )}
                          </div>
                          <span className="font-serif font-extrabold text-xl text-[#2C1A14] flex items-center space-x-1.5 mt-0.5">
                            <User className="w-4 h-4 text-[#C8963E]" />
                            <span>{customerName}</span>
                          </span>
                        </div>

                        {/* Status Badge & Delete Icon */}
                        <div className="flex items-center space-x-2">
                          <div className="flex flex-col items-end space-y-1">
                            <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                              order.status === 'NEW'
                                ? 'bg-rose-600 text-white animate-pulse'
                                : order.status === 'ACCEPTED'
                                ? 'bg-blue-600 text-white'
                                : order.status === 'PREPARING'
                                ? 'bg-amber-600 text-white'
                                : order.status === 'READY'
                                ? 'bg-emerald-600 text-white'
                                : order.status === 'SERVED'
                                ? 'bg-purple-600 text-white'
                                : 'bg-stone-700 text-white'
                            }`}>
                              {order.status}
                            </span>
                          </div>

                          {/* Delete Order Button */}
                          <button
                            onClick={() => handleDeleteSingle(order.id, order.order_number)}
                            disabled={isLoading}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete this order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Items List & Serving Progress Tracker */}
                      <div className="p-4 space-y-3">
                        <div className="text-xs text-[#6D4C41] flex items-center justify-between pb-2 border-b border-stone-100">
                          <div className="flex items-center space-x-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#C8963E]" />
                            <span>{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <span className="font-mono text-[10px] font-bold text-stone-500">
                            {totalItemsCount} Total Items
                          </span>
                        </div>

                        {/* Serving Progress Bar & Balance Card */}
                        <div className="bg-[#FAF6F0] p-3 rounded-2xl border border-[#EFE6D8] space-y-2">
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-[#6D4C41] flex items-center space-x-1.5">
                              <CheckCircle2 className={`w-4 h-4 ${isAllServed ? 'text-emerald-600' : 'text-[#C8963E]'}`} />
                              <span>SERVED: {servedCount} / {totalItemsCount} ITEMS</span>
                            </span>
                            <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-extrabold ${
                              isAllServed ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}>
                              {isAllServed ? '✓ 100% ALL SERVED' : `${totalItemsCount - servedCount} PENDING`}
                            </span>
                          </div>

                          {/* Visual Progress Bar */}
                          <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 ${isAllServed ? 'bg-emerald-600' : 'bg-[#C8963E]'}`} 
                              style={{ width: `${totalItemsCount > 0 ? (servedCount / totalItemsCount) * 100 : 0}%` }}
                            />
                          </div>

                          {/* Balance items text */}
                          {!isAllServed && pendingItems.length > 0 ? (
                            <p className="text-[11px] text-amber-900 font-semibold truncate pt-0.5">
                              ⏳ <strong>Balance to serve:</strong> {pendingItems.map(i => `${i.quantity}× ${i.item_name}`).join(', ')}
                            </p>
                          ) : isAllServed && (
                            <p className="text-[11px] text-emerald-800 font-bold flex items-center space-x-1 pt-0.5">
                              <span>✓ All food & beverages delivered to customer!</span>
                            </p>
                          )}

                          {/* Quick Mark All Served Button */}
                          {!isAllServed && (
                            <button
                              type="button"
                              onClick={() => markAllItemsServed(order.id, totalItemsCount)}
                              className="w-full py-1 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-extrabold flex items-center justify-center space-x-1 transition-all"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>SERVE ALL ITEMS (ONE CLICK)</span>
                            </button>
                          )}
                        </div>

                        {/* Interactive Item-by-Item Checkboxes */}
                        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                          {itemsList.map((item, idx) => {
                            const isItemServed = Boolean(orderServedObj[idx]);
                            return (
                              <div
                                key={idx}
                                onClick={() => toggleItemServed(order.id, idx)}
                                className={`flex justify-between items-center text-xs p-2 rounded-xl border transition-all cursor-pointer select-none ${
                                  isItemServed
                                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                                    : 'bg-white border-stone-200 hover:border-amber-400 text-[#2C1A14]'
                                }`}
                              >
                                <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                                  {/* Checkbox button */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleItemServed(order.id, idx);
                                    }}
                                    className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                      isItemServed
                                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                                        : 'border-2 border-stone-300 hover:border-[#C8963E] bg-stone-50'
                                    }`}
                                  >
                                    {isItemServed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                  </button>

                                  <span className="font-mono text-[10px] font-bold text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200/80 shrink-0">
                                    ₹{item.unit_price}
                                  </span>

                                  <div className="truncate flex-1">
                                    <span className={`font-bold ${isItemServed ? 'line-through text-emerald-900/70' : 'text-[#2C1A14]'}`}>
                                      {item.quantity} × {item.item_name}
                                    </span>
                                    {item.notes && (
                                      <p className="text-[10px] text-[#C8963E] font-medium truncate">
                                        "{item.notes}"
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2 shrink-0 pl-2">
                                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-extrabold uppercase ${
                                    isItemServed ? 'bg-emerald-200/80 text-emerald-900' : 'bg-amber-50 text-amber-800 border border-amber-200'
                                  }`}>
                                    {isItemServed ? 'SERVED ✓' : 'PENDING'}
                                  </span>
                                  <span className="font-mono font-extrabold text-[#2C1A14]">
                                    ₹{item.subtotal || item.unit_price * item.quantity}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {order.notes && (
                          <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 font-medium">
                            Chef Note: "{order.notes}"
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Action Footer */}
                    <div className="p-4 bg-[#FAF6F0] border-t border-[#EFE6D8] space-y-2">
                      <div className="flex justify-between items-center text-xs font-serif font-bold mb-1">
                        <span>Total Bill</span>
                        <span className="text-base text-[#C8963E]">₹{cardTotal}</span>
                      </div>

                      {/* Streamlined Workflow: Direct Settle / Bill Button */}
                      {order.status !== 'COMPLETED' ? (
                        <button
                          onClick={() => setSelectedOrderForPayment(order)}
                          className="w-full py-3 px-4 rounded-2xl bg-[#2C1A14] text-[#E5C170] hover:bg-[#3E2723] font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md active:scale-98"
                        >
                          <DollarSign className="w-4 h-4 text-[#C8963E]" />
                          <span>BILL & ACCEPT PAYMENT • ₹{cardTotal}</span>
                        </button>
                      ) : (
                        <div className="py-2 text-center text-xs font-bold text-emerald-800 bg-emerald-100 rounded-xl">
                          ✓ PAID & COMPLETED
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Payment Confirmation Modal */}
      {selectedOrderForPayment && (
        <PaymentModal
          order={selectedOrderForPayment}
          allOrders={orders}
          onClose={() => setSelectedOrderForPayment(null)}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  );
}
