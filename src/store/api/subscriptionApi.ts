import { baseApi } from './baseApi';

export interface SubscriptionPlanItem {
  id: number;
  slug: string;
  name: { en: string; ar: string };
  localized_name: string;
  badge?: { en: string; ar: string } | null;
  localized_badge?: string | null;
  starting_price: number;
  original_price?: number | null;
  short_description?: { en: string; ar: string } | null;
  localized_short_description?: string;
  description?: { en: string; ar: string } | null;
  localized_description?: string;
  details_content?: { en: string; ar: string } | null;
  localized_details?: string;
  image: string;
  gallery?: string[];
  features?: string[];
  allowed_frequencies?: string[];
  duration_discounts?: Record<string, number>;
  product_id?: number | null;
}

export interface SubscriptionLandingResponse {
  success: boolean;
  data: {
    hero: {
      title: { en: string; ar: string };
      subtitle: { en: string; ar: string };
      image: string;
    };
    perks: Array<{
      id: number;
      icon: string;
      title: { en: string; ar: string };
    }>;
    how_it_works: Array<{
      step: number;
      title: { en: string; ar: string };
      description: { en: string; ar: string };
    }>;
    plans: SubscriptionPlanItem[];
  };
}

export interface SubscriptionCalculatePayload {
  product_id: number;
  quantity?: number;
  frequency: string;
  duration_type?: string;
  shipping_method_code?: string;
  custom_dates?: string[];
}

export interface SubscriptionCalculateResponse {
  success: boolean;
  data: {
    product_id: number;
    product_name: string;
    quantity: number;
    frequency: string;
    duration_type: string;
    unit_price: number;
    discount_percentage: number;
    discounted_unit_price: number;
    delivery_fee: number;
    tax_amount: number;
    total_per_delivery: number;
    estimated_total_cycles?: number;
    projected_grand_total?: number;
  };
}

export interface SubscriptionCheckoutPayload {
  product_id: number;
  quantity?: number;
  frequency: string;
  duration_type?: string;
  start_date: string;
  delivery_time_slot?: string;
  recipient_name: string;
  recipient_phone: string;
  email: string;
  address: string;
  address_2?: string;
  city?: string;
  district?: string;
  zip_code?: string;
  location_link?: string;
  card_message?: string;
  special_instructions?: string;
  payment_gateway?: string;
}

export const subscriptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubscriptionDeals: builder.query<SubscriptionLandingResponse, { locale?: string } | void>({
      query: (args) => `/subscription-plans?locale=${args?.locale || 'ar'}`,
      providesTags: ['SubscriptionPlans' as any],
    }),

    getSubscriptionDealBySlug: builder.query<
      { success: boolean; data: SubscriptionPlanItem },
      { slug: string; locale?: string }
    >({
      query: ({ slug, locale }) => `/subscription-plans/${slug}?locale=${locale || 'ar'}`,
      providesTags: (_res, _err, { slug }) => [{ type: 'SubscriptionPlans' as any, id: slug }],
    }),

    calculateSubscriptionPricing: builder.mutation<
      SubscriptionCalculateResponse,
      SubscriptionCalculatePayload
    >({
      query: (body) => ({
        url: '/subscriptions/calculate',
        method: 'POST',
        body,
      }),
    }),

    checkoutSubscription: builder.mutation<any, SubscriptionCheckoutPayload>({
      query: (body) => ({
        url: '/subscriptions/checkout',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Subscription' as any, 'Orders' as any],
    }),
  }),
});

export const {
  useGetSubscriptionDealsQuery,
  useGetSubscriptionDealBySlugQuery,
  useCalculateSubscriptionPricingMutation,
  useCheckoutSubscriptionMutation,
} = subscriptionApi;
