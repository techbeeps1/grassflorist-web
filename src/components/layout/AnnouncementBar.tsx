'use client';

import React from 'react';
import { type Locale, siteConfig } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { Sparkles, MapPin, Phone } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { setCityModalOpen } from '@/store/slices/uiSlice';
import { useGetGlobalSettingsQuery } from '@/store/api/cmsApi';
import { CurrencySwitcher } from '@/components/common/CurrencySwitcher';

interface AnnouncementBarProps {
  locale: Locale;
}

export function AnnouncementBar({ locale }: AnnouncementBarProps) {
  const dict = getDictionary(locale);
  const dispatch = useAppDispatch();
  const activeCity = useAppSelector((state) => state.ui.activeCity);
  const { data: settings } = useGetGlobalSettingsQuery();

  const isEnabled = settings?.topbar?.enabled !== false;
  if (!isEnabled) {
    return null;
  }

  const cityName =
    siteConfig.locations.find((l) => l.id === activeCity)?.name[locale] ||
    siteConfig.locations[0].name[locale];

  const announcementText =
    settings?.topbar?.text?.[locale] || dict.header.announcement;

  const supportPhone =
    settings?.contact?.phone ||
    settings?.topbar?.phone ||
    siteConfig.contact.phone;

  return (
    <aside
      aria-label="Announcement"
      className="relative z-50 bg-[#EFE7DC] text-[#25211E] text-[11px] sm:text-xs py-1 sm:py-1.5 px-3 sm:px-4 select-none"
    >
      <div className="site-container flex items-center justify-between gap-2 sm:gap-4">
        {/* Delivery Location Quick Trigger */}
        <button
          onClick={() => dispatch(setCityModalOpen(true))}
          className="inline-flex items-center gap-1.5 text-[#25211E] hover:text-primary transition-colors cursor-pointer shrink-0 max-w-[180px] sm:max-w-none truncate"
        >
          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="text-[#5C524B] hidden xs:inline">{dict.header.deliveryTo}:</span>
          <span className="font-semibold underline underline-offset-2 text-[#25211E] truncate">{cityName}</span>
        </button>

        {/* Center message (Shown on desktop >= xl) */}
        <div className="hidden xl:flex items-center gap-2 text-center text-[#25211E]/90 font-medium truncate">
          <Sparkles className="w-3.5 h-3.5 text-accent shrink-0" />
          <span className="truncate">{announcementText}</span>
        </div>

        {/* Right side items: Currency Switcher & Support Phone */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <CurrencySwitcher locale={locale} />
          <span className="text-[#C4B7A6] hidden sm:inline">|</span>
          <div className="hidden sm:inline-flex items-center gap-1.5 text-[#5C524B] shrink-0">
            <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
            <a
              href={`tel:${supportPhone.replace(/\s+/g, '')}`}
              className="hover:text-[#25211E] transition-colors ltr:font-mono font-medium text-[11px] sm:text-xs"
              dir="ltr"
            >
              {supportPhone}
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}
