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

  useEffect(() => {
    if (activeOrderId) {
      localStorage.setItem('trio_bean_active_order_id', activeOrderId);
      
      const checkStatus = () => {
        getOrderById(activeOrderId).then((ord) => {
          if (ord && (ord.status === 'COMPLETED' || ord.status === 'CANCELLED')) {
            clearCustomerSession();
          }
        }).catch(() => {});
      };

      checkStatus();

      // Also check on window focus (e.g. customer switches back from camera or browser tab)
      window.addEventListener('focus', checkStatus);
      return () => window.removeEventListener('focus', checkStatus);
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
