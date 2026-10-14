import { Metadata } from 'next';
import { EventBookingPageView } from '@/views/EventBookingPageView-2';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'حجز وتنظيم المناسبات والأعراس (نسخة 2) | بوتيك غراس فلوريست',
  description: 'خدمات تخطيط وتنسيق حفلات الزفاف، ديكورات الاستقبال، وتصميم سينوغرافيا الزهور الفاخرة في المملكة العربية السعودية.',
  path: '/event-booking-2',
  locale: 'ar',
});

export default function ArabicEventBookingPage2() {
  return <EventBookingPageView locale="ar" />;
}
