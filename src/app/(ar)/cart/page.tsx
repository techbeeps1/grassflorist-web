import { Metadata } from 'next';
import { CartPageView } from '@/views/CartPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'سلة المشتريات',
  description: 'راجع باقاتك وتنسيقات الهدايا في سلة المشتريات قبل إتمام الطلب.',
  path: '/cart',
  locale: 'ar',
  noIndex: true, // Master prompt requirement: exclude cart from indexing
});

export default function ArabicCartPage() {
  return <CartPageView locale="ar" />;
}
