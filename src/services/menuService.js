import { supabase, isLiveSupabaseConfigured, localStore } from '../lib/supabase';

export const isValidUUID = (id) =>
  typeof id === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Compress uploaded image using Canvas to an efficient WebP/JPEG data URL (~30-60KB)
export async function compressImageFile(file, maxWidth = 800, maxHeight = 800, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/webp', quality) || canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// Upload product image (compresses to fast, lightweight format for database storage)
export async function uploadMenuImage(file) {
  if (!file) return null;
  try {
    const compressedDataUrl = await compressImageFile(file);
    return compressedDataUrl;
  } catch (err) {
    console.warn('Image compression fallback:', err);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

// Instant cached categories fetch
export function getInstantCategories(cafeId) {
  const all = localStore.getCategories().filter(c => c.is_active && c.name && c.name.trim());
  const unique = Array.from(new Map(all.map(c => [c.name.trim().toLowerCase(), c])).values());
  return unique;
}

// Instant cached menu items fetch
export function getInstantMenuItems(cafeId) {
  return localStore.getMenuItems();
}

// Fetch all active categories directly from Supabase Postgres database
export async function getCategories(cafeId) {
  if (isLiveSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (!error && data && data.length > 0) {
        const unique = Array.from(new Map(data.map(c => [(c.name || '').trim().toLowerCase(), c])).values());
        localStore.saveCategories(unique);
        return unique;
      }
    } catch (e) {
      console.warn('Supabase getCategories error, falling back:', e);
    }
  }

  return getInstantCategories(cafeId);
}

// Fetch menu items directly from Supabase Postgres database
export async function getMenuItems(forceReload = false, cafeId) {
  if (isLiveSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('display_order', { ascending: true });

      if (!error && data && data.length > 0) {
        localStore.saveMenuItems(data);
        return data;
      }
    } catch (e) {
      console.warn('Supabase getMenuItems error, falling back:', e);
    }
  }

  return getInstantMenuItems(cafeId);
}

// Create category in Supabase Postgres and local cache
export async function createCategory(categoryData) {
  const catId = isValidUUID(categoryData.id) ? categoryData.id : generateUUID();
  const newCat = {
    id: catId,
    name: (categoryData.name || '').trim(),
    display_order: categoryData.display_order || (localStore.getCategories().length + 1),
    is_active: true,
    cafe_id: '00000000-0000-0000-0000-000000000001',
    created_at: new Date().toISOString()
  };

  // 1. Direct insert to Supabase Postgres
  if (isLiveSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('categories').insert([{
        id: newCat.id,
        name: newCat.name,
        display_order: newCat.display_order,
        is_active: true,
        cafe_id: newCat.cafe_id
      }]).select();

      if (!error && data && data.length > 0) {
        newCat.id = data[0].id;
      }
      if (error) console.warn('Supabase createCategory notice:', error.message);
    } catch (e) {
      console.warn('Supabase createCategory catch error:', e);
    }
  }

  // 2. Update localStore
  const cats = localStore.getCategories().filter(c => c.id !== newCat.id);
  cats.push(newCat);
  localStore.saveCategories(cats);
  return newCat;
}

// Delete category and all its items in Supabase Postgres and local cache
export async function deleteCategory(categoryId) {
  if (!categoryId) return false;

  // 1. Delete from Supabase Postgres
  if (isLiveSupabaseConfigured && supabase && isValidUUID(categoryId)) {
    try {
      await supabase.from('menu_items').delete().eq('category_id', categoryId);
      const { error } = await supabase.from('categories').delete().eq('id', categoryId);
      if (error) console.warn('Supabase deleteCategory notice:', error.message);
    } catch (e) {
      console.warn('Supabase deleteCategory catch error:', e);
    }
  }

  // 2. Update localStore
  const cats = localStore.getCategories().filter(c => String(c.id) !== String(categoryId));
  localStore.saveCategories(cats);

  const items = localStore.getMenuItems().filter(i => String(i.category_id) !== String(categoryId));
  localStore.saveMenuItems(items);

  return true;
}

// Update menu item in Supabase Postgres and local cache
export async function updateMenuItem(id, updates) {
  const supaPayload = {};
  if (updates.name !== undefined) supaPayload.name = updates.name.trim();
  if (updates.description !== undefined) supaPayload.description = updates.description.trim();
  if (updates.price !== undefined) supaPayload.price = Number(updates.price);
  if (updates.image_url !== undefined) supaPayload.image_url = updates.image_url;
  if (updates.is_available !== undefined) supaPayload.is_available = updates.is_available;
  if (updates.category_id !== undefined && isValidUUID(updates.category_id)) {
    supaPayload.category_id = updates.category_id;
  }
  supaPayload.updated_at = new Date().toISOString();

  // 1. Sync directly to Supabase Postgres
  if (isLiveSupabaseConfigured && supabase && isValidUUID(id)) {
    try {
      const { error } = await supabase.from('menu_items').update(supaPayload).eq('id', id);
      if (error) console.warn('Supabase updateMenuItem error:', error.message);
    } catch (e) {
      console.warn('Supabase updateMenuItem catch error:', e);
    }
  }

  // 2. Update localStore
  const items = localStore.getMenuItems();
  const index = items.findIndex(i => String(i.id) === String(id));
  if (index !== -1) {
    items[index] = { ...items[index], ...updates, updated_at: new Date().toISOString() };
    localStore.saveMenuItems(items);
    return items[index];
  }

  return { id, ...updates };
}

// Create new menu item in Supabase Postgres and local cache
export async function createMenuItem(itemData) {
  const itemId = isValidUUID(itemData.id) ? itemData.id : generateUUID();
  const payload = {
    id: itemId,
    category_id: isValidUUID(itemData.category_id) ? itemData.category_id : null,
    name: (itemData.name || '').trim(),
    description: (itemData.description || '').trim(),
    price: Number(itemData.price) || 0,
    image_url: itemData.image_url || '',
    is_available: itemData.is_available !== false,
    display_order: Number(itemData.display_order) || 0,
    cafe_id: '00000000-0000-0000-0000-000000000001'
  };

  let created = null;

  // 1. Direct insert into Supabase Postgres
  if (isLiveSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('menu_items').insert([payload]).select();
      if (!error && data && data.length > 0) {
        created = data[0];
      }
      if (error) console.warn('Supabase createMenuItem error:', error.message);
    } catch (e) {
      console.warn('Supabase createMenuItem catch error:', e);
    }
  }

  // 2. Update localStore
  const items = localStore.getMenuItems();
  const newItem = created || {
    ...payload,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  items.push(newItem);
  localStore.saveMenuItems(items);
  return newItem;
}

// Delete menu item from Supabase Postgres and local cache
export async function deleteMenuItem(id) {
  // 1. Delete from Supabase Postgres
  if (isLiveSupabaseConfigured && supabase && isValidUUID(id)) {
    try {
      const { error } = await supabase.from('menu_items').delete().eq('id', id);
      if (error) console.warn('Supabase deleteMenuItem error:', error.message);
    } catch (e) {
      console.warn('Supabase deleteMenuItem catch error:', e);
    }
  }

  // 2. Update localStore
  const items = localStore.getMenuItems().filter(i => String(i.id) !== String(id));
  localStore.saveMenuItems(items);
  return true;
}
