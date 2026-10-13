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
  isSubscription?: boolean;
  subscriptionConfig?: {
    frequency?: 'weekly' | 'biweekly' | 'monthly' | 'custom';
    durationType?: '3_months' | '6_months' | '12_months' | 'until_cancelled' | 'custom';
    startDate?: string;
    timeSlot?: string;
    discountPercent?: number;
  };
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
  isAdding?: boolean;
  pendingAddItem?: {
    productId: string;
    product: Product;
    quantity: number;
  } | null;
  updatingItemIds?: Record<string, boolean>;
  removingItemIds?: Record<string, boolean>;
}
