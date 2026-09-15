import { Metadata } from 'next';
import { AboutPageView } from '@/views/AboutPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'About Florelle | Haute Floral Atelier & Cold Chain',
  description: 'Learn the story of Florelle, our farm-direct growers in Holland & Ecuador, and cold-chain guarantee.',
  path: '/about',
  locale: 'en',
});

export default function EnglishAboutPage() {
  return <AboutPageView locale="en" />;
}
