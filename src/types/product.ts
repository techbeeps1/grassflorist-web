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
  attributes?: {
    stemCount?: number;
    dimensions?: string;
    vaseIncluded?: boolean;
    freshnessDays?: number;
    flowerTypes?: LocalizedString;
  };
  reviewsList?: ProductReview[];
}

export interface ProductFilterState {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  minRating?: number;
  tags?: string[];
  sortBy?: 'popular' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
}
