import { baseApi } from './baseApi';
import { Product } from '@/types/product';
import { mapLaravelProductToProduct } from '@/lib/wordpress/store-api';

export const wishlistApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWishlist: builder.query<Product[], void>({
      query: () => '/my-account/view-wishlist',
      transformResponse: (res: any) => {
        if (!Array.isArray(res)) return [];
        return res.map((item: any) => {
          const prod = item.product || item;
          return mapLaravelProductToProduct(prod);
        });
      },
      providesTags: ['Wishlist'],
    }),

    getWishlistIds: builder.query<number[], void>({
      query: () => '/my-account/view-wishlistid',
      providesTags: ['Wishlist'],
    }),

    addToWishlist: builder.mutation<{ success: boolean; message: string }, string | number>({
      query: (productId) => ({
        url: '/my-account/add-wishlist',
        method: 'POST',
        body: { product_id: Number(productId) },
      }),
      invalidatesTags: ['Wishlist'],
    }),

    removeFromWishlistServer: builder.mutation<{ success: boolean; message: string }, string | number>({
      query: (productId) => ({
        url: '/my-account/delete-wishlist',
        method: 'DELETE',
        body: { product_id: Number(productId) },
      }),
      invalidatesTags: ['Wishlist'],
    }),
  }),
});

export const {
  useGetWishlistQuery,
  useGetWishlistIdsQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistServerMutation,
} = wishlistApi;
