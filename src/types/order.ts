import { CartItem } from './cart';

export interface SenderDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country?: string;
}

export interface RecipientDetails {
  type?: 'myself' | 'gift';
  name: string;
  firstName?: string;
  lastName?: string;
  phone: string;
  city: string;
  district?: string;
  street: string;
  locationLink?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
}

export interface DeliverySlotChoice {
  date: string;
  timeSlot: string;
}

export interface GiftCardDetails {
  message?: string;
  senderName?: string;
  isAnonymous?: boolean;
  songLink?: string;
}

export interface Order {
  orderNumber: string;
  orderKey?: string;
  createdAt: string;
  items: CartItem[];
  sender?: SenderDetails;
  recipient: RecipientDetails;
  delivery: DeliverySlotChoice;
  giftCard?: GiftCardDetails;
  songLink?: string;
  locationLink?: string;
  paymentMethod: 'mada' | 'apple_pay' | 'credit_card' | 'cod' | 'tabby' | string;
  subtotal: number;
  vat: number;
  shippingFee: number;
  discount: number;
  couponCode?: string;
  total: number;
  status: 'confirmed' | 'preparing' | 'on_delivery' | 'delivered' | 'cancelled' | 'pending' | string;
  payment_status?: 'pending' | 'paid' | 'failed' | 'refunded' | string;
  paymentStatus?: string;
  alreadyPaid?: boolean;
  shipping_method?: string;
  shippingMethodTitle?: string;
  currency?: 'SAR' | 'USD' | string;
  currencyAmount?: number;
  exchangeRate?: number;
  sarAmount?: number;
  sarTotal?: number;
  sarSubtotal?: number;
  sarShippingFee?: number;
  sarVat?: number;
  sarDiscount?: number;
  usdTotal?: number;
  usdSubtotal?: number;
  usdShippingFee?: number;
  usdVat?: number;
  usdDiscount?: number;
}
