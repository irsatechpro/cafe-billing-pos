import React, { useState } from 'react';
import { X, CheckCircle, CreditCard, Banknote, QrCode as QrIcon, AlertCircle } from 'lucide-react';
import { recordPayment } from '../../services/paymentService';

export default function PaymentModal({ order, onClose, onSuccess }) {
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [transactionRef, setTransactionRef] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!order) return null;

  const customerName = order.customer_name || 'Guest';

  // Helper to calculate total for this specific order
  const items = order.order_items || order.items || [];
  const calculatedTotal = items.reduce((s, i) => s + Number(i.subtotal || (i.unit_price * i.quantity)), 0);
  const orderTotal = calculatedTotal > 0 ? calculatedTotal : Number(order.total_amount || order.subtotal || 0);

  const [cashReceived, setCashReceived] = useState(orderTotal);

  React.useEffect(() => {
    setCashReceived(orderTotal);
  }, [orderTotal]);

  const changeDue = Math.max(0, Number(cashReceived) - orderTotal);

  const handleConfirmPayment = async () => {
    setErrorMsg('');
    if (paymentMethod === 'CASH' && Number(cashReceived) < orderTotal) {
      setErrorMsg(`Cash received (₹${cashReceived}) is less than total bill (₹${orderTotal}).`);
      return;
    }

    setIsSubmitting(true);
    try {
      await recordPayment({
        orderId: order.id,
        orderIds: [order.id],
        paymentMethod,
        amount: orderTotal,
        transactionRef: transactionRef.trim() || `REF-${Date.now().toString(36).toUpperCase()}`
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Payment confirmation error:', err);
      setErrorMsg(err.message || 'Failed to record payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full max-w-md bg-[#FDFBF7] rounded-3xl overflow-hidden shadow-2xl border border-[#EFE6D8] animate-slide-up flex flex-col max-h-[90dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-[#2C1A14] text-[#FDFBF7] flex items-center justify-between border-b border-[#C8963E]/30">
          <div>
            <span className="text-[10px] text-[#E5C170] font-mono tracking-widest uppercase font-semibold block">
              ORDER #{order.order_number || order.id?.slice(0, 6)} BILLING
            </span>
            <h3 className="font-serif font-bold text-lg text-white">
              Customer: {customerName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-300 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Itemized Bill Breakdown for this single order */}
          <div className="bg-white p-4 rounded-2xl border border-[#EFE6D8] space-y-3 text-xs">
            <span className="font-extrabold text-[10px] text-[#6D4C41] uppercase tracking-wider block border-b border-[#EFE6D8] pb-1">
              Order Items (Order #{order.order_number})
            </span>

            <div className="space-y-1.5">
              {items.map((item, itemIdx) => (
                <div key={itemIdx} className="flex justify-between items-center text-[11px] text-[#6D4C41] py-1 border-b border-stone-100 last:border-0">
                  <div className="flex items-center space-x-2 truncate min-w-0">
                    <span className="font-mono text-[10px] text-stone-500 bg-stone-50 px-1.5 py-0.5 rounded border border-stone-200 shrink-0">
                      ₹{item.unit_price}
                    </span>
                    <span className="font-bold text-[#2C1A14] truncate">{item.quantity} × {item.item_name}</span>
                  </div>
                  <span className="font-mono font-extrabold text-[#2C1A14] shrink-0 pl-2">
                    ₹{item.subtotal || item.unit_price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Total Sum for this specific order */}
            <div className="pt-3 border-t-2 border-[#2C1A14] flex justify-between font-serif font-extrabold text-lg text-[#2C1A14]">
              <span>TOTAL BILL</span>
              <span className="text-[#C8963E]">₹{orderTotal}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-extrabold text-[#2C1A14] uppercase tracking-wider mb-2">
              Select Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'CASH', label: 'CASH PAYMENT', icon: Banknote },
                { id: 'UPI', label: 'UPI / QR CODE', icon: QrIcon }
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center space-y-1 font-bold text-xs transition-all ${
                      isSelected
                        ? 'bg-[#2C1A14] text-[#E5C170] border-[#C8963E] shadow-md ring-2 ring-[#C8963E]/30'
                        : 'bg-white text-[#5D4037] border-[#EFE6D8] hover:border-[#C8963E]/40'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cash Calculator Mode */}
          {paymentMethod === 'CASH' && (
            <div className="bg-[#FAF6F0] p-4 rounded-2xl border border-[#EFE6D8] space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-[#6D4C41] mb-1">
                  Cash Received from Customer (₹)
                </label>
                <input
                  type="number"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  className="w-full bg-white text-base font-bold font-mono px-3.5 py-2 rounded-xl border border-[#C8963E] text-[#2C1A14] focus:outline-none focus:ring-2 focus:ring-[#C8963E]"
                />
              </div>

              <div className="flex justify-between items-center text-xs pt-1 border-t border-[#EFE6D8]">
                <span className="font-semibold text-[#6D4C41]">Change Return:</span>
                <span className={`font-mono font-extrabold text-sm ${changeDue > 0 ? 'text-emerald-700' : 'text-[#2C1A14]'}`}>
                  ₹{changeDue}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Sticky Footer */}
        <div className="p-4 bg-[#FAF6F0] border-t border-[#EFE6D8] pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            onClick={handleConfirmPayment}
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-700 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-lg hover:bg-emerald-800 transition-all active:scale-98 disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{isSubmitting ? 'Recording Payment...' : `CONFIRM PAYMENT OF ₹${orderTotal}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
