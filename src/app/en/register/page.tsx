import { Metadata } from 'next';
import { RegisterPageView } from '@/views/RegisterPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'Create Account',
  description: 'Create an account with Grass Luxury Floral Atelier to access exclusive benefits and seamless floral delivery.',
  path: '/register',
  locale: 'en',
});

export default function EnglishRegisterPage() {
  return <RegisterPageView locale="en" />;
}
