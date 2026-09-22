import { supabase, isLiveSupabaseConfigured, localStore } from '../lib/supabase';

// Instant cached categories fetch (0ms UI latency)
export function getInstantCategories(cafeId) {
  const all = localStore.getCategories().filter(c => c.is_active);
  if (!cafeId || cafeId === 'cafe-default-001' || cafeId === 'trio-bean' || cafeId === 'cafe_mub1covl_9uws') {
    return all;
  }
  return all.filter(c => c.cafe_id === cafeId);
}

// Instant cached menu items fetch (0ms UI latency)
export function getInstantMenuItems(cafeId) {
  const all = localStore.getMenuItems();
  if (!cafeId || cafeId === 'cafe-default-001' || cafeId === 'trio-bean' || cafeId === 'cafe_mub1covl_9uws') {
    return all;
  }
  return all.filter(i => i.cafe_id === cafeId);
}

// Fetch all active categories directly from Supabase, with server & cache fallback
export async function getCategories(cafeId) {
  // 1. Primary: Direct query from Supabase Postgres database
  if (isLiveSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (!error && data && data.length > 0) {
        localStore.saveCategories(data);
        return data;
      }
    } catch (e) {
      console.warn('Supabase getCategories error, falling back:', e);
    }
  }

  // 2. Server API fallback
  try {
    const url = cafeId ? `/api/menu?cafe=${encodeURIComponent(cafeId)}` : '/api/menu';
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data && data.categories && data.categories.length > 0) {
        return data.categories.filter(c => c.is_active);
      }
    }
  } catch (e) {
    console.warn('Server API fetch categories fallback to cache:', e);
  }

  // 3. Fallback to localStore
  return getInstantCategories(cafeId);
}

// Fetch menu items directly from Supabase, with server & cache fallback
export async function getMenuItems(forceReload = false, cafeId) {
  // 1. Primary: Direct query from Supabase Postgres database
  if (isLiveSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        localStore.saveMenuItems(data);
        return data;
      }
    } catch (e) {
      console.warn('Supabase getMenuItems error, falling back:', e);
    }
  }

  // 2. Server API fallback
  try {
    const url = cafeId ? `/api/menu?cafe=${encodeURIComponent(cafeId)}` : '/api/menu';
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data && data.items && data.items.length > 0) {
        return data.items;
      }
    }
  } catch (e) {
    console.warn('Server API fetch menu fallback to cache:', e);
  }

  // 3. Fallback to localStore
  return getInstantMenuItems(cafeId);
}

// Create category in Supabase, shared API and local cache
export async function createCategory(categoryData) {
  const catId = categoryData.id || ('cat_' + Date.now().toString(36));
  const newCat = {
    id: catId,
    name: (categoryData.name || '').trim(),
    display_order: categoryData.display_order || (localStore.getCategories().length + 1),
    is_active: true,
    cafe_id: categoryData.cafe_id || 'cafe_mub1covl_9uws',
    created_at: new Date().toISOString()
  };

  // 1. Direct insert to Supabase
  if (isLiveSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('categories').insert([{
        id: newCat.id,
        name: newCat.name,
        display_order: newCat.display_order,
        is_active: true,
        cafe_id: newCat.cafe_id
      }]);
      if (error) console.warn('Supabase createCategory notice:', error.message);
    } catch (e) {
      console.warn('Supabase createCategory catch error:', e);
    }
  }

  // 2. Server API sync
  try {
    await fetch('/api/menu/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCat)
    });
  } catch (e) {}

  // 3. Update localStore
  const cats = localStore.getCategories();
  cats.push(newCat);
  localStore.saveCategories(cats);
  return newCat;
}

// Delete category and all its items in Supabase, server and local cache
export async function deleteCategory(categoryId) {
  if (!categoryId) return false;

  // 1. Delete from Supabase
  if (isLiveSupabaseConfigured && supabase) {
    try {
      // Delete associated menu items first
      await supabase.from('menu_items').delete().eq('category_id', categoryId);
      // Delete category
      const { error } = await supabase.from('categories').delete().eq('id', categoryId);
      if (error) console.warn('Supabase deleteCategory notice:', error.message);
    } catch (e) {
      console.warn('Supabase deleteCategory catch error:', e);
    }
  }

  // 2. Server API sync
  try {
    await fetch(`/api/menu/categories/${encodeURIComponent(categoryId)}`, {
      method: 'DELETE'
    });
  } catch (e) {}

  // 3. Update localStore: remove category & its items
  const cats = localStore.getCategories().filter(c => String(c.id) !== String(categoryId));
  localStore.saveCategories(cats);

  const items = localStore.getMenuItems().filter(i => String(i.category_id) !== String(categoryId));
  localStore.saveMenuItems(items);

  return true;
}

// Update menu item across all devices
export async function updateMenuItem(id, updates) {
  let updatedItem = null;

  // 1. Sync to Supabase
  if (isLiveSupabaseConfigured && supabase) {
    try {
      await supabase.from('menu_items').update(updates).eq('id', id);
    } catch (e) {
      console.warn('Supabase updateMenuItem sync:', e);
    }
  }

  // 2. Server API sync
  try {
    const res = await fetch(`/api/menu/items/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (res.ok) {
      updatedItem = await res.json();
    }
  } catch (e) {
    console.warn('Server API updateMenuItem error:', e);
  }

  // 3. Update localStore
  const items = localStore.getMenuItems();
  const index = items.findIndex(i => String(i.id) === String(id));
  if (index !== -1) {
    items[index] = { ...items[index], ...updates, updated_at: new Date().toISOString() };
    localStore.saveMenuItems(items);
    return items[index];
  }

  return updatedItem || { id, ...updates };
}

// Create new menu item in Supabase, server and local cache
export async function createMenuItem(itemData) {
  let created = null;

  // 1. Server API sync
  try {
    const res = await fetch('/api/menu/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData)
    });
    if (res.ok) {
      created = await res.json();
    }
  } catch (e) {
    console.warn('Server API createMenuItem error:', e);
  }

  // 2. Direct insert to Supabase
  if (isLiveSupabaseConfigured && supabase) {
    try {
      await supabase.from('menu_items').insert([{
        id: created?.id || ('m_' + Date.now()),
        category_id: itemData.category_id,
        name: (itemData.name || '').trim(),
        description: (itemData.description || '').trim(),
        price: Number(itemData.price),
        image_url: itemData.image_url || '',
        is_available: itemData.is_available !== false,
        cafe_id: itemData.cafe_id || 'cafe_mub1covl_9uws'
      }]);
    } catch (e) {
      console.warn('Supabase createMenuItem sync:', e);
    }
  }

  // 3. Update localStore
  const items = localStore.getMenuItems();
  const newItem = created || {
    id: 'm_' + Date.now(),
    ...itemData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  items.push(newItem);
  localStore.saveMenuItems(items);
  return newItem;
}

// Delete menu item across Supabase, server and local cache
export async function deleteMenuItem(id) {
  // 1. Server API sync
  try {
    await fetch(`/api/menu/items/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  } catch (e) {
    console.warn('Server API deleteMenuItem error:', e);
  }

  // 2. Delete from Supabase
  if (isLiveSupabaseConfigured && supabase) {
    try {
      await supabase.from('menu_items').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteMenuItem sync:', e);
    }
  }

  // 3. Update localStore
  const items = localStore.getMenuItems().filter(i => String(i.id) !== String(id));
  localStore.saveMenuItems(items);
  return true;
}

// Upload product image
export async function uploadMenuImage(file) {
  if (!file) return null;

  try {
    const base64Data = await fileToDataURL(file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: file.name,
        base64Data
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.url) {
        return data.url;
      }
    }
  } catch (e) {
    console.warn('Server upload error, falling back to data URL:', e);
  }

  return await fileToDataURL(file);
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
