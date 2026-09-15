import { Metadata } from 'next';
import { siteConfig, type Locale } from '@/config/site';
import { seoConfig, getCanonicalUrl, getHreflangUrls } from '@/config/seo';

interface GenerateMetadataOptions {
  title?: string;
  description?: string;
  path: string;
  locale: Locale;
  image?: string;
  noIndex?: boolean;
}

export function generatePageMetadata({
  title,
  description,
  path,
  locale,
  image,
  noIndex = false,
}: GenerateMetadataOptions): Metadata {
  const pageTitle = title
    ? `${title} | ${siteConfig.shortName[locale]}`
    : seoConfig.defaultTitle[locale];

  const pageDescription = description || seoConfig.defaultDescription[locale];
  const canonical = getCanonicalUrl(path, locale);
  const alternates = getHreflangUrls(path);
  const ogImage = image || seoConfig.openGraph.images[0].url;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: seoConfig.keywords[locale],
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
