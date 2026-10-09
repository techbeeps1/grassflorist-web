import { baseApi } from './baseApi';
import { Order } from '@/types/order';
import { getCartSessionId } from './cartApi';

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation<Order, Partial<Order>>({
      query: (orderPayload) => {
        const sender = orderPayload.sender;
        const recipient = orderPayload.recipient;

        const senderFirst = sender?.firstName || 'Customer';
        const senderLast = sender?.lastName || '.';
        const senderPhone = sender?.phone || recipient?.phone || '0500000000';
        const senderEmail = sender?.email || 'customer@grassflorist.com';

        const recipientName =
          recipient?.name ||
          `${recipient?.firstName || ''} ${recipient?.lastName || ''}`.trim() ||
          senderFirst;
        const recipientPhone = recipient?.phone || senderPhone;
        const locationLink = recipient?.locationLink || orderPayload.locationLink || '';

        return {
          url: '/cart/checkout',
          method: 'POST',
          body: {
            session_id: getCartSessionId(),
            order_number: (orderPayload as any).orderNumber || (orderPayload as any).order_number || undefined,
            first_name: senderFirst,
            last_name: senderLast,
            email: senderEmail,
            phone: senderPhone,
            sender_name: `${senderFirst} ${senderLast}`.trim(),
            sender_phone: senderPhone,
            recipient_name: recipientName,
            recipient_phone: recipientPhone,
            shipping_address: recipient?.street || 'Jeddah',
            address: recipient?.street || 'Jeddah',
            address_2: recipient?.district || '',
            shipping_address_link: locationLink,
            location_link: locationLink,
            city: recipient?.city || 'Jeddah',
            district: recipient?.district || '',
            state: 'Makkah',
            zip_code: '23434',
            country: 'Saudi Arabia',
            delivery_date: orderPayload.delivery?.date || '',
            delivery_time: orderPayload.delivery?.timeSlot || '',
            card_message: orderPayload.giftCard?.message || '',
            sender_name_on_card: orderPayload.giftCard?.senderName || '',
            song_link: orderPayload.songLink || orderPayload.giftCard?.songLink || '',
            payment_method: orderPayload.paymentMethod || 'mada',
            shipping_method: (orderPayload as any).shippingFee === 0 ? 'free' : 'standard',
            shipping_amount: (orderPayload as any).shippingFee ?? 0,
            coupon_code: (orderPayload as any).couponCode || (orderPayload as any).coupon_code || '',
            currency: (orderPayload as any).currency || 'SAR',
            exchange_rate: (orderPayload as any).exchange_rate || 1.0,
            currency_amount: (orderPayload as any).currency_amount,
            sar_amount: (orderPayload as any).sar_amount,
            meta_data: (orderPayload as any).meta_data,
            is_guest: true,
          },
        };
      },
      transformResponse: (res: any, _meta, arg) => {
        const ord = res.order || res;
        const orderNumber = res.order_number || ord.order_number || `ORD-${Date.now()}`;
        return {
          orderNumber,
          createdAt: ord.created_at || new Date().toISOString(),
          status: 'confirmed' as const,
          items: arg.items || [],
          recipient: arg.recipient || {
            type: 'myself' as const,
            name: `${ord.first_name || ''} ${ord.last_name || ''}`.trim(),
            phone: ord.customer_phone || ord.phone || '',
            city: ord.city || 'Jeddah',
            district: ord.district || '',
            street: ord.address || '',
          },
          delivery: arg.delivery || {
            date: new Date().toISOString().split('T')[0],
            timeSlot: 'afternoon' as const,
          },
          giftCard: arg.giftCard,
          paymentMethod: arg.paymentMethod || 'mada',
          subtotal: arg.subtotal || 0,
          vat: arg.vat || 0,
          shippingFee: arg.shippingFee || 0,
          discount: arg.discount || 0,
          total: arg.total || 0,
        };
      },
      invalidatesTags: ['Order', 'Cart'],
    }),

    getOrderByNumber: builder.query<Order | null, string>({
      query: (orderNumber) => `/orders/${encodeURIComponent(orderNumber)}`,
      transformResponse: (res: any) => {
        const ord = res.data?.order || res.order || res;
        const items = res.data?.items || res.items || [];
        if (!ord) return null;
        return {
          orderNumber: ord.order_number || `ORD-${ord.id}`,
          createdAt: ord.created_at || new Date().toISOString(),
          status: 'confirmed' as const,
          items: items.map((it: any) => ({
            cartItemId: String(it.id),
            productId: String(it.product_id),
            product: {
              id: String(it.product_id),
              name: { ar: it.product_name, en: it.product_name },
              slug: { ar: String(it.product_id), en: String(it.product_id) },
              price: Number(it.price || 0),
              currency: 'SAR',
              images: it.product_image ? [it.product_image] : [],
              thumbnail: it.product_image || '',
              category: { ar: '', en: '' },
              categorySlug: '',
              rating: 5,
              reviewCount: 1,
              stock: 10,
              sku: '',
              tags: [],
              availability: 'in_stock' as const,
              description: { ar: '', en: '' },
              shortDescription: { ar: '', en: '' },
              seoTitle: { ar: '', en: '' },
              seoDescription: { ar: '', en: '' },
            },
            quantity: Number(it.quantity || 1),
            itemTotal: Number(it.total || it.price * it.quantity || 0),
          })),
          recipient: {
            type: 'myself' as const,
            name: `${ord.first_name || ''} ${ord.last_name || ''}`.trim(),
            phone: ord.customer_phone || ord.phone || '',
            city: ord.city || '',
            district: ord.district || '',
            street: ord.address || '',
          },
          delivery: {
            date: ord.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
            timeSlot: 'afternoon' as const,
          },
          paymentMethod: 'mada' as const,
          subtotal: Number(ord.subtotal || 0),
          vat: Number(ord.tax_amount || 0),
          shippingFee: Number(ord.shipping_amount || 0),
          discount: Number(ord.discount_amount || 0),
          total: Number(ord.total_amount || 0),
        };
      },
      providesTags: (_res, _err, id) => [{ type: 'Order', id }],
    }),
  }),
});

export const { useCreateOrderMutation, useGetOrderByNumberQuery } = ordersApi;
