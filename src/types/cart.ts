import { Product } from './product';

export interface CartItemAddons {
  vase?: {
    id: string;
    name: string;
    price: number;
  };
  chocolates?: {
    name: string;
    price: number;
  };
  greetingCard?: {
    message: string;
    senderName?: string;
    isAnonymous?: boolean;
  };
}

export interface CartItem {
  cartItemId: string; // Unique combination of product id + chosen addons
  productId: string;
  product: Product;
  quantity: number;
  addons?: CartItemAddons;
  itemTotal: number;
}

export interface CartState {
  items: CartItem[];
  couponCode?: string;
  discountAmount: number;
  deliverySlot?: {
    date: string;
    slot: 'morning' | 'afternoon' | 'evening';
  };
  selectedCity: string;
}
