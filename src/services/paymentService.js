import { supabase, isLiveSupabaseConfigured, localStore } from '../lib/supabase';
import { updateOrderStatus } from './orderService';

// Record payment for single or combined customer orders (CASH, UPI, CARD)
export async function recordPayment({ orderId, orderIds = [], paymentMethod, amount, transactionRef = '', staffId = null }) {
  const validMethods = ['CASH', 'UPI', 'CARD', 'ONLINE'];
  if (!validMethods.includes(paymentMethod)) {
    throw new Error(`Invalid payment method ${paymentMethod}`);
  }

  const idsToProcess = orderIds.length > 0 ? orderIds : [orderId];
  const primaryId = idsToProcess[0];

  const paymentPayload = {
    order_id: primaryId,
    payment_method: paymentMethod,
    payment_status: 'PAID',
    amount: Number(amount),
    transaction_reference: transactionRef || `REF-${Date.now().toString(36).toUpperCase()}`,
    paid_at: new Date().toISOString(),
    paid_by: staffId
  };

  if (isLiveSupabaseConfigured && supabase) {
    try {
      // 1. Insert payment record into payments table
      const { error: paymentError } = await supabase
        .from('payments')
        .insert([paymentPayload]);

      if (paymentError) {
        console.warn('Supabase payment insert RLS notice:', paymentError.message);
      }
    } catch (err) {
      console.warn('Supabase payment insert catch error:', err);
    }

    // 2. ALWAYS mark all associated customer orders as COMPLETED!
    for (const id of idsToProcess) {
      await updateOrderStatus(id, 'COMPLETED');
    }
  }

  // ALSO save to local fallback store to guarantee payment history is preserved
  const payments = localStore.getPayments();
  const newPayment = {
    id: 'pay-' + Date.now(),
    ...paymentPayload,
    created_at: new Date().toISOString()
  };

  payments.push(newPayment);
  localStore.savePayments(payments);

  // Update status for all associated orders in local store as well
  for (const id of idsToProcess) {
    await updateOrderStatus(id, 'COMPLETED');
  }

  return newPayment;
}

// Fetch all payment records
export async function getPayments() {
  if (isLiveSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        orders (order_number, total_amount, table_id, customer_name)
      `)
      .order('paid_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch payments error:', error);
      return localStore.getPayments();
    }
    return data;
  }
  return localStore.getPayments();
}
