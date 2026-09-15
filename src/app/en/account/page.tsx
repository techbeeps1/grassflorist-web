import { Metadata } from 'next';
import { AccountPageView } from '@/views/AccountPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'My Account',
  description: 'Manage your profile and track previous floral orders with Grass.',
  path: '/account',
  locale: 'en',
  noIndex: true,
});

export default function EnglishAccountPage() {
  return <AccountPageView locale="en" />;
}
