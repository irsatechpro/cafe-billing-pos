import React, { useState } from 'react';
import { X, Plus, Minus, Check, Coffee } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const DEFAULT_ADDONS = [
  { id: 'add-1', name: 'Ice Cream', price: 20 },
  { id: 'add-2', name: 'Dark Choco Chips', price: 20 },
  { id: 'add-3', name: 'White Choco Chips', price: 20 },
  { id: 'add-4', name: 'Rainbow Sprinkles', price: 20 },
  { id: 'add-5', name: 'Choco Stick', price: 20 },
];

export default function ProductDetailModal({ item, onClose }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [notes, setNotes] = useState('');
  const [addedSuccess, setAddedSuccess] = useState(false);

  if (!item) return null;

  const handleToggleAddOn = (addon) => {
    setSelectedAddOns(prev =>
      prev.some(a => a.name === addon.name)
        ? prev.filter(a => a.name !== addon.name)
        : [...prev, addon]
    );
  };

  const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0);
  const unitPrice = Number(item.price) + addOnsTotal;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    const addOnNames = selectedAddOns.map(a => `${a.name} (+₹${a.price})`);
    addToCart(item, quantity, notes, addOnNames);

    setAddedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-lg bg-[#FDFBF7] rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border border-[#EFE6D8] max-h-[90dvh] flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header / Image Container */}
        <div className="relative aspect-[16/9] w-full bg-[#2C1A14]">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-[#E5C170]">
              <Coffee className="w-12 h-12 mb-2 opacity-60" />
              <span className="text-sm font-medium">{item.name}</span>
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-md hover:bg-black/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Title & Price */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-serif font-bold text-xl text-[#2C1A14] leading-tight">
                {item.name}
              </h2>
              <p className="text-xs text-[#6D4C41] mt-1 leading-relaxed">
                {item.description || 'Prepared fresh on order with Trio Bean specialty ingredients.'}
              </p>
            </div>
            <div className="text-right">
              <span className="font-serif font-bold text-2xl text-[#C8963E]">
                ₹{item.price}
              </span>
            </div>
          </div>

          <hr className="border-[#EFE6D8]" />

          {/* Add-ons Selection */}
          <div>
            <h3 className="text-xs font-extrabold text-[#2C1A14] uppercase tracking-wider mb-2.5">
              Customize / Add-Ons
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEFAULT_ADDONS.map((addon) => {
                const isSelected = selectedAddOns.some(a => a.name === addon.name);
                return (
                  <button
                    key={addon.id}
                    type="button"
                    onClick={() => handleToggleAddOn(addon)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-[#2C1A14] text-[#E5C170] border-[#C8963E] shadow-sm'
                        : 'bg-white text-[#5D4037] border-[#EFE6D8] hover:border-[#C8963E]/40'
                    }`}
                  >
                    <span>{addon.name}</span>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-semibold">+₹{addon.price}</span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'bg-[#C8963E] border-[#C8963E] text-white' : 'border-stone-300'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Special Instructions */}
          <div>
            <label className="block text-xs font-extrabold text-[#2C1A14] uppercase tracking-wider mb-1.5">
              Special Instructions
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Less sugar, extra crispy, sauce on the side..."
              rows={2}
              className="w-full bg-white text-xs text-[#2C1A14] p-3 rounded-xl border border-[#EFE6D8] focus:outline-none focus:ring-2 focus:ring-[#C8963E] placeholder-stone-400"
            />
          </div>
        </div>

        {/* Modal Sticky Footer */}
        <div className="p-4 bg-[#FAF6F0] border-t border-[#EFE6D8] flex items-center justify-between gap-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {/* Quantity Selector */}
          <div className="flex items-center space-x-3 bg-white px-3 py-1.5 rounded-xl border border-[#EFE6D8] shadow-xs">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="w-7 h-7 rounded-lg bg-[#F5EFE6] text-[#2C1A14] flex items-center justify-center hover:bg-[#EFE6D8] active:scale-95 transition-all"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-bold text-sm text-[#2C1A14] min-w-[20px] text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(q => q + 1)}
              className="w-7 h-7 rounded-lg bg-[#2C1A14] text-[#E5C170] flex items-center justify-center hover:bg-[#3E2723] active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add to Cart CTA */}
          <button
            onClick={handleAddToCart}
            disabled={addedSuccess}
            className={`flex-1 py-3 px-5 rounded-xl font-bold text-sm flex items-center justify-between transition-all shadow-md active:scale-98 ${
              addedSuccess
                ? 'bg-emerald-700 text-white'
                : 'bg-[#2C1A14] text-[#E5C170] hover:bg-[#3E2723]'
            }`}
          >
            <span>{addedSuccess ? 'Added to Cart!' : 'Add to Cart'}</span>
            <span className="font-serif font-extrabold text-base">₹{totalPrice}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
