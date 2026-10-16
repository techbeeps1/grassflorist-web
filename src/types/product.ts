export interface LocalizedString {
  ar: string;
  en: string;
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: LocalizedString;
  verified: boolean;
}

export interface ProductAddonOption {
  id: string;
  name: LocalizedString;
  price: number;
  image?: string;
}

export interface Product {
  id: string;
  name: LocalizedString;
  slug: LocalizedString;
  description: LocalizedString;
  shortDescription: LocalizedString;
  price: number;
  originalPrice?: number;
  currency: string;
  discount?: number;
  images: string[];
  thumbnail: string;
  category: LocalizedString;
  categorySlug: string;
  subcategory?: LocalizedString;
  subcategorySlug?: string;
  categoryIds?: number[];
  categorySlugs?: string[];
  categoriesList?: Array<{ id: number; name: string; slug: string; slug_en?: string; slug_ar?: string }>;
  rating: number;
  reviewCount: number;
  stock: number;
  sku: string;
  tags: string[];
  featured?: boolean;
  bestseller?: boolean;
  newArrival?: boolean;
  availability: 'in_stock' | 'out_of_stock' | 'limited';
  seoTitle: LocalizedString;
  seoDescription: LocalizedString;
  seoKeywords?: LocalizedString;
  attributes?: {
    stemCount?: number;
    dimensions?: string;
    vaseIncluded?: boolean;
    freshnessDays?: number;
    flowerTypes?: LocalizedString;
  };
  productAttributes?: ProductAttributeItem[];
  reviewsList?: ProductReview[];
  is_subscription_enabled?: boolean;
  subscription_discount_percentage?: number;
  subscription_frequencies?: string[];
  subscription_durations?: string[];
  subscription_min_duration?: string;
}

export interface AttributeValueItem {
  id: number;
  name: string | LocalizedString;
  name_en?: string;
  name_ar?: string;
  slug: string;
  color_code?: string;
  count?: number;
}

export interface ProductAttributeItem {
  id: number;
  name: string | LocalizedString;
  name_en?: string;
  name_ar?: string;
  slug: string;
  type?: string;
  values: AttributeValueItem[];
}

export interface ProductFilterState {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  minRating?: number;
  tags?: string[];
  selectedAttributes?: Record<string, string[]>;
  sortBy?: 'popular' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
}

