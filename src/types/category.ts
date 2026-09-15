import { LocalizedString } from './product';

export interface Subcategory {
  id: string;
  name: LocalizedString;
  slug: string;
  count?: number;
}

export interface Category {
  id: string;
  name: LocalizedString;
  slug: string;
  description: LocalizedString;
  image: string;
  icon?: string;
  seoTitle: LocalizedString;
  seoDescription: LocalizedString;
  featured: boolean;
  itemCount: number;
  subcategories: Subcategory[];
}
