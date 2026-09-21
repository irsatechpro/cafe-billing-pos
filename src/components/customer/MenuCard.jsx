import React, { useState } from 'react';
import { Plus, Check, Ban, Coffee, Utensils, CupSoda, Flame, IceCream } from 'lucide-react';
import { useCart } from '../../context/CartContext';

// Helper to get category icon/color for offline food placeholders
function getOfflinePlaceholder(name = '') {
  const lower = name.toLowerCase();
  if (lower.includes('coffee') || lower.includes('tea') || lower.includes('chocolate')) {
    return { icon: Coffee, bg: 'from-amber-900 to-[#2C1A14]', label: 'Specialty Brew' };
  }
  if (lower.includes('shake') || lower.includes('juice') || lower.includes('mojito')) {
    return { icon: CupSoda, bg: 'from-amber-700 to-amber-900', label: 'Chilled Drink' };
  }
  if (lower.includes('waffle') || lower.includes('croissant') || lower.includes('brownie') || lower.includes('cookie')) {
    return { icon: IceCream, bg: 'from-yellow-800 to-amber-950', label: 'Dessert & Bakery' };
  }
  if (lower.includes('maggie') || lower.includes('fries') || lower.includes('popcorn')) {
    return { icon: Flame, bg: 'from-orange-800 to-amber-950', label: 'Crispy Snack' };
  }
  return { icon: Utensils, bg: 'from-stone-800 to-[#2C1A14]', label: 'Artisan Bite' };
}

export default function MenuCard({ item, onClick }) {
  const { cartItems, addToCart } = useCart();
  const [imgError, setImgError] = useState(false);

  React.useEffect(() => {
    setImgError(false);
  }, [item.image_url]);

  // Check if item is already in cart
  const cartItemCount = cartItems
    .filter(ci => ci.id === item.id)
    .reduce((sum, ci) => sum + ci.quantity, 0);

  const isAvailable = Boolean(item.is_available);
  const placeholderInfo = getOfflinePlaceholder(item.name);
  const PlaceholderIcon = placeholderInfo.icon;

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    if (!isAvailable) return;
    addToCart(item, 1);
  };

  return (
    <div
      onClick={() => isAvailable && onClick(item)}
      className={`group relative bg-white rounded-2xl overflow-hidden border border-[#EFE6D8] shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between ${
        isAvailable ? 'cursor-pointer hover:border-[#C8963E]/50' : 'opacity-75 bg-amber-50/20'
      }`}
    >
      <div>
        {/* Product Image / Offline Pure SVG Placeholder */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#2C1A14]">
          {!imgError && item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              onError={() => setImgError(true)}
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                !isAvailable ? 'grayscale contrast-75' : ''
              }`}
              loading="lazy"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${placeholderInfo.bg} flex flex-col items-center justify-center text-[#E5C170] p-3 text-center`}>
              <PlaceholderIcon className="w-9 h-9 mb-1 opacity-90 stroke-[1.5]" />
              <span className="text-[10px] font-mono tracking-widest text-amber-200/80 uppercase font-semibold">
                {placeholderInfo.label}
              </span>
            </div>
          )}

          {/* Availability Overlay Banner */}
          {!isAvailable && (
            <div className="absolute inset-0 bg-[#2C1A14]/70 backdrop-blur-[2px] flex items-center justify-center p-2 text-center">
              <span className="inline-flex items-center space-x-1.5 bg-rose-900/90 text-rose-100 text-xs font-bold px-3 py-1 rounded-full border border-rose-400/40 shadow-md">
                <Ban className="w-3.5 h-3.5" />
                <span>Currently Unavailable</span>
              </span>
            </div>
          )}

          {/* In-cart Quantity Badge */}
          {cartItemCount > 0 && isAvailable && (
            <div className="absolute top-2.5 right-2.5 bg-[#C8963E] text-[#2C1A14] font-extrabold text-xs px-2.5 py-0.5 rounded-full shadow border border-white flex items-center space-x-1">
              <Check className="w-3 h-3 stroke-[3]" />
              <span>{cartItemCount} in cart</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-3.5">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-sm text-[#2C1A14] leading-snug line-clamp-1 group-hover:text-[#C8963E] transition-colors">
              {item.name}
            </h3>
            <span className="font-serif font-bold text-sm text-[#2C1A14] bg-[#FAF6F0] px-2 py-0.5 rounded-md border border-[#EFE6D8] whitespace-nowrap">
              ₹{item.price}
            </span>
          </div>

          {item.description && (
            <p className="text-xs text-[#6D4C41]/80 line-clamp-2 leading-relaxed mb-2">
              {item.description}
            </p>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-3.5 pb-3.5 pt-0">
        <button
          onClick={handleQuickAdd}
          disabled={!isAvailable}
          className={`w-full py-2 px-3 rounded-xl font-semibold text-xs flex items-center justify-center space-x-1.5 transition-all ${
            isAvailable
              ? 'bg-[#2C1A14] text-[#FDFBF7] hover:bg-[#3E2723] active:scale-98 shadow-xs hover:shadow-[#C8963E]/20'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
          }`}
        >
          {isAvailable ? (
            <>
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add to Order</span>
            </>
          ) : (
            <span>Sold Out</span>
          )}
        </button>
      </div>
    </div>
  );
}
