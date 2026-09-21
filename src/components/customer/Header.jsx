import React from 'react';
import { ShoppingBag, Search, Coffee, Store } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCafe } from '../../context/CafeContext';

export default function Header({ customerName, onOpenCart, searchQuery, setSearchQuery, isSearching, setIsSearching }) {
  const { totalItemsCount } = useCart();
  const { activeCafe } = useCafe();

  return (
    <header className="sticky top-0 z-30 bg-[var(--color-bg,#FAF6F0)]/95 backdrop-blur-md border-b border-[var(--color-border,#EFE6D8)] shadow-xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Dynamic Cafe Brand Identity */}
          <div className="flex items-center space-x-2.5">
            {activeCafe?.logo_url ? (
              <img
                src={activeCafe.logo_url}
                alt={activeCafe?.name || 'Cafe Logo'}
                className="w-10 h-10 rounded-full object-cover shadow-md border border-[var(--color-accent,#C8963E)]/40"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary,#2C1A14)] flex items-center justify-center text-[var(--color-accent,#C8963E)] shadow-md border border-[var(--color-accent,#C8963E)]/40">
                <Coffee className="w-5.5 h-5.5" />
              </div>
            )}
            <div>
              <h1 className="font-serif font-bold text-lg sm:text-xl text-[var(--color-text-main,#2C1A14)] leading-tight tracking-wide truncate max-w-[200px]">
                {activeCafe?.name || 'TRIO BEAN'}
              </h1>
              <div className="flex items-center space-x-1.5 text-xs text-[var(--color-text-muted,#6D4C41)]">
                <span className="font-semibold text-[var(--color-accent,#C8963E)] uppercase text-[10px]">
                  {activeCafe?.tagline?.split('•')[0] || 'DIGITAL MENU'}
                </span>
                <span>•</span>
                {customerName ? (
                  <span className="bg-[var(--color-primary,#2C1A14)] text-[var(--color-accent-light,#E5C170)] px-2 py-0.5 rounded-full font-bold text-[10px] tracking-wide">
                    {customerName}
                  </span>
                ) : (
                  <span className="text-[11px] font-medium">Order Online</span>
                )}
              </div>
            </div>
          </div>

          {/* Customer Actions Only */}
          <div className="flex items-center space-x-2">
            {/* Search Toggle */}
            <button
              onClick={() => setIsSearching(!isSearching)}
              className={`p-2 rounded-full transition-colors ${
                isSearching ? 'bg-[#C8963E] text-white' : 'text-[#6D4C41] hover:bg-[#EFE6D8]/60'
              }`}
              title="Search Menu"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Shopping Cart Icon */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 rounded-full bg-[#2C1A14] text-[#FDFBF7] hover:bg-[#3E2723] transition-all shadow-md active:scale-95"
              aria-label="View Order Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C8963E] text-[#2C1A14] text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#FAF6F0] shadow">
                  {totalItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar Input */}
        {isSearching && (
          <div className="mt-2.5 transition-all">
            <div className="relative">
              <input
                type="text"
                placeholder="Search coffee, momos, burger, shake, mojito..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full bg-white text-[#2C1A14] placeholder-[#6D4C41]/60 px-4 py-2 pl-10 rounded-xl border border-[#C8963E]/40 focus:outline-none focus:ring-2 focus:ring-[#C8963E] text-sm shadow-inner"
              />
              <Search className="w-4 h-4 text-[#6D4C41] absolute left-3.5 top-3" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-[#6D4C41] bg-[#EFE6D8] rounded-full px-2 py-0.5 font-medium"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
