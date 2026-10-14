'use client';

import React, { useEffect } from 'react';
import { type Locale } from '@/config/site';
import { MakeItPerfectSection } from '@/components/cart/MakeItPerfectSection';
import { X, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface MakeItPerfectModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
}

export function MakeItPerfectModal({ isOpen, onClose, locale }: MakeItPerfectModalProps) {
  const isRtl = locale === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-5xl bg-surface rounded-3xl border border-border shadow-2xl overflow-hidden z-10 my-auto animate-in zoom-in-95 duration-200"
      >
        {/* Close Button Top Right/Left */}
        <button
          onClick={onClose}
          className="absolute top-4 end-4 z-20 w-9 h-9 rounded-full bg-surface-subtle hover:bg-border text-text-muted hover:text-text-main flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 max-h-[85vh] overflow-y-auto scrollbar-thin">
          <MakeItPerfectSection locale={locale} compact />
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:px-6 bg-surface-subtle border-t border-border flex items-center justify-between gap-3">
          <p className="text-xs text-text-muted hidden sm:block">
            {locale === 'ar'
              ? 'يمكنك إضافة الشوكولاتة والبالونات بضغطة واحدة قبل إتمام الطلب.'
              : 'You can add chocolates or balloons with one click before checkout.'}
          </p>

          <Button
            variant="primary"
            size="md"
            onClick={onClose}
            className="w-full sm:w-auto font-bold ms-auto"
          >
            <span>{locale === 'ar' ? 'متابعة الدفع' : 'Continue to Checkout'}</span>
            <ArrowIcon className="w-4 h-4 ms-1.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
