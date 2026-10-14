import { Metadata } from 'next';
import { EventBookingPageView } from '@/views/EventBookingPageView-2';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'Event & Wedding Booking (V2) | Grass Florist Haute Scenography',
  description: 'Bespoke wedding planning, baby reception floral decor, and luxury event floral scenography across Saudi Arabia.',
  path: '/event-booking-2',
  locale: 'en',
});

export default function EnglishEventBookingPage2() {
  return <EventBookingPageView locale="en" />;
}
