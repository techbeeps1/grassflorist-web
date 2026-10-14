'use client';

import { useCallback, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  useGetWishlistQuery,
  useGetWishlistIdsQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistServerMutation,
} from '@/store/api/wishlistApi';
import {
  setWishlist,
  setWishlistIds,
  addItemToWishlist,
  removeItemFromWishlist,
  selectIsInWishlist,
  selectWishlistCount,
  selectWishlistItems,
} from '@/store/slices/wishlistSlice';
import { addToast } from '@/store/slices/uiSlice';
import { Product } from '@/types/product';
import { Locale } from '@/config/site';

export function useWishlist(locale?: Locale) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const activeLocale: Locale =
    locale || (pathname?.startsWith('/en') ? 'en' : 'ar');
  const isAr = activeLocale === 'ar';

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const items = useAppSelector(selectWishlistItems);
  const count = useAppSelector(selectWishlistCount);

  // Live backend sync: ONLY fetch when user is authenticated
  const {
    data: serverProducts,
    isLoading: isWishlistLoading,
    refetch: refetchWishlist,
  } = useGetWishlistQuery(undefined, {
    skip: !isAuthenticated,
    refetchOnMountOrArgChange: true,
  });

  const {
    data: serverIds,
    refetch: refetchIds,
  } = useGetWishlistIdsQuery(undefined, {
    skip: !isAuthenticated,
    refetchOnMountOrArgChange: true,
  });

  // Sync server items into Redux state when returned
  useEffect(() => {
    if (isAuthenticated && serverProducts && Array.isArray(serverProducts)) {
      dispatch(setWishlist(serverProducts));
    }
  }, [isAuthenticated, serverProducts, dispatch]);

  // Sync server IDs into Redux state when returned
  useEffect(() => {
    if (isAuthenticated && serverIds && Array.isArray(serverIds)) {
      dispatch(setWishlistIds(serverIds));
    }
  }, [isAuthenticated, serverIds, dispatch]);

  const [addWishlistMutation] = useAddToWishlistMutation();
  const [removeWishlistMutation] = useRemoveFromWishlistServerMutation();

  const checkIsInWishlist = useCallback(
    (productId: string | number) => {
      if (!isAuthenticated) return false;
      const numId = Number(productId);
      return items.some((p) => String(p.id) === String(productId) || Number(p.id) === numId);
    },
    [isAuthenticated, items]
  );

  const toggleWishlist = useCallback(
    async (product: Product): Promise<boolean> => {
      if (!isAuthenticated) {
        // Without login, wishlist option must NOT work
        dispatch(
          addToast({
            type: 'error',
            message: isAr
              ? 'يرجى تسجيل الدخول أولاً لحفظ المنتجات في قائمة أمنياتك'
              : 'Please log in first to save items to your wishlist',
          })
        );

        const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '';
        const redirectParam = currentPath ? `?redirect=${encodeURIComponent(currentPath)}` : '';
        const loginUrl = isAr ? `/login${redirectParam}` : `/en/login${redirectParam}`;
        router.push(loginUrl);
        return false;
      }

      const isAlreadyIn = checkIsInWishlist(product.id);

      if (isAlreadyIn) {
        // Optimistic removal
        dispatch(removeItemFromWishlist(product.id));
        try {
          await removeWishlistMutation(product.id).unwrap();
          dispatch(
            addToast({
              type: 'info',
              message: isAr
                ? 'تمت إزالة المنتج من المفضلة'
                : 'Removed from wishlist',
            })
          );
          return true;
        } catch {
          // Rollback on server error
          dispatch(addItemToWishlist(product));
          dispatch(
            addToast({
              type: 'error',
              message: isAr
                ? 'تعذر تحديث المفضلة، يرجى المحاولة لاحقاً'
                : 'Failed to update wishlist. Please try again.',
            })
          );
          return false;
        }
      } else {
        // Optimistic addition
        dispatch(addItemToWishlist(product));
        try {
          await addWishlistMutation(product.id).unwrap();
          dispatch(
            addToast({
              type: 'success',
              message: isAr
                ? 'تمت إضافة المنتج إلى المفضلة'
                : 'Added to wishlist',
            })
          );
          return true;
        } catch {
          // Rollback on server error
          dispatch(removeItemFromWishlist(product.id));
          dispatch(
            addToast({
              type: 'error',
              message: isAr
                ? 'تعذر إضافة المنتج إلى المفضلة'
                : 'Failed to add to wishlist.',
            })
          );
          return false;
        }
      }
    },
    [isAuthenticated, checkIsInWishlist, isAr, dispatch, router, addWishlistMutation, removeWishlistMutation]
  );

  const removeFromWishlist = useCallback(
    async (productId: string | number): Promise<boolean> => {
      if (!isAuthenticated) return false;

      dispatch(removeItemFromWishlist(productId));
      try {
        await removeWishlistMutation(productId).unwrap();
        dispatch(
          addToast({
            type: 'info',
            message: isAr
              ? 'تمت إزالة المنتج من المفضلة'
              : 'Removed from wishlist',
          })
        );
        return true;
      } catch {
        return false;
      }
    },
    [isAuthenticated, isAr, dispatch, removeWishlistMutation]
  );

  return {
    items: isAuthenticated ? items : [],
    count: isAuthenticated ? count : 0,
    isInWishlist: checkIsInWishlist,
    toggleWishlist,
    removeFromWishlist,
    isLoading: isWishlistLoading,
    isAuthenticated,
    refetchWishlist,
    refetchIds,
  };
}
