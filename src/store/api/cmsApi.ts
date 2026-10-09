import { baseApi } from './baseApi';

export interface GlobalSettings {
  currency?: {
    default: string;
    sar_to_usd_rate: number;
    usd_to_sar_rate: number;
    last_fetch_at?: string;
    supported: Array<{
      code: string;
      name_en: string;
      name_ar: string;
      symbol: string;
      symbol_native: string;
      rate: number;
    }>;
  };
  tax?: {
    vat_percentage: number;
    vat_registration_number?: string;
  };
  branding?: {
    site_name: { en: string; ar: string };
    site_tagline: { en: string; ar: string };
    site_logo: string;
    site_logo_dark: string;
    site_favicon: string;
  };
  topbar?: {
    enabled: boolean;
    text: { en: string; ar: string };
    phone: string;
  };
  footer?: {
    about: { en: string; ar: string };
    copyright: { en: string; ar: string };
  };
  contact?: {
    email: string;
    phone: string;
    whatsapp: string;
    address: { en: string; ar: string };
    business_hours: string;
  };
  social?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    whatsapp?: string;
    snapchat?: string;
    tiktok?: string;
    youtube?: string;
    linkedin?: string;
  };
  scripts?: {
    gtm?: { id?: string; head_code?: string; body_code?: string };
    google_analytics?: { measurement_id?: string; script_code?: string };
    meta_pixel?: { pixel_id?: string; pixel_code?: string };
    tiktok_pixel?: { pixel_id?: string };
    snapchat_pixel?: { pixel_id?: string };
    custom_head_scripts?: string;
    custom_footer_scripts?: string;
  };
  seo?: {
    sitemap?: {
      enabled: boolean;
      include_products: boolean;
      include_categories: boolean;
      include_static_pages: boolean;
      include_blog: boolean;
      excluded_paths: string[];
      excluded_paths_raw?: string;
    };
    robots?: {
      custom_content?: string;
    };
    llms?: {
      enabled: boolean;
      custom_content?: string;
    };
  };
}

export interface ContactFormPayload {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export interface GoogleReviewItem {
  id: number;
  author_name: string;
  author_photo_url?: string;
  rating: number;
  comment: string;
  language?: string;
  relative_time_description?: string;
  published_at?: string;
  is_featured?: boolean;
  source?: string;
}

export interface GoogleReviewsResponse {
  success: boolean;
  data: GoogleReviewItem[];
  meta?: {
    total_reviews: number;
    average_rating: number;
    google_business_url: string;
    write_review_url?: string;
  };
}

export const cmsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGlobalSettings: builder.query<GlobalSettings, void>({
      query: () => '/global-settings',
      transformResponse: (response: any) => response?.data || response,
      providesTags: ['Settings'],
    }),

    getContactPage: builder.query<any, void>({
      query: () => '/contact-page',
      providesTags: ['Cms'],
    }),

    getGoogleReviews: builder.query<GoogleReviewsResponse, { limit?: number; random?: boolean } | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.set('limit', String(params.limit));
        if (params?.random) queryParams.set('random', '1');
        const qs = queryParams.toString();
        return `/google-reviews${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Cms'],
    }),

    sendContactForm: builder.mutation<{ message: string }, ContactFormPayload>({
      query: (data) => ({
        url: '/contact-form',
        method: 'POST',
        body: data,
      }),
    }),

    subscribeNewsletter: builder.mutation<{ message: string }, { email: string }>({
      query: (data) => ({
        url: '/newsletter',
        method: 'POST',
        body: data,
      }),
    }),

    getCmsPageBySlug: builder.query<any, string>({
      query: (slug) => `/cms-pages/${encodeURIComponent(slug)}`,
      providesTags: (_res, _err, slug) => [{ type: 'Cms', id: slug }],
    }),
  }),
});

export const {
  useGetGlobalSettingsQuery,
  useGetContactPageQuery,
  useGetGoogleReviewsQuery,
  useSendContactFormMutation,
  useSubscribeNewsletterMutation,
  useGetCmsPageBySlugQuery,
} = cmsApi;
