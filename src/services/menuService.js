import { supabase, isLiveSupabaseConfigured, localStore } from '../lib/supabase';

// Instant cached categories fetch (0ms UI latency)
export function getInstantCategories(cafeId) {
  const all = localStore.getCategories().filter(c => c.is_active);
  if (!cafeId || cafeId === 'cafe-default-001' || cafeId === 'trio-bean') {
    return all.filter(c => !c.cafe_id || c.cafe_id === 'cafe-default-001' || c.cafe_id === 'trio-bean');
  }
  return all.filter(c => c.cafe_id === cafeId);
}

// Instant cached menu items fetch (0ms UI latency)
export function getInstantMenuItems(cafeId) {
  const all = localStore.getMenuItems();
  if (!cafeId || cafeId === 'cafe-default-001' || cafeId === 'trio-bean') {
    return all.filter(i => !i.cafe_id || i.cafe_id === 'cafe-default-001' || i.cafe_id === 'trio-bean');
  }
  return all.filter(i => i.cafe_id === cafeId);
}

// Fetch all active categories with background server & database sync
export async function getCategories(cafeId) {
  try {
    const url = cafeId ? `/api/menu?cafe=${encodeURIComponent(cafeId)}` : '/api/menu';
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data && data.categories) {
        return data.categories.filter(c => c.is_active);
      }
    }
  } catch (e) {
    console.warn('Server API fetch categories fallback to cache:', e);
  }

  // Fallback to localStore
  return getInstantCategories(cafeId);
}

// Fetch menu items with background server & database sync
export async function getMenuItems(forceReload = false, cafeId) {
  try {
    const url = cafeId ? `/api/menu?cafe=${encodeURIComponent(cafeId)}` : '/api/menu';
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data && data.items) {
        return data.items;
      }
    }
  } catch (e) {
    console.warn('Server API fetch menu fallback to cache:', e);
  }

  // Fallback to localStore
  return getInstantMenuItems(cafeId);
}

// Create category across server, database and local cache
export async function createCategory(categoryData) {
  let created = null;

  // 1. Primary: Save to shared server API
  try {
    const res = await fetch('/api/menu/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryData)
    });
    if (res.ok) {
      created = await res.json();
    }
  } catch (e) {
    console.warn('Server API createCategory error:', e);
  }

  // 2. Sync to Supabase if configured
  if (isLiveSupabaseConfigured && supabase) {
    try {
      await supabase.from('categories').insert([{
        id: created?.id || categoryData.id,
        name: (categoryData.name || '').trim(),
        display_order: categoryData.display_order || 1,
        is_active: true,
        cafe_id: categoryData.cafe_id
      }]);
    } catch (e) {
      console.warn('Supabase createCategory sync:', e);
    }
  }

  // 3. Update localStore cache
  const cats = localStore.getCategories();
  const newCat = created || {
    id: categoryData.id || ('cat_' + Date.now().toString(36)),
    name: categoryData.name,
    display_order: categoryData.display_order || (cats.length + 1),
    is_active: true,
    cafe_id: categoryData.cafe_id,
    created_at: new Date().toISOString()
  };
  cats.push(newCat);
  localStore.saveCategories(cats);
  return newCat;
}

// Update menu item across all devices
export async function updateMenuItem(id, updates) {
  let updatedItem = null;

  // 1. Primary: Save to shared server API so ALL connected phones & PCs update in real-time
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
    console.warn('Server API updateMenuItem fallback:', e);
  }

  // 2. Sync with Supabase
  if (isLiveSupabaseConfigured && supabase) {
    try {
      await supabase.from('menu_items').update(updates).eq('id', id);
    } catch (e) {
      console.warn('Supabase updateMenuItem sync:', e);
    }
  }

  // 3. Update localStore cache
  const items = localStore.getMenuItems();
  const index = items.findIndex(i => String(i.id) === String(id));
  if (index !== -1) {
    items[index] = { ...items[index], ...(updatedItem || updates), updated_at: new Date().toISOString() };
    localStore.saveMenuItems(items);
    return items[index];
  }

  if (updatedItem) return updatedItem;
  throw new Error('Item not found');
}

// Add new menu item across all devices
export async function createMenuItem(itemData) {
  let created = null;

  // 1. Primary: Save to shared server API
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
    console.warn('Server API createMenuItem fallback:', e);
  }

  // 2. Sync to Supabase
  if (isLiveSupabaseConfigured && supabase) {
    try {
      const itemToInsert = created || itemData;
      await supabase.from('menu_items').insert([{
        id: itemToInsert.id,
        name: itemToInsert.name,
        description: itemToInsert.description || '',
        price: Number(itemToInsert.price),
        category_id: itemToInsert.category_id,
        image_url: itemToInsert.image_url || '',
        is_available: itemToInsert.is_available ?? true,
        cafe_id: itemToInsert.cafe_id
      }]);
    } catch (e) {
      console.warn('Supabase createMenuItem sync:', e);
    }
  }

  // 3. Update localStore cache
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

// Delete menu item across all devices
export async function deleteMenuItem(id) {
  try {
    await fetch(`/api/menu/items/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  } catch (e) {
    console.warn('Server API deleteMenuItem error:', e);
  }

  if (isLiveSupabaseConfigured && supabase) {
    try {
      await supabase.from('menu_items').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteMenuItem sync:', e);
    }
  }

  const items = localStore.getMenuItems().filter(i => String(i.id) !== String(id));
  localStore.saveMenuItems(items);
  return true;
}

// Upload product image (real file stored on server, accessible by all phones & PCs)
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

