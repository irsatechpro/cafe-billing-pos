import { createClient } from '@supabase/supabase-js';
import menuSeedData from '../data/menu_store.json';

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

// Initial Local Storage Seed Data for Trio Bean Cafe
const INITIAL_CATEGORIES = menuSeedData.categories || [];
const INITIAL_MENU_ITEMS = menuSeedData.items || [];

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
    // Ensure Trio Bean categories and items are always loaded
    const existingCats = localStorage.getItem('tb_categories');
    if (!existingCats || JSON.parse(existingCats || '[]').length === 0) {
      localStorage.setItem('tb_categories', JSON.stringify(INITIAL_CATEGORIES));
    }
    const existingItems = localStorage.getItem('tb_menu_items');
    if (!existingItems || JSON.parse(existingItems || '[]').length === 0) {
      localStorage.setItem('tb_menu_items', JSON.stringify(INITIAL_MENU_ITEMS));
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
    const cats = JSON.parse(localStorage.getItem('tb_categories') || '[]');
    return cats.length > 0 ? cats : INITIAL_CATEGORIES;
  }
  saveCategories(categories) {
    localStorage.setItem('tb_categories', JSON.stringify(categories));
    this.notify('categories_updated', categories);
  }

  // Menu Items
  getMenuItems() {
    const items = JSON.parse(localStorage.getItem('tb_menu_items') || '[]');
    return items.length > 0 ? items : INITIAL_MENU_ITEMS;
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
