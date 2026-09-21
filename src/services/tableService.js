import { supabase, isLiveSupabaseConfigured, localStore } from '../lib/supabase';

// Get all tables
export async function getTables() {
  if (isLiveSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .order('table_number', { ascending: true });

    if (error) {
      console.error('Supabase fetch tables error:', error);
      return localStore.getTables();
    }
    return data;
  }
  return localStore.getTables();
}

// Find table by table_number or token
export async function validateTable(identifier) {
  if (!identifier) return null;
  const cleanId = String(identifier).padStart(2, '0');

  if (isLiveSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .or(`table_number.eq.${cleanId},table_number.eq.${identifier},qr_token.eq.${identifier}`)
      .single();

    if (error) {
      console.error('Supabase validate table error:', error);
    } else if (data) {
      return data;
    }
  }

  const tables = localStore.getTables();
  return tables.find(t => 
    t.table_number === cleanId || 
    t.table_number === String(identifier) || 
    t.qr_token === identifier
  ) || null;
}

// Create new table
export async function createTable(tableNumber, name = '') {
  const cleanNum = String(tableNumber).padStart(2, '0');
  const tableName = name || `Table ${cleanNum}`;
  const qrToken = `tb-tbl-${cleanNum}-token`;

  if (isLiveSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('tables')
      .insert([{
        table_number: cleanNum,
        name: tableName,
        qr_token: qrToken,
        is_active: true
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  const tables = localStore.getTables();
  if (tables.some(t => t.table_number === cleanNum)) {
    throw new Error(`Table ${cleanNum} already exists.`);
  }

  const newTable = {
    id: 't_' + Date.now(),
    table_number: cleanNum,
    name: tableName,
    qr_token: qrToken,
    is_active: true,
    created_at: new Date().toISOString()
  };
  tables.push(newTable);
  localStore.saveTables(tables);
  return newTable;
}

// Toggle table active status
export async function toggleTableStatus(id, isActive) {
  if (isLiveSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('tables')
      .update({ is_active: isActive })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  const tables = localStore.getTables();
  const index = tables.findIndex(t => t.id === id);
  if (index !== -1) {
    tables[index].is_active = isActive;
    localStore.saveTables(tables);
    return tables[index];
  }
  throw new Error('Table not found');
}
