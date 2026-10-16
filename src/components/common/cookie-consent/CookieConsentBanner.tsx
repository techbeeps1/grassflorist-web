'use client';

import React, { useState, useEffect } from 'react';
import { Locale } from '@/config/site';
import { CONSENT_TEXT, CookiePreferences } from './cookie-consent-data';
import {
  getStoredConsent,
  saveConsent,
  DEFAULT_PREFERENCES,
  REJECT_ALL_PREFERENCES,
  applyGtagConsent,
} from './cookie-storage';
import { CookieConsentModal } from './CookieConsentModal';

interface CookieConsentBannerProps {
  locale: Locale;
}

export function CookieConsentBanner({ locale }: CookieConsentBannerProps) {
  const isRtl = locale === 'ar';
  const t = CONSENT_TEXT[locale];

  const [hasConsented, setHasConsented] = useState<boolean>(true); // start true to avoid SSR hydration flash
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    // Check local storage on client mount
    const stored = getStoredConsent();
    if (!stored) {
      setHasConsented(false);
    } else {
      setHasConsented(true);
      applyGtagConsent(stored);
    }

    // Listen for custom open event (e.g. from footer link or floating badge)
    const handleOpenModal = () => {
      setIsModalOpen(true);
    };

    window.addEventListener('open-cookie-preferences', handleOpenModal);
    return () => {
      window.removeEventListener('open-cookie-preferences', handleOpenModal);
    };
  }, []);

  const handleAcceptAll = () => {
    saveConsent(DEFAULT_PREFERENCES);
    setHasConsented(true);
  };

  const handleRejectAll = () => {
    saveConsent(REJECT_ALL_PREFERENCES);
    setHasConsented(true);
  };

  const handleOpenCustomize = () => {
    setIsModalOpen(true);
  };

  const handleSavedPreferences = (prefs: CookiePreferences) => {
    setHasConsented(true);
  };

  return (
    <>
      {/* 1. Cookie Floating Re-open Badge (When already consented or collapsed) */}
      {hasConsented && !isModalOpen && (
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          title={t.cookiePreferences}
          aria-label={t.cookiePreferences}
          className="hidden md:flex fixed md:bottom-6 md:start-6 z-40 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/95 text-[#6d8c1c] hover:bg-[#8fae2a] hover:text-white border border-gray-300 shadow-md items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group cursor-pointer"
        >
          {/* Cookie Icon SVG */}
          <svg
            className="w-5 h-5 transition-transform group-hover:rotate-45"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
            <path d="M8.5 8.5v.01" />
            <path d="M16 15.5v.01" />
            <path d="M12 12v.01" />
            <path d="M11 17v.01" />
            <path d="M7 14v.01" />
          </svg>
        </button>
      )}

      {/* 2. Initial Sticky Bottom Banner (Shows on first visit) */}
      {!hasConsented && (
        <aside
          role="region"
          aria-label="Cookie consent banner"
          dir={isRtl ? 'rtl' : 'ltr'}
          className="fixed bottom-0 inset-x-0 z-[9990] p-4 sm:p-5 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-2xl text-gray-800 transition-all duration-300 animate-slideUp"
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1 text-xs sm:text-sm text-gray-600 leading-relaxed text-center md:text-start">
              <span className="font-bold text-gray-900 block sm:inline sm:me-2">
                {t.bannerTitle}:
              </span>
              <span>{t.bannerText}</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 w-full md:w-auto">
              <button
                type="button"
                onClick={handleOpenCustomize}
                className="px-4 py-2 sm:py-2.5 rounded border border-[#8fae2a] text-[#719119] hover:bg-[#8fae2a]/10 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                {t.customize}
              </button>

              <button
                type="button"
                onClick={handleRejectAll}
                className="px-4 py-2 sm:py-2.5 rounded border border-[#8fae2a] text-[#719119] hover:bg-[#8fae2a]/10 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                {t.rejectAll}
              </button>

              <button
                type="button"
                onClick={handleAcceptAll}
                className="px-5 py-2 sm:py-2.5 rounded bg-[#8fae2a] hover:bg-[#7e9c24] text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
              >
                {t.acceptAll}
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* 3. The Full Preferences Modal */}
      <CookieConsentModal
        locale={locale}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={handleSavedPreferences}
      />
    </>
  );
}
