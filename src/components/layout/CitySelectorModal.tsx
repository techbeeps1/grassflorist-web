'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { useAppDispatch, useAppSelector } from '@/store';
import { setCityModalOpen, setActiveCity, addToast } from '@/store/slices/uiSlice';
import { siteConfig, type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { MapPin, Clock, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CitySelectorModalProps {
  locale: Locale;
}

export function CitySelectorModal({ locale }: CitySelectorModalProps) {
  const isOpen = useAppSelector((state) => state.ui.isCityModalOpen);
  const activeCity = useAppSelector((state) => state.ui.activeCity);
  const dispatch = useAppDispatch();
  const dict = getDictionary(locale);

  const handleSelect = (cityId: string, cityName: string) => {
    dispatch(setActiveCity(cityId));
    dispatch(setCityModalOpen(false));
    dispatch(
      addToast({
        type: 'success',
        message:
          locale === 'ar'
            ? `تم تحديث مدينة التوصيل إلى ${cityName}`
            : `Delivery city updated to ${cityName}`,
      })
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => dispatch(setCityModalOpen(false))}
      title={dict.header.chooseCity}
      maxWidth="sm"
    >
      <div className="space-y-3">
        <p className="text-xs text-text-muted mb-4">
          {locale === 'ar'
            ? 'اختر المدينة لضمان معرفة مواعيد التوصيل الفوري المتاحة والزهور المتوفرة محلياً:'
            : 'Select your delivery city to confirm real-time inventory and delivery slots:'}
        </p>

        {siteConfig.locations.map((loc) => {
          const isSelected = activeCity === loc.id;

          return (
            <button
              key={loc.id}
              onClick={() => handleSelect(loc.id, loc.name[locale])}
              className={cn(
                'w-full flex items-center justify-between p-4 rounded-xl border text-start transition-all cursor-pointer',
                isSelected
                  ? 'border-primary bg-primary-light/30 shadow-xs'
                  : 'border-border hover:border-primary/50 hover:bg-surface-subtle'
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'p-2 rounded-lg shrink-0 mt-0.5',
                    isSelected
                      ? 'bg-primary text-white'
                      : 'bg-surface-subtle text-text-muted'
                  )}
                >
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text-main">
                    {loc.name[locale]}
                  </h4>
                  <p className="text-xs text-text-muted mt-0.5">
                    {loc.address[locale]}
                  </p>
                  <div className="inline-flex items-center gap-1.5 mt-1.5 text-[11px] font-semibold text-emerald-700">
                    <Clock className="w-3 h-3" />
                    <span>{loc.deliveryTime[locale]}</span>
                  </div>
                </div>
              </div>

              {isSelected && (
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shrink-0 ms-3">
                  <Check className="w-4 h-4" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
