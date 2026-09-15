import { baseApi } from './baseApi';
import { Order } from '@/types/order';

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation<Order, Partial<Order>>({
      queryFn: async (orderPayload) => {
        // Simulate order creation API latency
        await new Promise((resolve) => setTimeout(resolve, 800));

        const orderNumber = `FLR-${Math.floor(100000 + Math.random() * 900000)}`;
        const createdOrder: Order = {
          orderNumber,
          createdAt: new Date().toISOString(),
          status: 'confirmed',
          items: orderPayload.items || [],
          recipient: orderPayload.recipient || {
            type: 'myself',
            name: '',
            phone: '',
            city: 'Riyadh',
            district: '',
            street: '',
          },
          delivery: orderPayload.delivery || {
            date: new Date().toISOString().split('T')[0],
            timeSlot: 'afternoon',
          },
          giftCard: orderPayload.giftCard,
          paymentMethod: orderPayload.paymentMethod || 'mada',
          subtotal: orderPayload.subtotal || 0,
          vat: orderPayload.vat || 0,
          shippingFee: orderPayload.shippingFee || 0,
          discount: orderPayload.discount || 0,
          total: orderPayload.total || 0,
        };

        return { data: createdOrder };
      },
      invalidatesTags: ['Order', 'Cart'],
    }),
  }),
});

export const { useCreateOrderMutation } = ordersApi;
