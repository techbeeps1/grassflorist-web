'use client';

import React, { useState, useEffect } from 'react';
import { Locale } from '@/config/site';
import {
  COOKIE_CATEGORIES,
  CONSENT_TEXT,
  CookiePreferences,
  ConsentCategory,
} from './cookie-consent-data';
import {
  getStoredConsent,
  saveConsent,
  DEFAULT_PREFERENCES,
  REJECT_ALL_PREFERENCES,
} from './cookie-storage';
import { ChevronRight, X } from 'lucide-react';

interface CookieConsentModalProps {
  locale: Locale;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (prefs: CookiePreferences) => void;
}

export function CookieConsentModal({
  locale,
  isOpen,
  onClose,
  onSaved,
}: CookieConsentModalProps) {
  const isRtl = locale === 'ar';
  const t = CONSENT_TEXT[locale];

  // Preferences state
  const [preferences, setPreferences] = useState<CookiePreferences>(() => {
    return getStoredConsent() || DEFAULT_PREFERENCES;
  });

  // Accordion expanded state for each category
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    necessary: false,
    analytics: false,
  });

  // Show more / less in intro
  const [showMoreIntro, setShowMoreIntro] = useState(false);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      const stored = getStoredConsent();
      if (stored) {
        setPreferences(stored);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleAccordion = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const handleToggleCategory = (
    e: React.MouseEvent,
    categoryKey: keyof Omit<CookiePreferences, 'necessary' | 'updatedAt'>
  ) => {
    e.stopPropagation();
    setPreferences((prev) => ({
      ...prev,
      [categoryKey]: !prev[categoryKey],
    }));
  };

  const handleSave = () => {
    const saved = saveConsent(preferences);
    onSaved?.(saved);
    onClose();
  };

  const handleAcceptAll = () => {
    const saved = saveConsent(DEFAULT_PREFERENCES);
    setPreferences(DEFAULT_PREFERENCES);
    onSaved?.(saved);
    onClose();
  };

  const handleRejectAll = () => {
    const saved = saveConsent(REJECT_ALL_PREFERENCES);
    setPreferences(REJECT_ALL_PREFERENCES);
    onSaved?.(saved);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-preferences-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/55 backdrop-blur-[2px] animate-fadeIn"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div
        className="w-full max-w-3xl max-h-[92vh] flex flex-col bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden text-gray-700 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2
            id="cookie-preferences-title"
            className="text-lg md:text-xl font-bold text-gray-900 tracking-tight"
          >
            {t.modalTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 text-gray-500 hover:text-gray-800 hover:border-gray-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 text-xs md:text-sm leading-relaxed text-gray-600 custom-scrollbar">
          {/* Intro description */}
          <div className="space-y-3 bg-gray-50/70 p-4 rounded-lg border border-gray-100">
            <p>{t.introP1}</p>
            <p>
              {t.introP2}{' '}
              {!showMoreIntro && (
                <button
                  type="button"
                  onClick={() => setShowMoreIntro(true)}
                  className="inline font-semibold text-[#6d8c1c] hover:underline cursor-pointer"
                >
                  ... {t.showMore}
                </button>
              )}
            </p>

            {showMoreIntro && (
              <>
                <p>{t.introP3}</p>
                <p>{t.introP4}</p>
                <div>
                  <button
                    type="button"
                    onClick={() => setShowMoreIntro(false)}
                    className="font-semibold text-[#6d8c1c] hover:underline cursor-pointer"
                  >
                    {t.showLess}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Categories List */}
          <div className="divide-y divide-gray-200/80 border-t border-b border-gray-200/80">
            {COOKIE_CATEGORIES.map((category: ConsentCategory) => {
              const isExpanded = !!expandedCategories[category.id];
              const isNecessary = category.alwaysActive;
              const isChecked = isNecessary
                ? true
                : !!preferences[category.id as keyof CookiePreferences];

              return (
                <div key={category.id} className="py-4">
                  {/* Category Header Row */}
                  <div
                    onClick={() => toggleAccordion(category.id)}
                    className="flex items-center justify-between cursor-pointer select-none group"
                  >
                    <div className="flex items-center gap-2">
                      <ChevronRight
                        className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isExpanded
                            ? isRtl
                              ? '-rotate-90 text-[#8fae2a]'
                              : 'rotate-90 text-[#8fae2a]'
                            : isRtl
                              ? 'rotate-180'
                              : ''
                          }`}
                      />
                      <span className="font-semibold text-gray-900 group-hover:text-[#6d8c1c] transition-colors text-sm md:text-base">
                        {category.title[locale]}
                      </span>
                    </div>

                    {/* Status / Toggle */}
                    <div>
                      {isNecessary ? (
                        <span className="text-xs md:text-sm font-bold text-[#7ba026]">
                          {t.alwaysActive}
                        </span>
                      ) : (
                        <button
                          type="button"
                          role="switch"
                          aria-checked={isChecked}
                          onClick={(e) =>
                            handleToggleCategory(
                              e,
                              category.id as keyof Omit<CookiePreferences, 'necessary' | 'updatedAt'>
                            )
                          }
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#8fae2a] focus:ring-offset-2 ${isChecked ? 'bg-[#8fae2a]' : 'bg-gray-300'
                            }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isChecked
                                ? isRtl
                                  ? '-translate-x-5'
                                  : 'translate-x-5'
                                : 'translate-x-0'
                              }`}
                          />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Category Description */}
                  <div className="mt-2.5 ps-6 text-gray-600 text-xs md:text-[13px] leading-relaxed">
                    <p>{category.description[locale]}</p>
                  </div>

                  {/* Cookie items (if expanded and cookies exist) */}
                  {isExpanded && category.cookies && category.cookies.length > 0 && (
                    <div className="mt-4 ps-6 space-y-3.5 border-t border-gray-100 pt-3">
                      {category.cookies.map((cookie, idx) => (
                        <div
                          key={idx}
                          className="bg-gray-50/80 p-3 rounded-lg border border-gray-200/70 text-xs space-y-1.5"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                            <span className="font-bold text-gray-800 min-w-[70px]">
                              {t.cookieLabel}:
                            </span>
                            <span className="font-mono text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200 inline-block">
                              {cookie.name}
                            </span>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                            <span className="font-semibold text-gray-700 min-w-[70px]">
                              {t.durationLabel}:
                            </span>
                            <span className="text-gray-600">{cookie.duration[locale]}</span>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                            <span className="font-semibold text-gray-700 min-w-[70px]">
                              {t.descriptionLabel}:
                            </span>
                            <span className="text-gray-600 leading-normal">
                              {cookie.description[locale]}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:px-6 sm:py-5 border-t border-gray-100 bg-white space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleRejectAll}
              className="w-full sm:w-auto px-5 py-2.5 rounded border border-[#8fae2a] text-[#719119] hover:bg-[#8fae2a]/10 font-semibold text-xs sm:text-sm transition-colors text-center cursor-pointer"
            >
              {t.rejectAll}
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="w-full sm:w-auto px-5 py-2.5 rounded border border-[#8fae2a] text-[#719119] hover:bg-[#8fae2a]/10 font-semibold text-xs sm:text-sm transition-colors text-center cursor-pointer"
            >
              {t.savePreferences}
            </button>

            <button
              type="button"
              onClick={handleAcceptAll}
              className="w-full sm:w-auto px-6 py-2.5 rounded bg-[#8fae2a] hover:bg-[#7e9c24] text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors text-center cursor-pointer"
            >
              {t.acceptAll}
            </button>
          </div>


        </div>
      </div>
    </div>
  );
}
