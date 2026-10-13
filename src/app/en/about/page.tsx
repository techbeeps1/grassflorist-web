import { Metadata } from 'next';
import { AboutPageView } from '@/views/AboutPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'About Grass Florist | Saudi Online Flower Shop in Jeddah',
  description: 'At Grass Florist, we craft heartfelt experiences. A Saudi online floral boutique specialized in selling and delivering fresh flowers across Jeddah.',
  path: '/about',
  locale: 'en',
});

export default function EnglishAboutPage() {
  return <AboutPageView locale="en" />;
}
