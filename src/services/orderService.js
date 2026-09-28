import { supabase, isLiveSupabaseConfigured, localStore } from '../lib/supabase';
import { getMenuItems } from './menuService';

const isValidUUID = (id) => typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

// Broadcast realtime event across all open staff/kitchen screens via Supabase channel
export function notifyRealtimeOrders(eventType, payload = {}) {
  try {
    if (isLiveSupabaseConfigured && supabase) {
      const channel = supabase.channel('trio-bean-orders-desk');
      channel.send({
        type: 'broadcast',
        event: eventType,
        payload: { ...payload, timestamp: new Date().toISOString() }
      }).catch(() => {});
    }
  } catch (e) {
    console.warn('Realtime notify notice:', e);
  }
}

// Helper to extract base customer name without table suffix e.g. "Ravi [Table 1]" -> "ravi"
const extractBaseName = (name) => (name || '').replace(/\[.*?\]/g, '').trim().toLowerCase();

// Find active unpaid order for a customer / device
export async function getActiveOrderForCustomer(orderId = null, customerName = '') {
  const activeStatuses = ['NEW', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'BILL_REQUESTED'];
  const cleanBaseName = extractBaseName(customerName);

  // 1. If orderId is provided, first look up in Supabase (supporting both UUID id and numeric order_number)
  if (orderId && isLiveSupabaseConfigured && supabase) {
    try {
      let query = supabase.from('orders').select('*').in('status', activeStatuses);
      if (isValidUUID(orderId)) {
        query = query.eq('id', orderId);
      } else if (!isNaN(Number(orderId))) {
        query = query.eq('order_number', Number(orderId));
      } else {
        query = null;
      }

      if (query) {
        const { data: activeOrders, error } = await query.limit(1);

        if (!error && activeOrders && activeOrders.length > 0) {
          const foundOrder = activeOrders[0];
          const existingBase = extractBaseName(foundOrder.customer_name);

          // Verify name compatibility
          const isMatch = !cleanBaseName || !existingBase || existingBase === cleanBaseName || existingBase.includes(cleanBaseName) || cleanBaseName.includes(existingBase);

          if (isMatch) {
            const { data: items } = await supabase
              .from('order_items')
              .select('*')
              .eq('order_id', foundOrder.id)
              .order('created_at', { ascending: true });

            foundOrder.order_items = items || [];
            foundOrder.items = items || [];
            return foundOrder;
          }
        }
      }
    } catch (e) {
      console.warn('getActiveOrderForCustomer by orderId notice:', e);
    }
  }

  // 2. Fallback: Always check by customer name for ANY active unpaid order in Supabase!
  // If the same customer orders again from their seating, it will ALWAYS match their active order
  // and append new items into the same bill instead of creating a separate order!
  if (cleanBaseName && cleanBaseName !== 'guest' && isLiveSupabaseConfigured && supabase) {
    try {
      const { data: namedOrders, error } = await supabase
        .from('orders')
        .select('*')
        .ilike('customer_name', `%${cleanBaseName}%`)
        .in('status', activeStatuses)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!error && namedOrders && namedOrders.length > 0) {
        const foundOrder = namedOrders[0];
        const { data: items } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', foundOrder.id)
          .order('created_at', { ascending: true });

        foundOrder.order_items = items || [];
        foundOrder.items = items || [];
        return foundOrder;
      }
    } catch (e) {
      console.warn('getActiveOrderForCustomer by name notice:', e);
    }
  }

  // 3. Fallback: LocalStore by orderId
  const orders = localStore.getOrders();
  if (orderId) {
    const found = orders.find(o => {
      if (o.id !== orderId && String(o.order_number) !== String(orderId)) return false;
      if (!activeStatuses.includes(o.status)) return false;
      const existingBase = extractBaseName(o.customer_name);
      return !cleanBaseName || !existingBase || existingBase === cleanBaseName || existingBase.includes(cleanBaseName) || cleanBaseName.includes(existingBase);
    });

    if (found) return found;
  }

  // 4. Fallback: LocalStore by customer name
  if (cleanBaseName && cleanBaseName !== 'guest') {
    const foundByName = orders.find(o => {
      if (!activeStatuses.includes(o.status)) return false;
      const existingBase = extractBaseName(o.customer_name);
      return existingBase === cleanBaseName || existingBase.includes(cleanBaseName) || cleanBaseName.includes(existingBase);
    });

    if (foundByName) return foundByName;
  }

  return null;
}

// Place new order or append new items seamlessly to existing customer order (High-speed, zero lag)
export async function placeOrder({ activeOrderId = null, existingOrder = null, cartItems, customerName = 'Guest', customerPhone = '', notes = '' }) {
  if (!cartItems || cartItems.length === 0) {
    throw new Error('Cannot place an empty order.');
  }

  const cleanCustomerName = customerName.trim() || 'Guest';

  // Fast menu lookup: use local cached menu items for instantaneous 0ms lookup, avoiding network latency
  const cachedItems = localStore.getMenuItems();
  const dbMenuItems = cachedItems && cachedItems.length > 0 ? cachedItems : await getMenuItems(false);
  const dbItemMap = new Map(dbMenuItems.map(i => [i.id, i]));

  let newItemsSubtotal = 0;
  const validatedOrderItems = [];

  for (const cartItem of cartItems) {
    const dbItem = dbItemMap.get(cartItem.id) || cartItem;
    const unitPrice = Number(dbItem.price || cartItem.price || 0);
    const quantity = Number(cartItem.quantity || 1);
    const itemSubtotal = unitPrice * quantity;
    newItemsSubtotal += itemSubtotal;

    validatedOrderItems.push({
      menu_item_id: dbItem.id || cartItem.id,
      item_name: dbItem.name || cartItem.name,
      unit_price: unitPrice,
      quantity,
      notes: cartItem.selectedAddOns ? cartItem.selectedAddOns.join(', ') : (cartItem.notes || ''),
      subtotal: itemSubtotal
    });
  }

  // Check if customer already has an active unpaid order (reuse passed existingOrder to eliminate network latency)
  const existingActiveOrder = existingOrder || (await getActiveOrderForCustomer(activeOrderId, cleanCustomerName));

  if (existingActiveOrder) {
    // MERGE & APPEND items directly into existing active order!
    const combinedNotes = notes 
      ? (existingActiveOrder.notes ? `${existingActiveOrder.notes} | ${notes}` : notes)
      : existingActiveOrder.notes;

    const existingItems = existingActiveOrder.order_items || existingActiveOrder.items || [];
    const allItems = [...existingItems, ...validatedOrderItems];
    const trueSubtotal = allItems.reduce((sum, i) => sum + Number(i.subtotal || (i.unit_price * i.quantity)), 0);

    const finalCustomerName = (cleanCustomerName && cleanCustomerName !== 'Guest')
      ? cleanCustomerName
      : (existingActiveOrder.customer_name || 'Guest');

    const updatedObj = {
      ...existingActiveOrder,
      customer_name: finalCustomerName,
      status: 'NEW',
      subtotal: trueSubtotal,
      total_amount: trueSubtotal,
      notes: combinedNotes,
      updated_at: new Date().toISOString(),
      items: allItems,
      order_items: allItems
    };

    // Update localStore immediately for instant optimistic UI
    const orders = localStore.getOrders();
    const idx = orders.findIndex(o => o.id === existingActiveOrder.id);
    if (idx !== -1) {
      orders[idx] = updatedObj;
    } else {
      orders.unshift(updatedObj);
    }
    localStore.saveOrders(orders);
    notifyRealtimeOrders('new_order_placed', { orderId: existingActiveOrder.id, customerName: finalCustomerName, isAppend: true });

    // Sync to Supabase in parallel
    if (isLiveSupabaseConfigured && supabase) {
      const orderItemsPayload = validatedOrderItems.map(item => ({
        order_id: existingActiveOrder.id,
        menu_item_id: isValidUUID(item.menu_item_id) ? item.menu_item_id : null,
        item_name: item.item_name,
        unit_price: Number(item.unit_price),
        quantity: Number(item.quantity),
        notes: item.notes || '',
        subtotal: Number(item.subtotal)
      }));

      Promise.all([
        supabase.from('order_items').insert(orderItemsPayload),
        supabase.from('orders').update({
          status: 'NEW',
          subtotal: trueSubtotal,
          total_amount: trueSubtotal,
          customer_name: finalCustomerName,
          notes: combinedNotes,
          updated_at: new Date().toISOString()
        }).eq('id', existingActiveOrder.id)
      ]).catch(err => {
        console.warn('Background Supabase append error (safely cached locally):', err);
      });
    }

    return updatedObj;
  }

  // If NO active order exists for this customer, CREATE NEW ORDER
  const taxAmount = 0;
  const discountAmount = 0;
  const totalAmount = newItemsSubtotal + taxAmount - discountAmount;

  if (isLiveSupabaseConfigured && supabase) {
    try {
      const orderPromise = supabase
        .from('orders')
        .insert([{
          table_id: null,
          status: 'NEW',
          subtotal: newItemsSubtotal,
          tax_amount: taxAmount,
          discount_amount: discountAmount,
          total_amount: totalAmount,
          customer_name: cleanCustomerName,
          customer_phone: customerPhone,
          notes: notes
        }])
        .select()
        .limit(1);

      // 3.5s timeout protection against poor cellular data / network lag
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Network timeout')), 3500)
      );

      const { data: orderData, error: orderError } = await Promise.race([orderPromise, timeoutPromise]);

      const createdOrder = orderData && orderData.length > 0 ? orderData[0] : null;

      if (!orderError && createdOrder) {
        const orderItemsPayload = validatedOrderItems.map(item => ({
          order_id: createdOrder.id,
          menu_item_id: isValidUUID(item.menu_item_id) ? item.menu_item_id : null,
          item_name: item.item_name,
          unit_price: Number(item.unit_price),
          quantity: Number(item.quantity),
          notes: item.notes || '',
          subtotal: Number(item.subtotal)
        }));

        supabase.from('order_items').insert(orderItemsPayload).catch(e => console.warn('Order items insert bg:', e));

        const fullOrder = { ...createdOrder, order_items: validatedOrderItems, items: validatedOrderItems };

        const orders = localStore.getOrders();
        orders.unshift(fullOrder);
        localStore.saveOrders(orders);
        notifyRealtimeOrders('new_order_placed', { orderId: createdOrder.id, customerName: cleanCustomerName, isAppend: false });

        return fullOrder;
      }
    } catch (netErr) {
      console.warn('Supabase order creation network notice (falling back to fast local sync):', netErr);
    }
  }

  // Local Storage Fallback Mode
  const orders = localStore.getOrders();
  const nextOrderNumber = orders.length > 0 ? Math.max(...orders.map(o => o.order_number || 0)) + 1 : 1;

  const newOrder = {
    id: 'ord-' + Date.now(),
    order_number: nextOrderNumber,
    table_id: null,
    status: 'NEW',
    subtotal: newItemsSubtotal,
    tax_amount: taxAmount,
    discount_amount: discountAmount,
    total_amount: totalAmount,
    customer_name: cleanCustomerName,
    customer_phone: customerPhone,
    notes,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    items: validatedOrderItems.map((item, idx) => ({ id: 'oi-' + Date.now() + '-' + idx, ...item })),
    order_items: validatedOrderItems.map((item, idx) => ({ id: 'oi-' + Date.now() + '-' + idx, ...item }))
  };

  orders.unshift(newOrder);
  localStore.saveOrders(orders);
  notifyRealtimeOrders('new_order_placed', { orderId: newOrder.id, customerName: cleanCustomerName, isAppend: false });
  return newOrder;
}

// Fetch all active orders with joined order_items guaranteed!
export async function getActiveOrders() {
  if (isLiveSupabaseConfigured && supabase) {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !orders) {
      console.error('Supabase fetch active orders error:', error);
      return localStore.getOrders();
    }

    // Fetch order_items for all orders to guarantee complete item lists
    const { data: allItems } = await supabase.from('order_items').select('*');
    const itemsMap = new Map();
    if (allItems) {
      allItems.forEach(i => {
        if (!itemsMap.has(i.order_id)) itemsMap.set(i.order_id, []);
        itemsMap.get(i.order_id).push(i);
      });
    }

    return orders.map(o => ({
      ...o,
      order_items: itemsMap.get(o.id) || [],
      items: itemsMap.get(o.id) || []
    }));
  }
  return localStore.getOrders();
}

// Fetch single order details by ID
export async function getOrderById(orderId) {
  if (isLiveSupabaseConfigured && supabase && orderId) {
    try {
      let query = supabase.from('orders').select('*');
      if (isValidUUID(orderId)) {
        query = query.eq('id', orderId);
      } else if (!isNaN(Number(orderId))) {
        query = query.eq('order_number', Number(orderId));
      } else {
        query = query.eq('id', orderId);
      }

      const { data, error } = await query.limit(1);

      if (!error && data && data.length > 0) {
        const order = data[0];
        const { data: items } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);

        order.order_items = items || [];
        order.items = items || [];
        return order;
      }
    } catch (err) {
      console.error('Supabase getOrderById error:', err);
    }
  }

  const orders = localStore.getOrders();
  return orders.find(o => o.id === orderId || String(o.order_number) === String(orderId)) || null;
}

// Update order status
export async function updateOrderStatus(orderId, newStatus) {
  const validStatuses = ['NEW', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'BILL_REQUESTED', 'COMPLETED', 'CANCELLED'];
  if (!validStatuses.includes(newStatus)) {
    throw new Error(`Invalid status transition to ${newStatus}`);
  }

  const timestampFields = {};
  if (newStatus === 'SERVED') timestampFields.served_at = new Date().toISOString();
  if (newStatus === 'COMPLETED') timestampFields.completed_at = new Date().toISOString();
  if (newStatus === 'CANCELLED') timestampFields.cancelled_at = new Date().toISOString();

  if (isLiveSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
        ...timestampFields
      })
      .eq('id', orderId)
      .select('*, order_items(*)');

    if (error) {
      console.error('Supabase update order status error:', error);
      throw error;
    }
    notifyRealtimeOrders('order_updated', { orderId, newStatus });
    return data && data.length > 0 ? data[0] : null;
  }

  const orders = localStore.getOrders();
  const index = orders.findIndex(o => o.id === orderId || String(o.order_number) === String(orderId));
  if (index !== -1) {
    orders[index] = {
      ...orders[index],
      status: newStatus,
      updated_at: new Date().toISOString(),
      ...timestampFields
    };
    localStore.saveOrders(orders);
    notifyRealtimeOrders('order_updated', { orderId, newStatus });
    return orders[index];
  }
  throw new Error('Order not found');
}

// Delete a single order by ID
export async function deleteOrder(orderId) {
  if (isLiveSupabaseConfigured && supabase) {
    try {
      await supabase.from('order_items').delete().eq('order_id', orderId);
      await supabase.from('payments').delete().eq('order_id', orderId);
      const { error } = await supabase.from('orders').delete().eq('id', orderId);
      
      if (error) {
        console.warn('Supabase hard delete error (likely RLS), cancelling order instead:', error);
        await supabase.from('orders').update({ status: 'CANCELLED' }).eq('id', orderId);
      }
    } catch (e) {
      console.error('Supabase delete order catch error:', e);
      try {
        await supabase.from('orders').update({ status: 'CANCELLED' }).eq('id', orderId);
      } catch (err) {}
    }
  }

  const orders = localStore.getOrders().filter(o => o.id !== orderId && String(o.order_number) !== String(orderId));
  localStore.saveOrders(orders);
  notifyRealtimeOrders('order_deleted', { orderId });
  return true;
}

// Delete ALL orders from system
export async function deleteAllOrders() {
  if (isLiveSupabaseConfigured && supabase) {
    try {
      // 1. Fetch all existing order IDs
      const { data: allOrders, error: fetchErr } = await supabase.from('orders').select('id');
      
      if (!fetchErr && allOrders && allOrders.length > 0) {
        const ids = allOrders.map(o => o.id);

        // Try hard delete child tables & orders
        await supabase.from('order_items').delete().in('order_id', ids);
        await supabase.from('payments').delete().in('order_id', ids);
        const { error: deleteErr } = await supabase.from('orders').delete().in('id', ids);

        if (deleteErr) {
          console.warn('Supabase delete all orders error (RLS fallback cancel):', deleteErr);
          // Fallback: update status of all active orders to CANCELLED so dashboard is wiped
          await supabase.from('orders').update({ status: 'CANCELLED' }).in('id', ids);
        }
      }
    } catch (e) {
      console.error('Supabase deleteAllOrders error:', e);
    }
  }

  localStore.saveOrders([]);
  localStore.savePayments([]);
  notifyRealtimeOrders('orders_cleared', {});
  return true;
}
