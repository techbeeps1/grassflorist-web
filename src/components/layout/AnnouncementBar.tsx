'use client';

import React from 'react';
import { type Locale, siteConfig } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { Sparkles, MapPin, Phone } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { setCityModalOpen } from '@/store/slices/uiSlice';

interface AnnouncementBarProps {
  locale: Locale;
}

export function AnnouncementBar({ locale }: AnnouncementBarProps) {
  const dict = getDictionary(locale);
  const dispatch = useAppDispatch();
  const activeCity = useAppSelector((state) => state.ui.activeCity);

  const cityName =
    siteConfig.locations.find((l) => l.id === activeCity)?.name[locale] ||
    siteConfig.locations[0].name[locale];

  return (
    <aside
      aria-label="Announcement"
      className="bg-[#EFE7DC] text-[#25211E] text-xs py-2 px-4 select-none"
    >
      <div className="site-container flex items-center justify-between gap-4">
        {/* Delivery Location Quick Trigger */}
        <button
          onClick={() => dispatch(setCityModalOpen(true))}
          className="inline-flex items-center gap-1.5 text-[#25211E] hover:text-primary transition-colors cursor-pointer"
        >
          <MapPin className="w-3.5 h-3.5 text-primary" />
          <span className="text-[#5C524B]">{dict.header.deliveryTo}:</span>
          <span className="font-semibold underline underline-offset-2 text-[#25211E]">{cityName}</span>
        </button>

        {/* Center message */}
        <div className="hidden md:flex items-center gap-2 text-center text-[#25211E]/90 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-accent shrink-0" />
          <span>{dict.header.announcement}</span>
        </div>

        {/* Support Phone */}
        <div className="inline-flex items-center gap-2 text-[#5C524B]">
          <Phone className="w-3.5 h-3.5 text-primary" />
          <a
            href={`tel:${siteConfig.contact.phone.replace(/\s+/g, '')}`}
            className="hover:text-[#25211E] transition-colors ltr:font-mono font-medium"
            dir="ltr"
          >
            {siteConfig.contact.phone}
          </a>
        </div>
      </div>
    </aside>
  );
}
