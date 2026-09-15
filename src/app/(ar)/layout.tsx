import type { Metadata } from 'next';
import { cairo, poppins, cormorantGaramond } from '../fonts';
import '../globals.css';
import { StoreProvider } from '@/store/provider';
import { Header } from '@/components/header/Header';
import { Footer } from '@/components/footer/Footer';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { seoConfig } from '@/config/seo';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: seoConfig.defaultTitle.ar,
    template: seoConfig.titleTemplate.ar,
  },
  description: seoConfig.defaultDescription.ar,
};

export default function ArabicRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${poppins.variable} ${cormorantGaramond.variable}`}>
      <body className="min-h-screen flex flex-col font-sans bg-background text-text-main antialiased selection:bg-primary-light selection:text-primary">
        <StoreProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:start-2 focus:z-50 focus:p-3 focus:bg-primary focus:text-white focus:rounded-xl"
          >
            تخطي إلى المحتوى الرئيسي
          </a>
          <Header locale="ar" />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer locale="ar" />
          <ToastContainer />
        </StoreProvider>
      </body>
    </html>
  );
}
