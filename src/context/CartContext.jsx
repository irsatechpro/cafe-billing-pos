import React, { createContext, useContext, useState, useEffect } from 'react';
import { getOrderById } from '../services/orderService';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('trio_bean_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Remember customer name across visit
  const [customerName, setCustomerName] = useState(() => {
    try {
      return localStorage.getItem('trio_bean_customer_name') || '';
    } catch {
      return '';
    }
  });

  // Unique active order ID stored on this specific customer's phone!
  const [activeOrderId, setActiveOrderId] = useState(() => {
    try {
      return localStorage.getItem('trio_bean_active_order_id') || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem('trio_bean_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (customerName) {
      localStorage.setItem('trio_bean_customer_name', customerName);
    } else {
      localStorage.removeItem('trio_bean_customer_name');
    }
  }, [customerName]);

  // On mount, validate saved session. If the saved order doesn't exist or is
  // paid/completed/cancelled, clear everything so the customer starts fresh.
  useEffect(() => {
    const savedOrderId = localStorage.getItem('trio_bean_active_order_id');
    if (!savedOrderId) {
      // No active order → clear any leftover name/cart
      localStorage.removeItem('trio_bean_customer_name');
      localStorage.removeItem('trio_bean_cart');
      setCustomerName('');
      setCartItems([]);
      return;
    }
    // Validate the saved order against Supabase
    getOrderById(savedOrderId).then((ord) => {
      const terminalStatuses = ['COMPLETED', 'CANCELLED', 'PAID'];
      if (!ord || terminalStatuses.includes(ord.status)) {
        // Order is gone or finished → full reset
        localStorage.removeItem('trio_bean_customer_name');
        localStorage.removeItem('trio_bean_active_order_id');
        localStorage.removeItem('trio_bean_cart');
        setCustomerName('');
        setActiveOrderId(null);
        setCartItems([]);
      }
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeOrderId) {
      localStorage.setItem('trio_bean_active_order_id', activeOrderId);
      
      const checkStatus = () => {
        getOrderById(activeOrderId).then((ord) => {
          if (!ord) {
            // Order no longer exists in database (deleted) – clear session
            clearCustomerSession();
            return;
          }
          // Clear session if order is in any terminal/paid state
          const terminalStatuses = ['COMPLETED', 'CANCELLED', 'PAID'];
          if (terminalStatuses.includes(ord.status)) {
            clearCustomerSession();
          }
        }).catch(() => {});
      };

      // Check immediately on mount (covers QR re-scan)
      checkStatus();

      // Check when customer switches back to browser tab or unlocks phone
      const handleVisibility = () => {
        if (document.visibilityState === 'visible') checkStatus();
      };
      window.addEventListener('focus', checkStatus);
      document.addEventListener('visibilitychange', handleVisibility);

      // Also poll every 30 seconds in case the staff marks it as paid while the customer has the page open
      const pollInterval = setInterval(checkStatus, 30000);

      return () => {
        window.removeEventListener('focus', checkStatus);
        document.removeEventListener('visibilitychange', handleVisibility);
        clearInterval(pollInterval);
      };
    } else {
      localStorage.removeItem('trio_bean_active_order_id');
    }
  }, [activeOrderId]);

  const addToCart = (product, quantity = 1, notes = '', selectedAddOns = []) => {
    if (!product || !product.is_available) return;

    setCartItems(prev => {
      const addOnsKey = selectedAddOns.sort().join(',');
      const itemKey = `${product.id}_${addOnsKey}_${notes}`;

      const existingIndex = prev.findIndex(item => item.itemKey === itemKey);

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity
        };
        return updated;
      }

      return [
        ...prev,
        {
          itemKey,
          id: product.id,
          name: product.name,
          price: Number(product.price),
          image_url: product.image_url,
          quantity,
          notes,
          selectedAddOns,
          category_id: product.category_id
        }
      ];
    });
  };

  const removeFromCart = (itemKey) => {
    setCartItems(prev => prev.filter(item => item.itemKey !== itemKey));
  };

  const updateQuantity = (itemKey, delta) => {
    setCartItems(prev => {
      return prev
        .map(item => {
          if (item.itemKey === itemKey) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const clearCustomerSession = () => {
    setCustomerName('');
    setActiveOrderId(null);
    try {
      localStorage.removeItem('trio_bean_customer_name');
      localStorage.removeItem('trio_bean_active_order_id');
      localStorage.removeItem('trio_bean_cart');
    } catch (e) {}
    setCartItems([]);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        customerName,
        setCustomerName,
        activeOrderId,
        setActiveOrderId,
        clearCustomerSession,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        totalItemsCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
