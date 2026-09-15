import { Metadata } from 'next';
import { ForgotPasswordPageView } from '@/views/ForgotPasswordPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'Forgot Password',
  description: 'Reset your Grass Luxury Floral account password.',
  path: '/forgot-password',
  locale: 'en',
});

export default function EnglishForgotPasswordPage() {
  return <ForgotPasswordPageView locale="en" />;
}
