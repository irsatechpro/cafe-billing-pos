import { createClient } from '@supabase/supabase-js';

// Retrieve environment variables with production live fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qnkdmpervtviauxfobwq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_-nPnPwybbM7nGXIeeLDmLA_Xs1FxD-o';

// Check if credentials are properly provided
export const isLiveSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-supabase-url') &&
  !supabaseUrl.includes('placeholder')
);

// Create real Supabase client (used if configured)
export const supabase = isLiveSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

class LocalFallbackStore {
  constructor() {
    this.listeners = new Set();
    this.init();
  }

  init() {
    // Purge any stale non-UUID mock/pending orders from localStorage
    try {
      const activeId = localStorage.getItem('trio_bean_active_order_id');
      if (activeId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(activeId) && isNaN(Number(activeId))) {
        localStorage.removeItem('trio_bean_active_order_id');
        localStorage.removeItem('trio_bean_customer_name');
        localStorage.removeItem('trio_bean_cart');
      }
      const rawOrders = localStorage.getItem('tb_orders');
      if (rawOrders) {
        const parsed = JSON.parse(rawOrders);
        const valid = parsed.filter(o => o.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(o.id));
        localStorage.setItem('tb_orders', JSON.stringify(valid));
      }
    } catch (e) {}

    // Only initialize empty storage keys – NO seed data.
    // The app fetches everything from Supabase directly.
    if (!localStorage.getItem('tb_categories')) {
      localStorage.setItem('tb_categories', JSON.stringify([]));
    }
    if (!localStorage.getItem('tb_menu_items')) {
      localStorage.setItem('tb_menu_items', JSON.stringify([]));
    }
    if (!localStorage.getItem('tb_tables')) {
      localStorage.setItem('tb_tables', JSON.stringify([]));
    }
    if (!localStorage.getItem('tb_orders')) {
      localStorage.setItem('tb_orders', JSON.stringify([]));
    }
    if (!localStorage.getItem('tb_payments')) {
      localStorage.setItem('tb_payments', JSON.stringify([]));
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(event, payload) {
    this.listeners.forEach((listener) => listener(event, payload));
  }

  // Categories
  getCategories() {
    return JSON.parse(localStorage.getItem('tb_categories') || '[]');
  }
  saveCategories(categories) {
    localStorage.setItem('tb_categories', JSON.stringify(categories));
    this.notify('categories_updated', categories);
  }

  // Menu Items
  getMenuItems() {
    return JSON.parse(localStorage.getItem('tb_menu_items') || '[]');
  }
  saveMenuItems(items) {
    localStorage.setItem('tb_menu_items', JSON.stringify(items));
    this.notify('menu_updated', items);
  }

  // Tables
  getTables() {
    return JSON.parse(localStorage.getItem('tb_tables') || '[]');
  }
  saveTables(tables) {
    localStorage.setItem('tb_tables', JSON.stringify(tables));
    this.notify('tables_updated', tables);
  }

  // Orders
  getOrders() {
    return JSON.parse(localStorage.getItem('tb_orders') || '[]');
  }
  saveOrders(orders) {
    localStorage.setItem('tb_orders', JSON.stringify(orders));
    this.notify('orders_updated', orders);
  }

  // Payments
  getPayments() {
    return JSON.parse(localStorage.getItem('tb_payments') || '[]');
  }
  savePayments(payments) {
    localStorage.setItem('tb_payments', JSON.stringify(payments));
    this.notify('payments_updated', payments);
  }

  // Expenses
  getExpenses() {
    return JSON.parse(localStorage.getItem('tb_expenses') || '[]');
  }
  saveExpenses(expenses) {
    localStorage.setItem('tb_expenses', JSON.stringify(expenses));
    this.notify('expenses_updated', expenses);
  }
}

export const localStore = new LocalFallbackStore();
