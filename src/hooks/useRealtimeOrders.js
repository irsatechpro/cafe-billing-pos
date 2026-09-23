import { useEffect, useState, useCallback } from 'react';
import { supabase, isLiveSupabaseConfigured, localStore } from '../lib/supabase';
import { getActiveOrders } from '../services/orderService';

export function useRealtimeOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasNewOrderAlert, setHasNewOrderAlert] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await getActiveOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();

    if (isLiveSupabaseConfigured && supabase) {
      const subscription = supabase
        .channel('public:orders-live-all')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          (payload) => {
            fetchOrders();
            if (payload.eventType === 'INSERT' || (payload.eventType === 'UPDATE' && payload.new?.status === 'NEW')) {
              setHasNewOrderAlert(true);
              playAlertSound();
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'order_items' },
          (payload) => {
            fetchOrders();
            if (payload.eventType === 'INSERT') {
              setHasNewOrderAlert(true);
              playAlertSound();
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    } else {
      // Local fallback event listener
      const unsubscribe = localStore.subscribe((event) => {
        if (event === 'orders_updated') {
          fetchOrders();
        }
      });
      return unsubscribe;
    }
  }, [fetchOrders]);

  const clearNewOrderAlert = () => setHasNewOrderAlert(false);

  return { orders, loading, refetch: fetchOrders, hasNewOrderAlert, clearNewOrderAlert };
}

function playAlertSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 note chime
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  } catch (e) {
    // Audio Context not allowed until user interaction
  }
}
