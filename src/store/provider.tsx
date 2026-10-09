'use client';

import React, { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { store, useAppDispatch, useAppSelector } from './index';
import {
  useViewCartQuery,
  useMergeCartMutation,
  convertServerCartItemToClient,
  getCartSessionId,
} from './api/cartApi';
import { setCartFromServer, replaceCartState, clearCart } from './slices/cartSlice';

function CartSyncManager() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const [mergeCart] = useMergeCartMutation();

  const isInitialMergeDoneRef = useRef(false);
  const prevTokenRef = useRef(token);

  // Background sync for logged-in user (lightweight 4s poll + focus refetch across profiles/devices)
  const { data: serverCart, refetch } = useViewCartQuery(undefined, {
    skip: !token,
    pollingInterval: 4000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  // Handle logout: Clear cart state so guest browsing after logout starts fresh
  useEffect(() => {
    if (prevTokenRef.current && !token) {
      dispatch(clearCart());
      isInitialMergeDoneRef.current = false;
    }
    prevTokenRef.current = token;
  }, [token, dispatch]);

  // 1. Instant 0ms synchronization across open tabs & windows (Strictly identity-isolated)
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;

    const bc = new BroadcastChannel('grass_cart_channel');
    bc.onmessage = (event) => {
      const data = event.data;
      if (data?.type !== 'CART_UPDATED' || !data.state) return;

      const currentToken = store.getState().auth.token;
      const currentAuthUser = store.getState().auth.user;
      const currentUserId = currentToken && currentAuthUser ? currentAuthUser.id : null;
      const currentSessionId = getCartSessionId();

      if (currentUserId) {
        // Tab is LOGGED IN: ONLY accept updates from the same authenticated user!
        if (data.userId && String(data.userId) === String(currentUserId)) {
          dispatch(replaceCartState(data.state));
        }
      } else {
        // Tab is GUEST (NOT LOGGED IN): ONLY accept updates from the same guest session!
        if (!data.userId && data.sessionId && data.sessionId === currentSessionId) {
          dispatch(replaceCartState(data.state));
        }
      }
    };

    // Fallback: cross-tab storage event synchronization
    const handleStorage = (e: StorageEvent) => {
      if (!e.newValue) return;
      const currentToken = store.getState().auth.token;
      const currentAuthUser = store.getState().auth.user;
      const currentUserId = currentToken && currentAuthUser ? currentAuthUser.id : null;
      const currentSessionId = getCartSessionId();

      const expectedKey = currentUserId
        ? `grass_cart_user_${currentUserId}`
        : `grass_cart_guest_${currentSessionId}`;

      if (e.key === expectedKey) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed && Array.isArray(parsed.items)) {
            dispatch(replaceCartState(parsed));
          }
        } catch {
          // Ignore parse errors
        }
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      bc.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, [dispatch]);

  // 2. Initial Smart Merge on Login/Page Refresh: If unmerged local items exist, merge into server cart
  useEffect(() => {
    if (!token) {
      isInitialMergeDoneRef.current = false;
      return;
    }

    if (!isInitialMergeDoneRef.current) {
      isInitialMergeDoneRef.current = true;
      const currentLocal = store.getState().cart.items;
      if (currentLocal && currentLocal.length > 0) {
        const payloadItems = currentLocal.map((it) => ({
          productId: it.productId,
          quantity: it.quantity,
        }));

        mergeCart({
          guest_session_id: getCartSessionId(),
          local_items: payloadItems,
        })
          .unwrap()
          .then((merged) => {
            if (merged?.items) {
              const clientItems = merged.items.map(convertServerCartItemToClient);
              dispatch(setCartFromServer(clientItems));
            }
          })
          .catch((err) => {
            console.warn('[Cart Initial Sync Notice]', err);
          });
      }
    }
  }, [token, mergeCart, dispatch]);

  // 3. Authoritative Live Sync: Server cart syncs into local state (with stock limits)
  useEffect(() => {
    if (!token) return;

    if (serverCart && Array.isArray(serverCart.items)) {
      const clientItems = serverCart.items.map(convertServerCartItemToClient);
      dispatch(setCartFromServer(clientItems));
    }
  }, [serverCart, token, dispatch]);

  // 4. Instant Refetch on Window Focus / Tab Switch (multi-device and cross-profile sync)
  useEffect(() => {
    if (!token) return;

    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        refetch();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [token, refetch]);

  return null;
}

interface StoreProviderProps {
  children: React.ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  return (
    <Provider store={store}>
      <CartSyncManager />
      {children}
    </Provider>
  );
}
