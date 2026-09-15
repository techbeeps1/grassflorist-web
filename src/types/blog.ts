import { LocalizedString } from './product';

export interface BlogPost {
  id: string;
  slug: LocalizedString;
  title: LocalizedString;
  excerpt: LocalizedString;
  content: LocalizedString;
  coverImage: string;
  author: {
    name: LocalizedString;
    role: LocalizedString;
    avatar: string;
  };
  category: LocalizedString;
  categorySlug: string;
  publishedAt: string;
  readTime: number; // in minutes
  tags: string[];
  seoTitle: LocalizedString;
  seoDescription: LocalizedString;
}
