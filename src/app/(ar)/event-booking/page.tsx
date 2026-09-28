import { Metadata } from 'next';
import { EventBookingPageView } from '@/views/EventBookingPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'حجز وتنظيم المناسبات والأعراس | بوتيك غراس فلوريست',
  description: 'خدمات تخطيط وتنسيق حفلات الزفاف، ديكورات الاستقبال، وتصميم سينوغرافيا الزهور الفاخرة في المملكة العربية السعودية.',
  path: '/event-booking',
  locale: 'ar',
});

export default function ArabicEventBookingPage() {
  return <EventBookingPageView locale="ar" />;
}
