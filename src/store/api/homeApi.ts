import { baseApi } from './baseApi';

export interface LaravelHomePageResponse {
  slider_section?: any;
  mobile_slider_section?: any;
  popular_section?: {
    popular_title?: any;
    popular_subtitle?: any;
    popular_category?: any[];
  };
  best_sellers_section?: {
    title?: any;
    subtitle?: any;
    products?: any[];
  };
  banner?: {
    banner_button_url?: string;
    images?: string;
  };
  category_section?: {
    cat_sec_title?: any;
    cat_sec_description?: any;
    category_sections?: any[];
  };
  seo?: {
    meta_title?: any;
    meta_description?: any;
    meta_keywords?: any;
  };
}

export const homeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getHomePage: builder.query<LaravelHomePageResponse, void>({
      query: () => '/home-page',
      providesTags: ['HomePage'],
    }),
  }),
});

export const { useGetHomePageQuery } = homeApi;
