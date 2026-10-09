import type { Metadata } from 'next';
import { tajawal } from '../fonts';
import '../globals.css';
import { StoreProvider } from '@/store/provider';
import { Header } from '@/components/header/Header';
import { Footer } from '@/components/footer/Footer';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { DynamicHead } from '@/components/common/DynamicHead';
import { seoConfig } from '@/config/seo';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: seoConfig.defaultTitle.en,
    template: seoConfig.titleTemplate.en,
  },
  description: seoConfig.defaultDescription.en,
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-32.png', type: 'image/png', sizes: '32x32' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function EnglishRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" className={tajawal.variable}>
      <body className="min-h-screen flex flex-col font-sans text-base bg-background text-text-main antialiased selection:bg-primary-light selection:text-primary">
        <StoreProvider>
          <DynamicHead />
          <ScrollToTop />
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:start-2 focus:z-50 focus:p-3 focus:bg-primary focus:text-white focus:rounded-xl"
          >
            Skip to main content
          </a>
          <Header locale="en" />
          <main id="main-content" className="flex-1 overflow-x-clip">
            {children}
          </main>
          <Footer locale="en" />
          <ToastContainer />
        </StoreProvider>
      </body>
    </html>
  );
}
