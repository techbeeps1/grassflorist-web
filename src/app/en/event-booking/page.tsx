import { Metadata } from 'next';
import { EventBookingPageView } from '@/views/EventBookingPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'Event & Wedding Booking | Grass Florist Haute Scenography',
  description: 'Bespoke wedding planning, baby reception floral decor, and luxury event floral scenography across Saudi Arabia.',
  path: '/event-booking',
  locale: 'en',
});

export default function EnglishEventBookingPage() {
  return <EventBookingPageView locale="en" />;
}
