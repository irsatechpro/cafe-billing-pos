import { createClient } from '@supabase/supabase-js';

// Retrieve environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

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

// Initial Local Storage Seed Data (Empty for dynamic multi-tenant registration)
const INITIAL_CATEGORIES = [];
const INITIAL_MENU_ITEMS = [];

const INITIAL_TABLES = [
  { id: 't1', table_number: '1', name: 'Table 1', qr_token: 'tb-tbl-1-token', is_active: true },
  { id: 't2', table_number: '2', name: 'Table 2', qr_token: 'tb-tbl-2-token', is_active: true },
  { id: 't3', table_number: '3', name: 'Table 3', qr_token: 'tb-tbl-3-token', is_active: true },
  { id: 't4', table_number: '4', name: 'Table 4', qr_token: 'tb-tbl-4-token', is_active: true },
  { id: 't5', table_number: '5', name: 'Table 5', qr_token: 'tb-tbl-5-token', is_active: true },
];

class LocalFallbackStore {
  constructor() {
    this.listeners = new Set();
    this.init();
  }

  init() {
    // Clear legacy hardcoded categories/items if present
    const existingCats = localStorage.getItem('tb_categories');
    if (existingCats && existingCats.includes('c1000000-0000-0000-0000-000000000001')) {
      localStorage.setItem('tb_categories', JSON.stringify([]));
      localStorage.setItem('tb_menu_items', JSON.stringify([]));
    }
    if (!localStorage.getItem('tb_categories')) {
      localStorage.setItem('tb_categories', JSON.stringify([]));
    }
    if (!localStorage.getItem('tb_menu_items')) {
      localStorage.setItem('tb_menu_items', JSON.stringify([]));
    }
    if (!localStorage.getItem('tb_tables')) {
      localStorage.setItem('tb_tables', JSON.stringify(INITIAL_TABLES));
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
}

export const localStore = new LocalFallbackStore();
