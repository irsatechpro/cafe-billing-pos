import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase, isLiveSupabaseConfigured, localStore } from '../lib/supabase';
import { getActiveOrders } from '../services/orderService';

export function useRealtimeOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasNewOrderAlert, setHasNewOrderAlert] = useState(false);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  const knownOrdersRef = useRef(new Map());
  const isInitialLoadRef = useRef(true);

  const fetchOrders = useCallback(async (isSilent = false) => {
    if (!isSilent && isInitialLoadRef.current) {
      setLoading(true);
    }
    try {
      const data = await getActiveOrders();

      // Check for newly arrived active orders or newly added items on existing active orders
      if (!isInitialLoadRef.current) {
        const activeOrders = data.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED');
        let hasNew = false;

        for (const ord of activeOrders) {
          if (!knownOrdersRef.current.has(ord.id)) {
            hasNew = true;
            break;
          }
          const prevOrd = knownOrdersRef.current.get(ord.id);
          const prevItemCount = (prevOrd.order_items || prevOrd.items || []).length;
          const currItemCount = (ord.order_items || ord.items || []).length;
          // Detected new items added to an existing order or status re-triggered to NEW
          if (currItemCount > prevItemCount || (ord.status === 'NEW' && prevOrd.status !== 'NEW')) {
            hasNew = true;
            break;
          }
        }

        if (hasNew) {
          setHasNewOrderAlert(true);
          playAlertSound();
        }
      }

      // Update known orders cache map
      const nextMap = new Map();
      data.forEach(o => nextMap.set(o.id, o));
      knownOrdersRef.current = nextMap;

      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch realtime orders:', err);
    } finally {
      if (isInitialLoadRef.current) {
        isInitialLoadRef.current = false;
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchOrders(false);

    let channel = null;

    if (isLiveSupabaseConfigured && supabase) {
      channel = supabase.channel('trio-bean-orders-desk', {
        config: {
          broadcast: { self: false }
        }
      });

      // 1. Direct Postgres changes on orders table
      channel
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          (payload) => {
            console.log('⚡ Supabase realtime orders change:', payload.eventType, payload.new);
            fetchOrders(true);
            if (payload.eventType === 'INSERT' || (payload.eventType === 'UPDATE' && payload.new?.status === 'NEW')) {
              setHasNewOrderAlert(true);
              playAlertSound();
            }
          }
        )
        // 2. Direct Postgres changes on order_items table
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'order_items' },
          (payload) => {
            console.log('⚡ Supabase realtime order_items change:', payload.eventType);
            fetchOrders(true);
            if (payload.eventType === 'INSERT') {
              setHasNewOrderAlert(true);
              playAlertSound();
            }
          }
        )
        // 3. Supabase WebSocket Broadcast channel (Instant push across tabs & devices)
        .on('broadcast', { event: 'new_order_placed' }, (payload) => {
          console.log('⚡ Supabase realtime broadcast: new order placed', payload);
          fetchOrders(true);
          setHasNewOrderAlert(true);
          playAlertSound();
        })
        .on('broadcast', { event: 'order_updated' }, () => {
          fetchOrders(true);
        })
        .on('broadcast', { event: 'order_paid_completed' }, () => {
          fetchOrders(true);
        })
        .on('broadcast', { event: 'order_deleted' }, () => {
          fetchOrders(true);
        })
        .on('broadcast', { event: 'orders_cleared' }, () => {
          fetchOrders(true);
        })
        .subscribe((status) => {
          setRealtimeConnected(status === 'SUBSCRIBED');
        });
    }

    // 4. LocalStore fallback events
    const unsubLocal = localStore.subscribe(() => {
      fetchOrders(true);
    });

    // 5. High-frequency Realtime Heartbeat (every 2.5 seconds)
    // Guarantees zero-refresh updates even if WebSockets are temporarily blocked
    const pollInterval = setInterval(() => {
      fetchOrders(true);
    }, 2500);

    // 6. Window focus / visibility listener
    const onWindowFocus = () => fetchOrders(true);
    window.addEventListener('focus', onWindowFocus);
    document.addEventListener('visibilitychange', onWindowFocus);

    return () => {
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
      unsubLocal();
      clearInterval(pollInterval);
      window.removeEventListener('focus', onWindowFocus);
      document.removeEventListener('visibilitychange', onWindowFocus);
    };
  }, [fetchOrders]);

  const clearNewOrderAlert = () => setHasNewOrderAlert(false);

  return { 
    orders, 
    loading, 
    refetch: () => fetchOrders(false), 
    hasNewOrderAlert, 
    clearNewOrderAlert,
    realtimeConnected 
  };
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
