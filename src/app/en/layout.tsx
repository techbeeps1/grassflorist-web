import type { Metadata } from 'next';
import { poppins, cormorantGaramond, cairo } from '../fonts';
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
    default: seoConfig.defaultTitle.en,
    template: seoConfig.titleTemplate.en,
  },
  description: seoConfig.defaultDescription.en,
};

export default function EnglishRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" className={`${poppins.variable} ${cormorantGaramond.variable} ${cairo.variable}`}>
      <body className="min-h-screen flex flex-col font-sans bg-background text-text-main antialiased selection:bg-primary-light selection:text-primary">
        <StoreProvider>
          <ScrollToTop />
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:start-2 focus:z-50 focus:p-3 focus:bg-primary focus:text-white focus:rounded-xl"
          >
            Skip to main content
          </a>
          <Header locale="en" />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer locale="en" />
          <ToastContainer />
        </StoreProvider>
      </body>
    </html>
  );
}
