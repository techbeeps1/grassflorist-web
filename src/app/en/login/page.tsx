import { Metadata } from 'next';
import { LoginPageView } from '@/views/LoginPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'Sign In',
  description: 'Sign in to your Grass luxury floral account to manage your orders and personalized gifting experience.',
  path: '/login',
  locale: 'en',
});

export default function EnglishLoginPage() {
  return <LoginPageView locale="en" />;
}
