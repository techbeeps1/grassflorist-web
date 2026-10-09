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
  status: 'confirmed' | 'preparing' | 'on_delivery' | 'delivered';
}
