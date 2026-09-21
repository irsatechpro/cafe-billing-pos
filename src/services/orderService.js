import { supabase, isLiveSupabaseConfigured, localStore } from '../lib/supabase';
import { getMenuItems } from './menuService';

const isValidUUID = (id) => typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

// Find active unpaid order strictly for THIS device's activeOrderId
export async function getActiveOrderForCustomer(orderId = null, customerName = '') {
  // If this device has no active order ID, it is a brand-new customer/order!
  if (!orderId) return null;

  const activeStatuses = ['NEW', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'BILL_REQUESTED'];
  const cleanName = (customerName || '').trim().toLowerCase();

  if (isLiveSupabaseConfigured && supabase) {
    try {
      const { data: activeOrders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .in('status', activeStatuses)
        .limit(1);

      if (!error && activeOrders && activeOrders.length > 0) {
        const foundOrder = activeOrders[0];
        const existingName = (foundOrder.customer_name || '').trim().toLowerCase();

        // Only match if the customer name matches this device's order!
        if (!cleanName || existingName === cleanName) {
          const { data: items } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', foundOrder.id);

          foundOrder.order_items = items || [];
          foundOrder.items = items || [];
          return foundOrder;
        }
      }

      return null;
    } catch (e) {
      console.error('getActiveOrderForCustomer error:', e);
      return null;
    }
  }

  const orders = localStore.getOrders();
  const found = orders.find(o => {
    const existingName = (o.customer_name || '').trim().toLowerCase();
    const isMatchingName = !cleanName || existingName === cleanName;
    return o.id === orderId && activeStatuses.includes(o.status) && isMatchingName;
  });

  return found || null;
}

// Place new order or append new items seamlessly to existing customer order
export async function placeOrder({ activeOrderId = null, cartItems, customerName = 'Guest', customerPhone = '', notes = '' }) {
  if (!cartItems || cartItems.length === 0) {
    throw new Error('Cannot place an empty order.');
  }

  const cleanCustomerName = customerName.trim() || 'Guest';

  // Security Rule: Fetch latest menu items from database to validate price & availability
  const dbMenuItems = await getMenuItems(true);
  const dbItemMap = new Map(dbMenuItems.map(i => [i.id, i]));

  let newItemsSubtotal = 0;
  const validatedOrderItems = [];

  for (const cartItem of cartItems) {
    const dbItem = dbItemMap.get(cartItem.id);
    if (!dbItem) {
      throw new Error(`Item "${cartItem.name}" is no longer on our menu.`);
    }
    if (!dbItem.is_available) {
      throw new Error(`Item "${dbItem.name}" is currently unavailable. Please remove it from your cart.`);
    }

    const unitPrice = Number(dbItem.price);
    const quantity = Number(cartItem.quantity);
    const itemSubtotal = unitPrice * quantity;
    newItemsSubtotal += itemSubtotal;

    validatedOrderItems.push({
      menu_item_id: dbItem.id,
      item_name: dbItem.name,
      unit_price: unitPrice,
      quantity,
      notes: cartItem.selectedAddOns ? cartItem.selectedAddOns.join(', ') : (cartItem.notes || ''),
      subtotal: itemSubtotal
    });
  }

  // Check if customer already has an active unpaid order (e.g. Order #1011)
  const existingActiveOrder = await getActiveOrderForCustomer(activeOrderId, cleanCustomerName);

  if (existingActiveOrder) {
    // MERGE & APPEND items directly into existing active order!
    const combinedNotes = notes 
      ? (existingActiveOrder.notes ? `${existingActiveOrder.notes} | ${notes}` : notes)
      : existingActiveOrder.notes;

    if (isLiveSupabaseConfigured && supabase) {
      // 1. Insert newly appended items into order_items table
      const orderItemsPayload = validatedOrderItems.map(item => ({
        order_id: existingActiveOrder.id,
        menu_item_id: isValidUUID(item.menu_item_id) ? item.menu_item_id : null,
        item_name: item.item_name,
        unit_price: Number(item.unit_price),
        quantity: Number(item.quantity),
        notes: item.notes || '',
        subtotal: Number(item.subtotal)
      }));

      const { error: insertErr } = await supabase.from('order_items').insert(orderItemsPayload);
      if (insertErr) {
        console.error('Insert appended order items error:', insertErr);
      }

      // 2. Query all items associated with this order to derive true cumulative total
      const { data: currentItems } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', existingActiveOrder.id);

      const allItems = currentItems && currentItems.length > 0 
        ? currentItems 
        : [...(existingActiveOrder.order_items || existingActiveOrder.items || []), ...validatedOrderItems];

      const trueSubtotal = allItems.reduce((sum, i) => sum + Number(i.subtotal || (i.unit_price * i.quantity)), 0);

      // 3. Update existing order subtotal and total
      await supabase
        .from('orders')
        .update({
          status: 'NEW', // Re-trigger NEW alert for kitchen
          subtotal: trueSubtotal,
          total_amount: trueSubtotal,
          customer_name: cleanCustomerName,
          notes: combinedNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingActiveOrder.id);

      // 4. ALSO update localStore so local cache is 100% in sync!
      const orders = localStore.getOrders();
      const idx = orders.findIndex(o => o.id === existingActiveOrder.id);
      const updatedObj = {
        ...existingActiveOrder,
        customer_name: cleanCustomerName,
        status: 'NEW',
        subtotal: trueSubtotal,
        total_amount: trueSubtotal,
        notes: combinedNotes,
        updated_at: new Date().toISOString(),
        items: allItems,
        order_items: allItems
      };
      if (idx !== -1) {
        orders[idx] = updatedObj;
      } else {
        orders.unshift(updatedObj);
      }
      localStore.saveOrders(orders);

      return updatedObj;
    }

    // Local Storage Fallback Mode
    const orders = localStore.getOrders();
    const index = orders.findIndex(o => o.id === existingActiveOrder.id);

    if (index !== -1) {
      const mergedItems = [
        ...(orders[index].items || orders[index].order_items || []),
        ...validatedOrderItems.map((item, idx) => ({ id: 'oi-' + Date.now() + '-' + idx, ...item }))
      ];
      const trueSubtotal = mergedItems.reduce((sum, i) => sum + Number(i.subtotal || (i.unit_price * i.quantity)), 0);

      orders[index] = {
        ...orders[index],
        customer_name: cleanCustomerName,
        status: 'NEW',
        subtotal: trueSubtotal,
        total_amount: trueSubtotal,
        notes: combinedNotes,
        updated_at: new Date().toISOString(),
        items: mergedItems,
        order_items: mergedItems
      };

      localStore.saveOrders(orders);
      return orders[index];
    }
  }

  // If NO active order exists for this customer, CREATE NEW ORDER
  const taxAmount = 0;
  const discountAmount = 0;
  const totalAmount = newItemsSubtotal + taxAmount - discountAmount;

  if (isLiveSupabaseConfigured && supabase) {
    const { data: orderData, error: orderError } = await supabase
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

    const createdOrder = orderData && orderData.length > 0 ? orderData[0] : null;

    if (orderError || !createdOrder) {
      console.error('Supabase place order error:', orderError);
      throw orderError || new Error('Failed to create order');
    }

    const orderItemsPayload = validatedOrderItems.map(item => ({
      order_id: createdOrder.id,
      menu_item_id: isValidUUID(item.menu_item_id) ? item.menu_item_id : null,
      item_name: item.item_name,
      unit_price: Number(item.unit_price),
      quantity: Number(item.quantity),
      notes: item.notes || '',
      subtotal: Number(item.subtotal)
    }));

    const { error: itemInsertErr } = await supabase.from('order_items').insert(orderItemsPayload);
    if (itemInsertErr) {
      console.error('Insert new order_items error:', itemInsertErr);
    }

    const fullOrder = { ...createdOrder, order_items: validatedOrderItems, items: validatedOrderItems };

    const orders = localStore.getOrders();
    orders.unshift(fullOrder);
    localStore.saveOrders(orders);

    return fullOrder;
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
  if (isLiveSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .limit(1);

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
  return true;
}
