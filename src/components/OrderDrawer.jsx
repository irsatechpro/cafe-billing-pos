import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag, CheckCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OrderDrawer({ isOpen, onClose, cartItems = [], onUpdateQuantity, onRemoveItem, onClearCart }) {
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderType, setOrderType] = useState('Dine-In');

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#C8963E', '#F5EFE6', '#B8860B']
    });

    setOrderSuccess(true);
    setTimeout(() => {
      setOrderSuccess(false);
      onClearCart();
      onClose();
    }, 2800);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-espresso-950/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-y-0 right-0 max-w-md w-full bg-parchment-50 border-l border-gold/30 shadow-2xl flex flex-col justify-between"
          >
            {/* Header */}
            <div className="p-6 border-b border-gold/20 flex items-center justify-between bg-parchment-100">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-gold-dark" />
                <h3 className="font-serif text-xl font-bold text-espresso-950">
                  YOUR CAFÉ ORDER
                </h3>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-parchment-50 text-espresso-950 hover:text-gold flex items-center justify-center border border-gold/20 shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Order Items List */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {orderSuccess ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 my-12">
                  <div className="w-16 h-16 rounded-full bg-gold/20 text-gold-dark flex items-center justify-center border border-gold">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <h4 className="font-serif text-2xl font-bold text-espresso-950">
                    ORDER CONFIRMED!
                  </h4>
                  <p className="text-xs text-espresso-600 font-sans max-w-xs">
                    Your fresh sips and delicious food are being prepared with care. Present your name upon arrival.
                  </p>
                </div>
              ) : cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-16 text-espresso-600">
                  <ShoppingBag className="w-12 h-12 text-gold/30" />
                  <p className="font-serif text-lg font-medium text-espresso-950">Your order is empty</p>
                  <p className="text-xs font-sans">Select crafted coffees, shakes, burgers, or desserts.</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={`${item.id}-${item.milk}`}
                    className="glass-card p-4 rounded-2xl border border-gold/20 flex items-center justify-between bg-parchment-100/70"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover border border-gold/20"
                    />

                    <div className="flex-1 px-4">
                      <h5 className="font-serif text-sm font-bold text-espresso-950">
                        {item.name}
                      </h5>
                      <span className="font-serif text-sm font-bold text-gold-dark mt-1 block">
                        ₹{(item.price * item.quantity)}
                      </span>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex flex-col items-end space-y-2">
                      <button
                        onClick={() => onRemoveItem(item)}
                        className="text-red-500/70 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="flex items-center space-x-2 bg-parchment-50 rounded-lg border border-gold/30 px-2 py-1">
                        <button
                          onClick={() => onUpdateQuantity(item, -1)}
                          className="text-espresso-950 hover:text-gold text-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-espresso-950 font-sans">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item, 1)}
                          className="text-espresso-950 hover:text-gold text-xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary & Checkout */}
            {!orderSuccess && cartItems.length > 0 && (
              <div className="p-6 border-t border-gold/20 space-y-4 bg-parchment-100">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setOrderType('Dine-In')}
                    className={`py-2 rounded-xl text-xs font-sans tracking-widest uppercase transition-all ${
                      orderType === 'Dine-In'
                        ? 'bg-gold text-parchment-50 font-bold'
                        : 'bg-parchment-50 text-espresso-900 border border-gold/20'
                    }`}
                  >
                    ☕ Dine-In Table
                  </button>
                  <button
                    onClick={() => setOrderType('Takeaway')}
                    className={`py-2 rounded-xl text-xs font-sans tracking-widest uppercase transition-all ${
                      orderType === 'Takeaway'
                        ? 'bg-gold text-parchment-50 font-bold'
                        : 'bg-parchment-50 text-espresso-900 border border-gold/20'
                    }`}
                  >
                    🛍 Express Takeaway
                  </button>
                </div>

                <div className="space-y-1.5 text-xs font-sans text-espresso-700">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (5%)</span>
                    <span>₹{tax.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between font-serif text-base font-bold text-espresso-950 pt-2 border-t border-gold/20">
                    <span>Total</span>
                    <span className="text-gold-dark">₹{total.toFixed(0)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-4 rounded-full bg-gold hover:bg-gold-dark text-parchment-50 font-bold text-xs uppercase tracking-widest flex items-center justify-center space-x-2 transition-all shadow-lg shine-effect"
                >
                  <Sparkles className="w-4 h-4 text-parchment-50" />
                  <span>PLACE ORDER — ₹{total.toFixed(0)}</span>
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
