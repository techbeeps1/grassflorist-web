import { Metadata } from 'next';
import { Suspense } from 'react';
import { SearchPageView } from '@/views/SearchPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'البحث عن باقات الزهور والهدايا الفاخرة',
  description: 'ابحث عن أرقى باقات الورد، الشوكولاتة الفاخرة، والنباتات المنزلية في بوتيك غراس فلوريست.',
  path: '/search',
  locale: 'ar',
  noIndex: true, // Master prompt requirement: exclude internal search from index
});

export default function ArabicSearchPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm">جاري البحث...</div>}>
      <SearchPageView locale="ar" />
    </Suspense>
  );
}
