import React, { useState, useEffect } from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, Coffee, AlertCircle, User, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { placeOrder, getActiveOrderForCustomer } from '../../services/orderService';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

export default function CartDrawer({ isOpen, onClose }) {
  const { cartItems, customerName, setCustomerName, activeOrderId, setActiveOrderId, updateQuantity, removeFromCart, clearCart, subtotal } = useCart();
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [existingOrder, setExistingOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const trimmed = (customerName || '').trim();
    if (isOpen && trimmed) {
      getActiveOrderForCustomer(activeOrderId, trimmed).then((ord) => {
        if (ord && ord.id) {
          setExistingOrder(ord);
          if (activeOrderId !== ord.id) {
            setActiveOrderId(ord.id);
          }
        } else {
          // If no active order exists for this exact customer name, it is a different customer!
          setExistingOrder(null);
          if (activeOrderId) {
            setActiveOrderId(null);
          }
        }
      });
    } else {
      setExistingOrder(null);
    }
  }, [isOpen, customerName]);

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
      const createdOrder = await placeOrder({
        activeOrderId: activeOrderId || null,
        cartItems,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        notes: orderNotes.trim()
      });

      // Save active order ID to customer's phone so additional items merge into same order ID!
      if (createdOrder && createdOrder.id) {
        setActiveOrderId(createdOrder.id);
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
                <span>ACTIVE SESSION FOR:</span>
              </span>
              <span className="bg-[#2C1A14] text-[#E5C170] px-3 py-0.5 rounded-full font-bold">
                {customerName}
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
                  Discover our freshly brewed coffee, food, beverages, shakes, and warm desserts.
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
              {/* Customer Name Input */}
              <div>
                <label className="block text-[11px] font-bold text-[#2C1A14] mb-1 flex items-center justify-between">
                  <span className="flex items-center space-x-1">
                    <User className="w-3.5 h-3.5 text-[#C8963E]" />
                    <span>YOUR NAME *</span>
                  </span>
                  {customerName && (
                    <span className="text-[10px] text-emerald-800 font-semibold">Active Session</span>
                  )}
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Your Name (Required)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-white text-xs px-3.5 py-2.5 rounded-xl border border-[#C8963E] text-[#2C1A14] font-semibold focus:outline-none focus:ring-2 focus:ring-[#C8963E] placeholder-stone-400"
                />
              </div>

              {/* Special Order Notes */}
              <div>
                <input
                  type="text"
                  placeholder="Special instructions for kitchen (Optional)"
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
                        <span>Previous Order Items ({existingItems.length})</span>
                        <span className="font-semibold text-[#2C1A14]">₹{existingTotal}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[#6D4C41]">
                      <span>New Items (This Round)</span>
                      <span className="font-semibold text-[#2C1A14]">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-[#6D4C41]">
                      <span>Payment Method</span>
                      <span className="font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                        Pay at Cashier Counter
                      </span>
                    </div>
                    <div className="flex justify-between text-[#2C1A14] font-serif font-bold text-base pt-1 border-t border-stone-200">
                      <span>{existingTotal > 0 ? 'Combined Total Bill' : 'Total Bill'}</span>
                      <span className="text-[#C8963E]">₹{grandTotal}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Place Order CTA */}
              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-[#2C1A14] text-[#E5C170] hover:bg-[#3E2723] font-bold text-sm flex items-center justify-center space-x-2 shadow-lg active:scale-98 disabled:opacity-50 transition-all"
              >
                {isSubmitting ? (
                  <span>Securing your order...</span>
                ) : (
                  <>
                    <span>{activeOrderId ? 'ADD TO MY EXISTING ORDER' : 'PLACE ORDER NOW'}</span>
                    <ArrowRight className="w-4 h-4" />
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
