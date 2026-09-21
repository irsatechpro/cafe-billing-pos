import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/customer/Header';
import CategoryTabs from '../components/customer/CategoryTabs';
import MenuCard from '../components/customer/MenuCard';
import ProductDetailModal from '../components/customer/ProductDetailModal';
import CartDrawer from '../components/customer/CartDrawer';
import { getCategories, getMenuItems, getInstantCategories, getInstantMenuItems } from '../services/menuService';
import { getOrderById } from '../services/orderService';
import { useCart } from '../context/CartContext';
import { useCafe } from '../context/CafeContext';
import { Coffee, Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react';
import { supabase, isLiveSupabaseConfigured, localStore } from '../lib/supabase';

export default function CustomerMenu() {
  const { customerName, activeOrderId, clearCustomerSession } = useCart();
  const { activeCafe } = useCafe();
  const navigate = useNavigate();
  
  // Determine which cafe to load: prioritize URL query param ?cafe=, then activeCafe
  const params = new URLSearchParams(window.location.search);
  const cafeQueryParam = params.get('cafe');
  const targetCafe = cafeQueryParam || activeCafe?.slug || activeCafe?.id || 'trio-bean';

  // Instant Initial State (Zero Loading Spinner Delay!)
  const [categories, setCategories] = useState(() => getInstantCategories(targetCafe));
  const [menuItems, setMenuItems] = useState(() => getInstantMenuItems(targetCafe));
  const [activeOrder, setActiveOrder] = useState(null);
  
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const [activeItemModal, setActiveItemModal] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync active order if customer already placed an order on this device
  useEffect(() => {
    if (!activeOrderId) {
      setActiveOrder(null);
      return;
    }

    const checkOrder = async () => {
      try {
        const ord = await getOrderById(activeOrderId);
        if (ord) {
          if (ord.status === 'COMPLETED' || ord.status === 'CANCELLED') {
            // Bill is already paid at cashier counter! Reset so next scan is fresh
            clearCustomerSession();
            setActiveOrder(null);
          } else {
            setActiveOrder(ord);
          }
        } else {
          setActiveOrder(null);
        }
      } catch (e) {
        console.error('Failed to sync active order:', e);
      }
    };

    checkOrder();

    if (isLiveSupabaseConfigured && supabase) {
      const channel = supabase
        .channel(`menu-active-order-${activeOrderId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `id=eq.${activeOrderId}` }, () => {
          checkOrder();
        })
        .subscribe();
      return () => supabase.removeChannel(channel);
    }
  }, [activeOrderId, clearCustomerSession]);

  // Background sync with shared server API for target cafe
  const syncData = async (cafeIdentifier) => {
    try {
      const cid = cafeIdentifier || targetCafe;
      const [cats, items] = await Promise.all([getCategories(cid), getMenuItems(true, cid)]);
      if (cats && cats.length > 0) {
        setCategories(cats);
        setSelectedCategoryId(prev => (prev && cats.some(c => c.id === prev) ? prev : cats[0].id));
      } else {
        setCategories([]);
      }
      if (items) {
        setMenuItems(items);
      }
    } catch (err) {
      console.error('Background menu sync error:', err);
    }
  };

  useEffect(() => {
    syncData(targetCafe);

    // 1. Universal Realtime Live Sync via Server-Sent Events (SSE)
    let eventSource = null;
    try {
      eventSource = new EventSource('/api/menu/stream');
      eventSource.addEventListener('menu_updated', () => {
        syncData(targetCafe);
      });
    } catch (e) {
      console.warn('SSE connection unavailable:', e);
    }

    // 2. LocalStore Subscription
    const unsubLocal = localStore.subscribe((event) => {
      if (event === 'menu_updated' || event === 'categories_updated') {
        syncData(targetCafe);
      }
    });

    // 3. Window focus / visibility change re-sync
    const handleFocus = () => syncData(targetCafe);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      if (eventSource) eventSource.close();
      unsubLocal();
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [targetCafe]);

  // Filter items by category & search query
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategoryId ? item.category_id === selectedCategoryId : true;
    const matchesSearch = searchQuery
      ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-24 text-[#2C1A14] selection:bg-[#C8963E] selection:text-[#FDFBF7]">
      {/* Header Bar */}
      <Header
        customerName={customerName}
        onOpenCart={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isSearching={isSearching}
        setIsSearching={setIsSearching}
      />

      {/* Hero Branding Strip */}
      <div className="bg-gradient-to-r from-[#2C1A14] via-[#3E2723] to-[#2C1A14] text-[#FDFBF7] px-4 sm:px-6 lg:px-8 py-3 border-b border-[#C8963E]/30">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#E5C170] animate-pulse" />
            <span className="text-xs font-serif tracking-wider text-[#E5C170] uppercase font-semibold">
              {activeCafe?.tagline || 'Fresh • Tasty • Made Daily'}
            </span>
          </div>
          {customerName ? (
            <span className="text-[11px] font-bold text-[#E5C170] bg-white/10 px-2.5 py-0.5 rounded-full">
              Welcome back, {customerName}!
            </span>
          ) : (
            <span className="text-[11px] font-mono text-stone-300 bg-white/10 px-2 py-0.5 rounded">
              QR Digital Menu
            </span>
          )}
        </div>
      </div>

      {/* Category Tabs Bar */}
      {categories.length > 0 && (
        <CategoryTabs
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
        />
      )}

      {/* Main Menu Grid: Fully Responsive for Mobile, Tablets, iPad, Laptops & Desktops */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {menuItems.length === 0 ? (
          <div className="py-20 text-center max-w-sm mx-auto px-4">
            <div className="w-16 h-16 rounded-2xl bg-[#F5EFE6] border border-[#EFE6D8] flex items-center justify-center mx-auto mb-4 text-[#C8963E]">
              <Coffee className="w-8 h-8" />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#2C1A14]">Menu is Under Preparation</h3>
            <p className="text-xs text-[#6D4C41] mt-2 leading-relaxed">
              No items have been added to this menu yet. The cafe will be updating their menu soon. Please check back shortly!
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center">
            <Coffee className="w-12 h-12 text-[#C8963E]/40 mx-auto mb-3" />
            <h3 className="font-serif font-bold text-base text-[#2C1A14]">No items found</h3>
            <p className="text-xs text-[#6D4C41] mt-1">
              {searchQuery ? `No menu item matches "${searchQuery}"` : 'No products available in this category.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
            {filteredItems.map((item) => (
              <MenuCard
                key={item.id}
                item={item}
                onClick={setActiveItemModal}
              />
            ))}
          </div>
        )}
      </main>

      {/* Product Detail Modal */}
      {activeItemModal && (
        <ProductDetailModal
          item={activeItemModal}
          onClose={() => setActiveItemModal(null)}
        />
      )}

      {/* Floating Active Order Notification Bar (If customer placed order and reopened menu) */}
      {activeOrder && activeOrder.status !== 'COMPLETED' && activeOrder.status !== 'CANCELLED' && (
        <div className="fixed bottom-3 inset-x-0 z-40 max-w-lg mx-auto px-4 animate-slide-up">
          <div 
            onClick={() => navigate(`/order/${activeOrder.id}`)}
            className="bg-[#2C1A14] text-[#FDFBF7] p-3 rounded-2xl shadow-xl border border-[#C8963E]/60 flex items-center justify-between cursor-pointer hover:bg-[#3E2723] transition-all"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#C8963E]/20 text-[#E5C170] flex items-center justify-center shrink-0">
                <Coffee className="w-5 h-5" />
              </div>
              <div className="truncate">
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-xs text-white">
                    Order #{activeOrder.order_number || activeOrder.id.slice(0, 6)} Active
                  </span>
                  <span className="text-[9px] bg-emerald-900/80 text-emerald-300 font-bold px-1.5 py-0.2 rounded uppercase">
                    {activeOrder.status}
                  </span>
                </div>
                <p className="text-[10px] text-[#E5C170] truncate">
                  Customer: {activeOrder.customer_name} • Tap to view placed items & bill
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1 text-[#E5C170] pl-2 shrink-0">
              <span className="text-xs font-bold font-mono">₹{activeOrder.total_amount || activeOrder.subtotal}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </div>
  );
}
