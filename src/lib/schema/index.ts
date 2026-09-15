import { siteConfig, type Locale } from '@/config/site';
import { Product } from '@/types/product';
import { BlogPost } from '@/types/blog';
import { FAQItem } from '@/types/faq';
import { getCanonicalUrl } from '@/config/seo';

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Florist',
    name: 'Florelle Luxury Floral Atelier',
    alternateName: 'فلوريل للزهور والهدايا الفاخرة',
    url: siteConfig.url,
    logo: `${siteConfig.url}/images/logo.png`,
    image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1200&h=630&q=80',
    description: siteConfig.description.ar,
    telephone: siteConfig.contact.phone,
    email: siteConfig.contact.email,
    priceRange: '$$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Takhassusi St, Al Olaya',
      addressLocality: 'Riyadh',
      addressRegion: 'Riyadh',
      postalCode: '12211',
      addressCountry: 'SA',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 24.7136,
      longitude: 46.6753,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        opens: '09:00',
        closes: '23:30',
      },
    ],
    sameAs: [
      siteConfig.socials.instagram,
      siteConfig.socials.twitter,
      siteConfig.socials.tiktok,
    ],
  };
}

export function generateWebSiteSchema(locale: Locale) {
  const searchUrl =
    locale === 'ar'
      ? `${siteConfig.url}/search?q={search_term_string}`
      : `${siteConfig.url}/en/search?q={search_term_string}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.shortName[locale],
    url: getCanonicalUrl('/', locale),
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: searchUrl,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateProductSchema(product: Product, locale: Locale) {
  const url = getCanonicalUrl(`/product/${product.slug[locale]}`, locale);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name[locale],
    description: product.description[locale],
    image: product.images,
    sku: product.sku,
    url,
    brand: {
      '@type': 'Brand',
      name: 'Florelle',
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency,
      availability:
        product.availability === 'in_stock'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      url,
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'Florelle',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
  };
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateArticleSchema(post: BlogPost, locale: Locale) {
  const url = getCanonicalUrl(`/blog/${post.slug[locale]}`, locale);

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title[locale],
    description: post.excerpt[locale],
    image: [post.coverImage],
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    author: {
      '@type': 'Person',
      name: post.author.name[locale],
      jobTitle: post.author.role[locale],
    },
    publisher: {
      '@type': 'Organization',
      name: 'Florelle',
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/images/logo.png`,
      },
    },
  };
}

export function generateFaqSchema(faqsList: FAQItem[], locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqsList.map((faq) => ({
      '@type': 'Question',
      name: faq.question[locale],
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer[locale],
      },
    })),
  };
}
