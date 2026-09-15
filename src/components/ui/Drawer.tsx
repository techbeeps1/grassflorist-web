'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  side?: 'end' | 'start';
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  side = 'end',
  children,
  className,
  footer,
}: DrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isRtl, setIsRtl] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsRtl(document.documentElement.dir === 'rtl');
    const observer = new MutationObserver(() => {
      setIsRtl(document.documentElement.dir === 'rtl');
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['dir'],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let raf1: number;
    let raf2: number;

    if (isOpen) {
      setShouldRender(true);
      // Double rAF ensures the element is in DOM before applying the transition class
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
      timer = setTimeout(() => {
        setShouldRender(false);
      }, 350); // Matches transition duration
      document.body.style.overflow = '';
    }

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!mounted || !shouldRender) return null;

  // Slide translation logic based on side and writing direction
  // side === 'end': LTR comes from right (+100%), RTL comes from left (-100%)
  // side === 'start': LTR comes from left (-100%), RTL comes from right (+100%)
  const getTransformClass = () => {
    if (isVisible) return 'translate-x-0';
    if (side === 'end') {
      return isRtl ? '-translate-x-full' : 'translate-x-full';
    } else {
      return isRtl ? 'translate-x-full' : '-translate-x-full';
    }
  };

  const drawerContent = (
    <div
      role="dialog"
      aria-modal="true"
      className={cn(
        'fixed inset-0 z-[999] flex transition-opacity duration-350 ease-out',
        isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      )}
    >
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-350 ease-out',
          isVisible ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel: Pinned to full viewport height */}
      <div
        className={cn(
          'fixed inset-y-0 z-10 w-full max-w-md sm:max-w-[460px] h-full max-h-screen bg-white shadow-2xl flex flex-col transition-transform duration-350 ease-[cubic-bezier(0.16,1,0.3,1)]',
          side === 'end' ? 'end-0' : 'start-0',
          getTransformClass(),
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4.5 border-b border-[#EFE6DB] bg-white shrink-0">
          {typeof title === 'string' ? (
            <h3 className="text-base sm:text-lg font-extrabold text-[#201B18] tracking-tight">{title}</h3>
          ) : (
            title
          )}
          <button
            onClick={onClose}
            aria-label="Close drawer"
            className="w-9 h-9 flex items-center justify-center text-[#5C524B] hover:text-[#201B18] hover:bg-[#FAF7F2] rounded-full transition-colors ms-auto cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 overscroll-contain">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-5 sm:p-6 border-t border-[#EFE6DB] bg-white shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(drawerContent, document.body);
}
