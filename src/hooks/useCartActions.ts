'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  addItem,
  updateQuantity as updateLocalQuantity,
  removeItem as removeLocalItem,
  setCartFromServer,
  setPendingAdd,
  setItemLoading,
} from '@/store/slices/cartSlice';
import {
  useAddToCartMutation,
  useUpdateCartQuantityMutation,
  useRemoveCartItemMutation,
  convertServerCartItemToClient,
} from '@/store/api/cartApi';
import { addToast, setCartDrawerOpen } from '@/store/slices/uiSlice';
import { Product } from '@/types/product';
import { CartItem } from '@/types/cart';

export function useCartActions() {
  const dispatch = useAppDispatch();
  const [addServerCart, { isLoading: isAddingServer }] = useAddToCartMutation();
  const [updateServerQty, { isLoading: isUpdatingServer }] = useUpdateCartQuantityMutation();
  const [removeServerItem, { isLoading: isRemovingServer }] = useRemoveCartItemMutation();
  
  const items = useAppSelector((state) => state.cart.items);
  const isAdding = useAppSelector((state) => Boolean(state.cart.isAdding));
  const pendingAddItem = useAppSelector((state) => state.cart.pendingAddItem);
  const updatingItemIds = useAppSelector((state) => state.cart.updatingItemIds || {});
  const removingItemIds = useAppSelector((state) => state.cart.removingItemIds || {});

  const getLocale = useCallback(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.startsWith('/en') || path.startsWith('/en/')) return 'en';
    }
    return 'ar';
  }, []);

  /**
   * Remove Item with skeleton removal animation until API responds
   */
  const handleRemoveItem = useCallback(
    async (productId: string | number, cartItemId?: string) => {
      const locale = getLocale();
      const pidStr = String(productId);
      const cId = cartItemId || pidStr;

      // 1. Mark item as removing (renders as skeleton removal row)
      dispatch(setItemLoading({ id: cId, type: 'removing', isLoading: true }));
      dispatch(setItemLoading({ id: pidStr, type: 'removing', isLoading: true }));

      // 2. Server verification
      try {
        const res = await removeServerItem({ productId: pidStr }).unwrap();
        
        // Remove locally after server confirmation
        dispatch(
          removeLocalItem({
            productId: pidStr,
            cartItemId: cId,
          })
        );

        if (res?.cart?.items && Array.isArray(res.cart.items)) {
          dispatch(setCartFromServer(res.cart.items.map(convertServerCartItemToClient)));
        }
        return true;
      } catch (err: any) {
        const errorMsg =
          err?.data?.message ||
          (locale === 'ar' ? 'تعذر حذف المنتج من السلة' : 'Failed to remove item from cart');

        dispatch(
          addToast({
            type: 'error',
            message: errorMsg,
          })
        );

        if (err?.data?.cart?.items && Array.isArray(err.data.cart.items)) {
          dispatch(setCartFromServer(err.data.cart.items.map(convertServerCartItemToClient)));
        }
        return false;
      } finally {
        dispatch(setItemLoading({ id: cId, type: 'removing', isLoading: false }));
        dispatch(setItemLoading({ id: pidStr, type: 'removing', isLoading: false }));
      }
    },
    [dispatch, removeServerItem, getLocale]
  );

  /**
   * Add Item to Cart with skeleton loading animation until server API responds
   */
  const handleAddToCart = useCallback(
    async (
      product: Product,
      qty: number = 1,
      options?: {
        openDrawer?: boolean;
        addons?: CartItem['addons'];
        isSubscription?: boolean;
        subscriptionConfig?: CartItem['subscriptionConfig'];
        discountedPrice?: number;
      }
    ) => {
      const locale = getLocale();
      const availableStock = product.stock !== undefined ? product.stock : 99;

      if (availableStock <= 0) {
        dispatch(
          addToast({
            type: 'error',
            message: locale === 'ar' ? 'عذراً، هذا المنتج غير متوفر حالياً' : 'Sorry, this product is out of stock',
          })
        );
        return false;
      }

      const isSub = Boolean(options?.isSubscription);
      const subFreq = options?.subscriptionConfig?.frequency || 'weekly';
      const effectiveUnitPrice = isSub && options?.discountedPrice ? options.discountedPrice : product.price;
      const cartItemId = isSub ? `${product.id}-sub-${subFreq}` : String(product.id);

      // Check current quantity in cart
      const currentItem = items.find(
        (i) => i.cartItemId === cartItemId || (String(i.productId) === String(product.id) && Boolean(i.isSubscription) === isSub)
      );
      const currentQty = currentItem ? currentItem.quantity : 0;
      const targetQty = currentQty + qty;

      if (availableStock > 0 && targetQty > availableStock) {
        dispatch(
          addToast({
            type: 'error',
            message:
              locale === 'ar'
                ? `الكمية المتاحة في المخزون هي ${availableStock} فقط`
                : `Only ${availableStock} items available in stock`,
          })
        );
        return false;
      }

      // 1. Show skeleton placeholder at top of cart & open drawer
      dispatch(
        setPendingAdd({
          productId: cartItemId,
          product,
          quantity: qty,
        })
      );

      if (options?.openDrawer !== false) {
        dispatch(setCartDrawerOpen(true));
      }

      // 2. Server verification
      try {
        const res = await addServerCart({
          productId: product.id,
          quantity: qty,
          isSubscription: isSub,
          metaData: isSub
            ? {
                is_subscription: true,
                frequency: options?.subscriptionConfig?.frequency,
                duration_type: options?.subscriptionConfig?.durationType,
                start_date: options?.subscriptionConfig?.startDate,
                time_slot: options?.subscriptionConfig?.timeSlot,
                discount_percentage: options?.subscriptionConfig?.discountPercent,
              }
            : undefined,
        }).unwrap();

        if (res?.cart?.items && Array.isArray(res.cart.items)) {
          // Reconcile with authoritative server cart
          dispatch(setCartFromServer(res.cart.items.map(convertServerCartItemToClient)));
        } else {
          dispatch(
            addItem({
              cartItemId,
              productId: String(product.id),
              product,
              quantity: qty,
              itemTotal: effectiveUnitPrice * qty,
              addons: options?.addons,
              isSubscription: isSub,
              subscriptionConfig: options?.subscriptionConfig,
            })
          );
        }
        return true;
      } catch (err: any) {
        const errorMsg =
          err?.data?.message ||
          (locale === 'ar' ? 'تعذر إضافة المنتج إلى السلة' : 'Failed to add item to cart');

        dispatch(
          addToast({
            type: 'error',
            message: errorMsg,
          })
        );

        if (err?.data?.cart?.items && Array.isArray(err.data.cart.items)) {
          dispatch(setCartFromServer(err.data.cart.items.map(convertServerCartItemToClient)));
        }
        return false;
      } finally {
        dispatch(setPendingAdd(null));
      }
    },
    [dispatch, items, addServerCart, getLocale]
  );

  /**
   * Update Item Quantity with skeleton loading effect until API responds
   */
  const handleUpdateQuantity = useCallback(
    async (productId: string | number, targetQty: number, cartItemId?: string) => {
      const locale = getLocale();
      const pidStr = String(productId);
      const cId = cartItemId || pidStr;

      if (targetQty <= 0) {
        return handleRemoveItem(productId, cId);
      }

      const currentItem = items.find(
        (i) => String(i.productId) === pidStr || i.cartItemId === cId
      );
      const availableStock = currentItem?.product?.stock !== undefined ? currentItem.product.stock : 99;

      if (availableStock > 0 && targetQty > availableStock) {
        dispatch(
          addToast({
            type: 'error',
            message:
              locale === 'ar'
                ? `الكمية المتاحة بالمخزون هي ${availableStock} فقط`
                : `Only ${availableStock} units available in stock`,
          })
        );
        targetQty = availableStock;
      }

      // 1. Mark item as updating (displays skeleton pulse on quantity & price)
      dispatch(setItemLoading({ id: cId, type: 'updating', isLoading: true }));
      dispatch(setItemLoading({ id: pidStr, type: 'updating', isLoading: true }));

      // 2. Server verification with EXACT quantity
      try {
        const res = await updateServerQty({
          productId: pidStr,
          quantity: targetQty,
        }).unwrap();

        if (res?.cart?.items && Array.isArray(res.cart.items)) {
          dispatch(setCartFromServer(res.cart.items.map(convertServerCartItemToClient)));
        } else {
          dispatch(
            updateLocalQuantity({
              productId: pidStr,
              cartItemId: cId,
              quantity: targetQty,
            })
          );
        }
        return true;
      } catch (err: any) {
        const errorMsg =
          err?.data?.message ||
          (locale === 'ar' ? 'تعذر تحديث كمية المنتج' : 'Failed to update quantity');

        dispatch(
          addToast({
            type: 'error',
            message: errorMsg,
          })
        );

        if (err?.data?.cart?.items && Array.isArray(err.data.cart.items)) {
          dispatch(setCartFromServer(err.data.cart.items.map(convertServerCartItemToClient)));
        }
        return false;
      } finally {
        dispatch(setItemLoading({ id: cId, type: 'updating', isLoading: false }));
        dispatch(setItemLoading({ id: pidStr, type: 'updating', isLoading: false }));
      }
    },
    [dispatch, items, updateServerQty, handleRemoveItem, getLocale]
  );

  return {
    addToCart: handleAddToCart,
    updateQuantity: handleUpdateQuantity,
    removeItem: handleRemoveItem,
    isAdding,
    pendingAddItem,
    updatingItemIds,
    removingItemIds,
    isAddingServer,
    isUpdatingServer,
    isRemovingServer,
  };
}
