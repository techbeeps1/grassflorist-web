import { Product } from '@/types/product';

/**
 * All active products are fetched dynamically in real-time from the
 * live WooCommerce REST API (https://grassflorist.com/wp-json/wc/store/v1/products).
 * No dummy mock products are stored locally.
 */
export const products: Product[] = [];
