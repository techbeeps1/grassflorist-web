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
        const senderPhone = sender?.phone || recipient?.phone || '';
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
            order_language:
              typeof window !== 'undefined' &&
              (window.location.pathname.startsWith('/en') || window.location.pathname.startsWith('/en/'))
                ? 'en'
                : 'ar',
            locale:
              typeof window !== 'undefined' &&
              (window.location.pathname.startsWith('/en') || window.location.pathname.startsWith('/en/'))
                ? 'en'
                : 'ar',
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
            shipping_method: (orderPayload as any).shipping_method || (orderPayload as any).shippingMethod || ((orderPayload as any).shippingFee === 0 ? 'free' : 'inside_jeddah'),
            shipping_amount: (orderPayload as any).shippingFee ?? (orderPayload as any).shipping_amount ?? 0,
            coupon_code: (orderPayload as any).couponCode || (orderPayload as any).coupon_code || '',
            items: (orderPayload.items || []).map((it: any) => ({
              product_id: Number(it.productId || it.product_id),
              quantity: Number(it.quantity || 1),
              price: Number(it.product?.price ?? it.price ?? (it.itemTotal ? it.itemTotal / it.quantity : 0)),
            })),
            subtotal: (orderPayload as any).subtotal ?? 0,
            tax_amount: (orderPayload as any).vat ?? (orderPayload as any).taxAmount ?? 0,
            discount_amount: (orderPayload as any).discount ?? 0,
            total_amount: (orderPayload as any).total ?? 0,
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
          alreadyPaid: Boolean(res.already_paid || ord.payment_status === 'paid'),
          paymentStatus: ord.payment_status || (res.already_paid ? 'paid' : 'pending'),
          items: arg.items || [],
          sender: arg.sender || {
            firstName: ord.first_name || (ord.sender_name ? ord.sender_name.split(' ')[0] : '') || '',
            lastName: ord.last_name || (ord.sender_name ? ord.sender_name.split(' ').slice(1).join(' ') : '') || '',
            phone: ord.customer_phone || ord.phone || '',
            email: ord.email || '',
          },
          recipient: arg.recipient || {
            type: 'gift' as const,
            name: ord.recipient_name || `${ord.first_name || ''} ${ord.last_name || ''}`.trim() || 'Valued Customer',
            firstName: ord.first_name || '',
            lastName: ord.last_name || '',
            phone: ord.recipient_phone || ord.customer_phone || ord.phone || '',
            city: ord.city || 'Jeddah',
            district: ord.district || '',
            street: ord.address || '',
          },
          delivery: arg.delivery || {
            date: ord.delivery_date || new Date().toISOString().split('T')[0],
            timeSlot: (ord.delivery_time || 'afternoon') as any,
          },
          giftCard: arg.giftCard,
          paymentMethod: arg.paymentMethod || ord.payment_method || 'mada',
          subtotal: Number(arg.subtotal || ord.subtotal || 0),
          vat: Number(arg.vat || ord.tax_amount || 0),
          shippingFee: Number(arg.shippingFee || ord.shipping_amount || 0),
          discount: Number(arg.discount || ord.discount_amount || 0),
          total: Number(arg.total || ord.total_amount || 0),
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

        const parseName = (nameVal: any) => {
          if (!nameVal) return { ar: 'منتج غراس', en: 'Grass Product' };
          if (typeof nameVal === 'object') {
            return {
              ar: nameVal.ar || nameVal.en || 'منتج غراس',
              en: nameVal.en || nameVal.ar || 'Grass Product',
            };
          }
          if (typeof nameVal === 'string') {
            try {
              const parsed = JSON.parse(nameVal);
              if (typeof parsed === 'object' && parsed !== null) {
                return {
                  ar: parsed.ar || parsed.en || 'منتج غراس',
                  en: parsed.en || parsed.ar || 'Grass Product',
                };
              }
            } catch {}
            return { ar: nameVal, en: nameVal };
          }
          return { ar: String(nameVal), en: String(nameVal) };
        };

        const parseImage = (imgVal: any): string => {
          if (!imgVal) return '';
          if (Array.isArray(imgVal)) return imgVal[0] || '';
          if (typeof imgVal === 'string') {
            try {
              const parsed = JSON.parse(imgVal);
              return Array.isArray(parsed) ? parsed[0] || '' : String(parsed || '');
            } catch {
              return imgVal;
            }
          }
          return '';
        };

        const rawStatus = (ord.status || 'confirmed').toLowerCase();
        let status: Order['status'] = 'confirmed';
        if (['completed', 'delivered'].includes(rawStatus)) {
          status = 'delivered';
        } else if (['on_delivery', 'shipped', 'out_for_delivery', 'dispatch'].includes(rawStatus)) {
          status = 'on_delivery';
        } else if (['processing', 'preparing', 'in_production'].includes(rawStatus)) {
          status = 'preparing';
        } else {
          status = 'confirmed';
        }

        const metaData = typeof ord.meta_data === 'string'
          ? (() => { try { return JSON.parse(ord.meta_data); } catch { return {}; } })()
          : (ord.meta_data || {});

        const isPaypal = String(ord.payment_method || '').toLowerCase() === 'paypal';
        const isUsd = (String(ord.currency || metaData?.currency || '').toUpperCase() === 'USD') || isPaypal;
        const orderCurrency: 'SAR' | 'USD' = isUsd ? 'USD' : 'SAR';
        let exchangeRate = Number(ord.exchange_rate || metaData?.exchange_rate || 0.2667);
        if (exchangeRate <= 0 || exchangeRate >= 1.0) {
          exchangeRate = 0.2667;
        }
        const sarTotal = Number(ord.sar_amount || metaData?.sar_total || ord.total_amount || 0);

        let usdTotal = 0;
        if (ord.usd_total && Number(ord.usd_total) < sarTotal) {
          usdTotal = Number(ord.usd_total);
        } else if (metaData?.usd_total && Number(metaData.usd_total) < sarTotal) {
          usdTotal = Number(metaData.usd_total);
        } else if (ord.currency_amount && Number(ord.currency_amount) < sarTotal) {
          usdTotal = Number(ord.currency_amount);
        } else {
          usdTotal = Number((sarTotal * exchangeRate).toFixed(2));
        }
        const currencyAmount = isUsd ? usdTotal : sarTotal;

        const subtotal = Number(ord.subtotal || ord.total_amount || 0);
        const vat = Number(ord.tax_amount || 0);
        const shippingFee = Number(ord.shipping_amount || 0);
        const discount = Number(ord.discount_amount || 0);

        return {
          orderNumber: ord.order_number || `ORD-${ord.id}`,
          createdAt: ord.created_at || new Date().toISOString(),
          status,
          payment_status: ord.payment_status || 'pending',
          currency: orderCurrency,
          currencyAmount,
          exchangeRate,
          sarAmount: sarTotal,
          sarTotal,
          sarSubtotal: Number(metaData?.sar_subtotal || subtotal),
          sarShippingFee: shippingFee,
          sarVat: vat,
          sarDiscount: discount,
          usdTotal,
          usdSubtotal: Number(metaData?.usd_subtotal || Number((subtotal * exchangeRate).toFixed(2))),
          usdShippingFee: Number((shippingFee * exchangeRate).toFixed(2)),
          usdVat: Number((vat * exchangeRate).toFixed(2)),
          usdDiscount: Number((discount * exchangeRate).toFixed(2)),
          subtotal,
          vat,
          shippingFee,
          discount,
          total: sarTotal,
          paymentMethod: ord.payment_method || 'mada',
          items: items.map((it: any) => {
            const prodName = parseName(it.product_name);
            const prodImg = parseImage(it.product_image);
            const qty = Number(it.quantity || 1);
            const price = Number(it.price || 0);
            return {
              cartItemId: String(it.id),
              productId: String(it.product_id),
              product: {
                id: String(it.product_id),
                name: prodName,
                slug: { ar: String(it.product_id), en: String(it.product_id) },
                price,
                currency: orderCurrency,
                images: prodImg ? [prodImg] : [],
                thumbnail: prodImg,
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
              quantity: qty,
              itemTotal: Number(it.total || price * qty || 0),
            };
          }),
          sender: {
            firstName: ord.first_name || (ord.sender_name ? ord.sender_name.split(' ')[0] : '') || '',
            lastName: ord.last_name || (ord.sender_name ? ord.sender_name.split(' ').slice(1).join(' ') : '') || '',
            phone: ord.customer_phone || ord.phone || '',
            email: ord.email || '',
          },
          recipient: {
            type: 'gift' as const,
            name: ord.recipient_name || `${ord.first_name || ''} ${ord.last_name || ''}`.trim() || 'Valued Customer',
            firstName: ord.first_name || '',
            lastName: ord.last_name || '',
            phone: ord.recipient_phone || ord.customer_phone || ord.phone || '',
            city: ord.city || 'Jeddah',
            district: ord.district || '',
            street: ord.address || '',
          },
          shipping_method: ord.shipping_method || 'Delivery Inside Jeddah',
          shippingMethodTitle: ord.shipping_method || 'Delivery Inside Jeddah',
          vat_percentage: Number(ord.vat_percentage || 15),
          giftCard: {
            senderName: ord.meta_data?.sender_name_on_card || ord.sender_name || '',
            message: ord.delivery_message || ord.card_message || ord.meta_data?.card_message || '',
            songLink: ord.song_link || ord.meta_data?.song_link || '',
          },
          songLink: ord.song_link || ord.meta_data?.song_link || '',
          locationLink: ord.location_link || '',
          delivery: {
            date: ord.delivery_date || ord.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
            timeSlot: ord.delivery_time || ord.delivery_slot || '11:00 AM to 03:00 PM',
          },
        };
      },
      providesTags: (_res, _err, id) => [{ type: 'Order', id }],
    }),
  }),
});

export const { useCreateOrderMutation, useGetOrderByNumberQuery } = ordersApi;
