import { Metadata } from 'next';
import { siteConfig, type Locale } from '@/config/site';
import { seoConfig, getCanonicalUrl, getHreflangUrls } from '@/config/seo';

interface GenerateMetadataOptions {
  title?: string;
  description?: string;
  keywords?: string | string[];
  path: string;
  locale: Locale;
  image?: string;
  noIndex?: boolean;
}

export function generatePageMetadata({
  title,
  description,
  keywords,
  path,
  locale,
  image,
  noIndex = false,
}: GenerateMetadataOptions): Metadata {
  const shortName = siteConfig.shortName[locale];
  const pageTitle = title
    ? (title.includes(shortName) || title.includes('|') ? title : `${title} | ${shortName}`)
    : seoConfig.defaultTitle[locale];

  const pageDescription = description || seoConfig.defaultDescription[locale];
  const canonical = getCanonicalUrl(path, locale);
  const alternates = getHreflangUrls(path);
  const ogImage = image || seoConfig.openGraph.images[0].url;

  const pageKeywords = keywords
    ? (Array.isArray(keywords) ? keywords : keywords.split(',').map((s) => s.trim()).filter(Boolean))
    : seoConfig.keywords[locale];

  return {
    title: {
      absolute: pageTitle,
    },
    description: pageDescription,
    keywords: pageKeywords,
    alternates: {
      canonical,
      languages: {
        ar: alternates.ar,
        en: alternates.en,
        'x-default': alternates['x-default'],
      },
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: canonical,
      siteName: siteConfig.name[locale],
      locale: locale === 'ar' ? 'ar_SA' : 'en_US',
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      site: seoConfig.twitter.site,
      creator: seoConfig.twitter.creator,
      images: [ogImage],
    },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/icon-32.png', type: 'image/png', sizes: '32x32' },
        { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      ],
      apple: [
        { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
  };
}
