import React, { useState, useEffect } from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, Coffee, AlertCircle, User, Sparkles, Utensils } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { placeOrder, getActiveOrderForCustomer } from '../../services/orderService';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

export default function CartDrawer({ isOpen, onClose }) {
  const { cartItems, customerName, setCustomerName, activeOrderId, setActiveOrderId, updateQuantity, removeFromCart, clearCart, subtotal } = useCart();
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [tableNumber, setTableNumber] = useState(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('table') || localStorage.getItem('trio_bean_selected_table') || '1';
    } catch {
      return '1';
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [existingOrder, setExistingOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tbl = urlParams.get('table');
    if (tbl) {
      setTableNumber(tbl);
      try {
        localStorage.setItem('trio_bean_selected_table', tbl);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const trimmed = (customerName || '').trim();
    const storedId = activeOrderId || localStorage.getItem('trio_bean_active_order_id');

    getActiveOrderForCustomer(storedId, trimmed).then((ord) => {
      if (ord && ord.id) {
        setExistingOrder(ord);
        if (activeOrderId !== ord.id) {
          setActiveOrderId(ord.id);
        }
        // Auto-extract customer name and table if not already set
        if (ord.customer_name) {
          const match = ord.customer_name.match(/^(.*?)(?:\s*\[Table\s*([^\]]+)\])?$/i);
          if (match) {
            const parsedName = match[1].trim();
            const parsedTable = match[2]?.trim();
            if (parsedName && !customerName) {
              setCustomerName(parsedName);
            }
            if (parsedTable) {
              setTableNumber(parsedTable);
            }
          }
        }
      } else {
        setExistingOrder(null);
      }
    }).catch((err) => {
      console.warn('getActiveOrderForCustomer check notice:', err);
    });
  }, [isOpen, customerName, activeOrderId, setActiveOrderId, setCustomerName]);

  if (!isOpen) return null;

  const handlePlaceOrder = async () => {
    setErrorMessage('');
    if (cartItems.length === 0) return;

    if (!customerName.trim()) {
      setErrorMessage('Please enter Your Name before placing the order.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Save selected table
      try {
        localStorage.setItem('trio_bean_selected_table', tableNumber);
      } catch {}

      const fullCustomerName = `${customerName.trim()} [Table ${tableNumber}]`;
      const targetOrderId = existingOrder?.id || activeOrderId || localStorage.getItem('trio_bean_active_order_id') || null;

      const createdOrder = await placeOrder({
        activeOrderId: targetOrderId,
        cartItems,
        customerName: fullCustomerName,
        customerPhone: customerPhone.trim(),
        notes: orderNotes.trim()
      });

      if (createdOrder && createdOrder.id) {
        setActiveOrderId(createdOrder.id);
        try {
          localStorage.setItem('trio_bean_active_order_id', createdOrder.id);
        } catch {}
      }

      // Fire celebratory confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.7 }
        });
      } catch (e) {}

      clearCart();
      onClose();

      // Navigate to live order tracking screen
      navigate(`/order/${createdOrder.id}`);
    } catch (err) {
      console.error('Order creation error:', err);
      setErrorMessage(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-[#FDFBF7] shadow-2xl flex flex-col border-l border-[#EFE6D8] h-[100dvh]">
          {/* Header */}
          <div className="p-4 bg-[#2C1A14] text-[#FDFBF7] flex items-center justify-between border-b border-[#C8963E]/30">
            <div className="flex items-center space-x-2">
              <Coffee className="w-5 h-5 text-[#E5C170]" />
              <h2 className="font-serif font-bold text-lg text-[#FDFBF7] tracking-wide">
                YOUR ORDER SUMMARY
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Customer Badge Bar */}
          {customerName && (
            <div className="bg-[#FAF6F0] px-4 py-2 border-b border-[#EFE6D8] flex items-center justify-between text-xs">
              <span className="font-semibold text-[#6D4C41] flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-[#C8963E]" />
                <span>ORDERING FOR:</span>
              </span>
              <span className="bg-[#2C1A14] text-[#E5C170] px-3 py-0.5 rounded-full font-bold">
                {customerName} • Table {tableNumber}
              </span>
            </div>
          )}

          {/* Active Order Notice */}
          {existingOrder && (
            <div className="bg-amber-50 border-b border-amber-200/90 px-4 py-2.5 flex items-center justify-between text-xs text-amber-950">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                <span className="font-bold text-[#2C1A14]">
                  Adding to Order #{existingOrder.order_number || existingOrder.id.slice(0, 6)}
                </span>
              </div>
              <span className="bg-[#2C1A14] text-[#E5C170] font-mono text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                Active Order
              </span>
            </div>
          )}

          {/* Error Alert */}
          {errorMessage && (
            <div className="m-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#6D4C41]">
                <Coffee className="w-16 h-16 mb-3 text-[#C8963E]/40" />
                <p className="font-serif font-semibold text-lg text-[#2C1A14]">Your cart is empty</p>
                <p className="text-xs text-[#6D4C41]/80 mt-1 max-w-xs">
                  Discover our freshly brewed coffee, sandwiches, burgers, shakes, and desserts.
                </p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.itemKey}
                  className="bg-white p-3 rounded-2xl border border-[#EFE6D8] shadow-xs flex items-center gap-3"
                >
                  {/* Thumbnail */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#F5EFE6] shrink-0">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold text-xs text-[#2C1A14] truncate">
                        {item.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.itemKey)}
                        className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                      <p className="text-[10px] text-[#C8963E] font-medium truncate mt-0.5">
                        + {item.selectedAddOns.join(', ')}
                      </p>
                    )}

                    {item.notes && (
                      <p className="text-[10px] text-stone-500 italic truncate">
                        "{item.notes}"
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      <span className="font-serif font-bold text-sm text-[#2C1A14]">
                        ₹{item.price * item.quantity}
                      </span>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2 bg-[#F5EFE6] rounded-lg px-2 py-0.5">
                        <button
                          onClick={() => updateQuantity(item.itemKey, -1)}
                          className="text-[#2C1A14] hover:text-[#C8963E] p-0.5"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold text-xs text-[#2C1A14] min-w-[14px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.itemKey, 1)}
                          className="text-[#2C1A14] hover:text-[#C8963E] p-0.5"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout */}
          {cartItems.length > 0 && (
            <div className="p-4 bg-[#FAF6F0] border-t border-[#EFE6D8] space-y-3 shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
              {/* Table & Name Row */}
              <div className="grid grid-cols-3 gap-2">
                {/* Table Number Selector */}
                <div className="col-span-1">
                  <label className="block text-[11px] font-bold text-[#2C1A14] mb-1 flex items-center space-x-1">
                    <Utensils className="w-3.5 h-3.5 text-[#C8963E]" />
                    <span>TABLE *</span>
                  </label>
                  <select
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="w-full bg-white text-xs px-2.5 py-2.5 rounded-xl border border-[#C8963E] text-[#2C1A14] font-bold focus:outline-none focus:ring-2 focus:ring-[#C8963E]"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20].map((num) => (
                      <option key={num} value={String(num)}>
                        Table {num}
                      </option>
                    ))}
                    <option value="Takeaway">Takeaway</option>
                  </select>
                </div>

                {/* Customer Name Input */}
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-[#2C1A14] mb-1 flex items-center justify-between">
                    <span className="flex items-center space-x-1">
                      <User className="w-3.5 h-3.5 text-[#C8963E]" />
                      <span>YOUR NAME *</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter Your Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-white text-xs px-3.5 py-2.5 rounded-xl border border-[#C8963E] text-[#2C1A14] font-semibold focus:outline-none focus:ring-2 focus:ring-[#C8963E] placeholder-stone-400"
                  />
                </div>
              </div>

              {/* Special Order Notes */}
              <div>
                <input
                  type="text"
                  placeholder="Special cooking notes (e.g. less sugar, extra hot)"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full bg-white text-xs px-3 py-2 rounded-xl border border-[#EFE6D8] text-[#2C1A14] focus:outline-none focus:ring-1 focus:ring-[#C8963E]"
                />
              </div>

              {/* Price Calculation */}
              {(() => {
                const existingItems = existingOrder ? (existingOrder.order_items || existingOrder.items || []) : [];
                const existingTotal = existingItems.reduce((sum, i) => sum + Number(i.subtotal || (i.unit_price * i.quantity)), 0);
                const grandTotal = existingTotal + subtotal;

                return (
                  <div className="space-y-1.5 pt-2 border-t border-[#EFE6D8] text-xs">
                    {existingTotal > 0 && (
                      <div className="flex justify-between text-[#6D4C41]">
                        <span>Previous Items ({existingItems.length})</span>
                        <span className="font-semibold text-[#2C1A14]">₹{existingTotal}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[#6D4C41]">
                      <span>New Items</span>
                      <span className="font-semibold text-[#2C1A14]">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-[#6D4C41]">
                      <span>Payment</span>
                      <span className="font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                        Pay at Counter After Meal
                      </span>
                    </div>
                    <div className="flex justify-between text-[#2C1A14] font-serif font-bold text-base pt-1 border-t border-stone-200">
                      <span>{existingTotal > 0 ? 'Combined Total Bill' : 'Total Bill'}</span>
                      <span className="text-[#C8963E]">₹{grandTotal}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#2C1A14] to-[#3E2723] hover:from-[#1F120C] hover:to-[#2C1A14] active:scale-[0.99] text-[#FDFBF7] font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-md shadow-[#2C1A14]/20 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Sending order to kitchen...</span>
                ) : (
                  <>
                    <span className="uppercase tracking-wider">
                      {existingOrder
                        ? `➕ Add to Order #${existingOrder.order_number || existingOrder.id.slice(0, 6)}`
                        : `Send Order to Kitchen (Table ${tableNumber})`}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#C8963E]" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
