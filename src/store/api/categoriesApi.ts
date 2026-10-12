import { baseApi } from './baseApi';
import { Category } from '@/types/category';
import { categories as fallbackCategories } from '@/data/categories';
import { getStoreCategories } from '@/lib/wordpress/store-api';
import { type Locale } from '@/config/site';

export const categoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], Locale | void>({
      queryFn: async (locale) => {
        try {
          const data = await getStoreCategories(locale || undefined);
          return { data };
        } catch {
          return { data: fallbackCategories };
        }
      },
      providesTags: ['Category'],
    }),

    getCategoryBySlug: builder.query<Category | null, { slug: string; locale?: Locale } | string>({
      queryFn: async (arg) => {
        try {
          const slug = typeof arg === 'string' ? arg : arg.slug;
          const locale = typeof arg === 'string' ? undefined : arg.locale;
          const list = await getStoreCategories(locale);
          const decoded = decodeURIComponent(slug).toLowerCase();
          const found =
            list.find((c) => c.slug.toLowerCase() === decoded || c.id === decoded) || null;
          return { data: found };
        } catch {
          const slug = typeof arg === 'string' ? arg : arg.slug;
          const found = fallbackCategories.find((c) => c.slug === slug) || null;
          return { data: found };
        }
      },
      providesTags: (_result, _error, arg) => [{ type: 'Category', id: typeof arg === 'string' ? arg : arg.slug }],
    }),
  }),
});

export const { useGetCategoriesQuery, useGetCategoryBySlugQuery } = categoriesApi;
