import { CartItem } from './cart';

export interface RecipientDetails {
  type: 'myself' | 'gift';
  name: string;
  phone: string;
  city: string;
  district: string;
  street: string;
  notes?: string;
}

export interface DeliverySlotChoice {
  date: string;
  timeSlot: 'morning' | 'afternoon' | 'evening';
}

export interface GiftCardDetails {
  message?: string;
  senderName?: string;
  isAnonymous?: boolean;
}

export interface Order {
  orderNumber: string;
  createdAt: string;
  items: CartItem[];
  recipient: RecipientDetails;
  delivery: DeliverySlotChoice;
  giftCard?: GiftCardDetails;
  paymentMethod: 'mada' | 'apple_pay' | 'credit_card' | 'cod' | 'tabby';
  subtotal: number;
  vat: number;
  shippingFee: number;
  discount: number;
  total: number;
  status: 'confirmed' | 'preparing' | 'on_delivery' | 'delivered';
}
