import { baseApi } from './baseApi';
import { Product, ProductFilterState } from '@/types/product';
import { products as fallbackProducts } from '@/data/products';
import { getStoreProducts, getStoreProductBySlug } from '@/lib/wordpress/store-api';

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<
      { products: Product[]; total: number },
      ProductFilterState & { query?: string; page?: number; limit?: number }
    >({
      queryFn: async (params) => {
        try {
          const res = await getStoreProducts({
            per_page: params.limit || 24,
            page: params.page || 1,
            search: params.query,
            category: params.category,
          });

          let filtered = [...res.products];

          if (params.minPrice !== undefined) {
            filtered = filtered.filter((p) => p.price >= (params.minPrice || 0));
          }

          if (params.maxPrice !== undefined && params.maxPrice > 0) {
            filtered = filtered.filter((p) => p.price <= (params.maxPrice || Infinity));
          }

          if (params.inStockOnly) {
            filtered = filtered.filter((p) => p.availability === 'in_stock');
          }

          if (params.minRating !== undefined && params.minRating > 0) {
            filtered = filtered.filter((p) => p.rating >= (params.minRating || 0));
          }

          return { data: { products: filtered, total: res.total || filtered.length } };
        } catch {
          return { data: { products: fallbackProducts, total: fallbackProducts.length } };
        }
      },
      providesTags: ['Product'],
    }),

    getProductBySlug: builder.query<Product | null, string>({
      queryFn: async (slug) => {
        try {
          const product = await getStoreProductBySlug(slug);
          return { data: product };
        } catch {
          const found =
            fallbackProducts.find((p) => p.slug.ar === slug || p.slug.en === slug) || null;
          return { data: found };
        }
      },
      providesTags: (_result, _error, slug) => [{ type: 'Product', id: slug }],
    }),

    getFeaturedProducts: builder.query<Product[], void>({
      queryFn: async () => {
        try {
          const res = await getStoreProducts({ per_page: 4, orderby: 'popularity' });
          return { data: res.products };
        } catch {
          return { data: fallbackProducts.filter((p) => p.featured) };
        }
      },
      providesTags: ['Product'],
    }),

    getBestsellers: builder.query<Product[], void>({
      queryFn: async () => {
        try {
          const res = await getStoreProducts({ per_page: 8, orderby: 'popularity' });
          return { data: res.products };
        } catch {
          return { data: fallbackProducts.filter((p) => p.bestseller) };
        }
      },
      providesTags: ['Product'],
    }),

    getNewArrivals: builder.query<Product[], void>({
      queryFn: async () => {
        try {
          const res = await getStoreProducts({ per_page: 8, orderby: 'date', order: 'desc' });
          return { data: res.products };
        } catch {
          return { data: fallbackProducts.filter((p) => p.newArrival) };
        }
      },
      providesTags: ['Product'],
    }),

    getRelatedProducts: builder.query<Product[], { categorySlug: string; currentId: string }>({
      queryFn: async ({ categorySlug, currentId }) => {
        try {
          const res = await getStoreProducts({ category: categorySlug, per_page: 5 });
          const related = res.products.filter((p) => p.id !== currentId).slice(0, 4);
          return { data: related };
        } catch {
          const related = fallbackProducts
            .filter((p) => p.categorySlug === categorySlug && p.id !== currentId)
            .slice(0, 4);
          return { data: related };
        }
      },
      providesTags: ['Product'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductBySlugQuery,
  useGetFeaturedProductsQuery,
  useGetBestsellersQuery,
  useGetNewArrivalsQuery,
  useGetRelatedProductsQuery,
} = productsApi;
