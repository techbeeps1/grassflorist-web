import { Metadata } from 'next';
import { ResetPasswordPageView } from '@/views/ResetPasswordPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'Reset Password',
  description: 'Set a new password for your Grass Luxury Floral account.',
  path: '/reset-password',
  locale: 'en',
});

export default function EnglishResetPasswordPage() {
  return <ResetPasswordPageView locale="en" />;
}
