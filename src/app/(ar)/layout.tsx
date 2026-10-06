import type { Metadata } from 'next';
import { tajawal } from '../fonts';
import '../globals.css';
import { StoreProvider } from '@/store/provider';
import { Header } from '@/components/header/Header';
import { Footer } from '@/components/footer/Footer';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { seoConfig } from '@/config/seo';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: seoConfig.defaultTitle.ar,
    template: seoConfig.titleTemplate.ar,
  },
  description: seoConfig.defaultDescription.ar,
  icons: {
    icon: [
      { url: '/icon.png', sizes: 'any' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [{ url: '/apple-icon.png' }],
    shortcut: ['/icon.png'],
  },
};

export default function ArabicRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={tajawal.variable}>
      <body className="min-h-screen flex flex-col font-sans text-base bg-background text-text-main antialiased selection:bg-primary-light selection:text-primary">
        <StoreProvider>
          <ScrollToTop />
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:start-2 focus:z-50 focus:p-3 focus:bg-primary focus:text-white focus:rounded-xl"
          >
            تخطي إلى المحتوى الرئيسي
          </a>
          <Header locale="ar" />
          <main id="main-content" className="flex-1 overflow-x-clip">
            {children}
          </main>
          <Footer locale="ar" />
          <ToastContainer />
        </StoreProvider>
      </body>
    </html>
  );
}
