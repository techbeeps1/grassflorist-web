'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type Locale } from '@/config/site';
import { cn } from '@/lib/utils';
import { Subcategory } from '@/types/category';

interface SubcategoryPillsProps {
  subcategories: Subcategory[];
  activeSubcategory?: string;
  onSelect: (subSlug?: string) => void;
  locale: Locale;
  className?: string;
}

export function SubcategoryPills({
  subcategories,
  activeSubcategory,
  onSelect,
  locale,
  className,
}: SubcategoryPillsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeBtnRef = useRef<HTMLButtonElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Drag-to-scroll state
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const hasMoved = useRef(false);

  const isRtl = locale === 'ar';

  const checkScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    // Check if scrollable
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 5) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    // In modern browsers, RTL scrollLeft can be negative or positive depending on engine
    const currentScroll = Math.abs(el.scrollLeft);
    setCanScrollLeft(currentScroll > 5);
    setCanScrollRight(currentScroll < maxScroll - 5);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = containerRef.current;
    if (!el) return;

    const handleResize = () => checkScroll();
    window.addEventListener('resize', handleResize);
    el.addEventListener('scroll', checkScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      el.removeEventListener('scroll', checkScroll);
    };
  }, [checkScroll, subcategories]);

  // Convert vertical mouse wheel into horizontal scroll when hovered over pills
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && el.scrollWidth > el.clientWidth) {
        e.preventDefault();
        const delta = e.deltaY;
        el.scrollBy({
          left: isRtl ? -delta : delta,
          behavior: 'auto',
        });
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [isRtl]);

  // Auto-scroll active subcategory into view
  useEffect(() => {
    if (activeBtnRef.current && containerRef.current) {
      activeBtnRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeSubcategory]);

  const scroll = (direction: 'left' | 'right') => {
    const el = containerRef.current;
    if (!el) return;

    const scrollAmount = 300;
    let delta = direction === 'left' ? -scrollAmount : scrollAmount;
    if (isRtl) {
      // In RTL, left arrow goes towards the end or next items depending on scroll direction
      delta = direction === 'left' ? scrollAmount : -scrollAmount;
    }

    el.scrollBy({
      left: delta,
      behavior: 'smooth',
    });
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    isDragging.current = true;
    hasMoved.current = false;
    startX.current = e.pageX - el.offsetLeft;
    scrollLeftStart.current = el.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const el = containerRef.current;
    if (!el) return;
    e.preventDefault();
    hasMoved.current = true;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    el.scrollLeft = scrollLeftStart.current - walk;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  if (!subcategories || subcategories.length === 0) return null;

  return (
    <div className={cn('relative w-full group mb-6', className)}>
      {/* Scroll Left Button */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll('left')}
          aria-label={isRtl ? 'التالي' : 'Previous'}
          className={cn(
            'absolute top-1/2 -translate-y-1/2 z-10 hidden sm:flex items-center justify-center',
            'w-9 h-9 rounded-full bg-white/95 text-text-main shadow-md border border-border/80',
            'hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 cursor-pointer active:scale-95',
            isRtl ? '-right-3' : '-left-3'
          )}
        >
          {isRtl ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      )}

      {/* Scroll Right Button */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scroll('right')}
          aria-label={isRtl ? 'السابق' : 'Next'}
          className={cn(
            'absolute top-1/2 -translate-y-1/2 z-10 hidden sm:flex items-center justify-center',
            'w-9 h-9 rounded-full bg-white/95 text-text-main shadow-md border border-border/80',
            'hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 cursor-pointer active:scale-95',
            isRtl ? '-left-3' : '-right-3'
          )}
        >
          {isRtl ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      )}

      {/* Left/Right Gradient Shadows for Overflow Indication */}
      {canScrollLeft && (
        <div
          className={cn(
            'absolute top-0 bottom-0 pointer-events-none z-5 w-8 transition-opacity duration-300',
            isRtl
              ? 'right-0 bg-gradient-to-l from-surface via-surface/80 to-transparent'
              : 'left-0 bg-gradient-to-r from-surface via-surface/80 to-transparent'
          )}
        />
      )}
      {canScrollRight && (
        <div
          className={cn(
            'absolute top-0 bottom-0 pointer-events-none z-5 w-8 transition-opacity duration-300',
            isRtl
              ? 'left-0 bg-gradient-to-r from-surface via-surface/80 to-transparent'
              : 'right-0 bg-gradient-to-l from-surface via-surface/80 to-transparent'
          )}
        />
      )}

      {/* Scrollable Pills Container */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={cn(
          'flex items-center gap-2 overflow-x-auto pb-2 pt-1 px-1',
          'cursor-grab active:cursor-grabbing select-none',
          'no-scrollbar'
        )}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* All Subcategories Button */}
        <button
          type="button"
          ref={!activeSubcategory ? activeBtnRef : undefined}
          onClick={() => {
            if (!hasMoved.current) {
              onSelect(undefined);
            }
          }}
          className={cn(
            'px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 shrink-0 cursor-pointer border',
            !activeSubcategory
              ? 'bg-primary text-white border-primary shadow-xs'
              : 'bg-surface-subtle text-text-secondary hover:bg-surface hover:text-text-main border-border/80 hover:border-primary/40'
          )}
        >
          {locale === 'ar' ? 'جميع التشكيلات' : 'All Subcategories'}
        </button>

        {/* Individual Subcategory Pills */}
        {subcategories.map((sub) => {
          const isSelected =
            activeSubcategory === sub.slug ||
            (sub.id && String(activeSubcategory) === String(sub.id));

          return (
            <button
              key={sub.id}
              ref={isSelected ? activeBtnRef : undefined}
              type="button"
              onClick={() => {
                if (!hasMoved.current) {
                  onSelect(isSelected ? undefined : sub.slug);
                }
              }}
              className={cn(
                'px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 shrink-0 cursor-pointer border',
                isSelected
                  ? 'bg-primary text-white border-primary shadow-xs'
                  : 'bg-surface-subtle text-text-secondary hover:bg-surface hover:text-text-main border-border/80 hover:border-primary/40'
              )}
            >
              <span>{sub.name[locale] || sub.name.en || sub.name.ar}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
