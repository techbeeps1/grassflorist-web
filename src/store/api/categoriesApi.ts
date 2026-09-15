import { baseApi } from './baseApi';
import { Category } from '@/types/category';
import { categories as fallbackCategories } from '@/data/categories';
import { getStoreCategories } from '@/lib/wordpress/store-api';

export const categoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], void>({
      queryFn: async () => {
        try {
          const data = await getStoreCategories();
          return { data };
        } catch {
          return { data: fallbackCategories };
        }
      },
      providesTags: ['Category'],
    }),

    getCategoryBySlug: builder.query<Category | null, string>({
      queryFn: async (slug) => {
        try {
          const list = await getStoreCategories();
          const decoded = decodeURIComponent(slug).toLowerCase();
          const found =
            list.find((c) => c.slug.toLowerCase() === decoded || c.id === decoded) || null;
          return { data: found };
        } catch {
          const found = fallbackCategories.find((c) => c.slug === slug) || null;
          return { data: found };
        }
      },
      providesTags: (_result, _error, slug) => [{ type: 'Category', id: slug }],
    }),
  }),
});

export const { useGetCategoriesQuery, useGetCategoryBySlugQuery } = categoriesApi;
