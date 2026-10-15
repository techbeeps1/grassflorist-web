'use client';

import React, { useState, useRef, useMemo } from 'react';
import Image from 'next/image';
import { type Locale } from '@/config/site';
import { useGetMakeItPerfectQuery, getLocalizedProductName } from '@/store/api/cartApi';
import { useCartActions } from '@/hooks/useCartActions';
import { useAppSelector } from '@/store';
import { formatStorageUrl } from '@/lib/wordpress/store-api';
import { PriceDisplay } from '@/components/common/CurrencySymbol';
import { Sparkles, ChevronRight, ChevronLeft, Plus, Check, Loader2 } from 'lucide-react';
import { Product } from '@/types/product';

interface MakeItPerfectSectionProps {
  locale: Locale;
  compact?: boolean;
  onItemAdded?: () => void;
  itemsVisible?: 4 | 5;
}

export function MakeItPerfectSection({
  locale,
  compact = false,
  onItemAdded,
  itemsVisible,
}: MakeItPerfectSectionProps) {
  const isRtl = locale === 'ar';
  const visibleCount = itemsVisible || (compact ? 5 : 4);
  const cardWidthClass =
    visibleCount === 5
      ? 'w-[136px] sm:w-[calc((100%-48px)/5)] shrink-0'
      : 'w-[136px] sm:w-[calc((100%-36px)/4)] shrink-0';
  const { data, isLoading } = useGetMakeItPerfectQuery({ locale });
  const { addToCart } = useCartActions();
  const cartItems = useAppSelector((state) => state.cart.items);

  const [activeTabId, setActiveTabId] = useState<string>('recommended');
  const [addingId, setAddingId] = useState<string | null>(null);
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  const tabsRef = useRef<HTMLDivElement>(null);
  const productsScrollRef = useRef<HTMLDivElement>(null);

  // Mouse drag-to-scroll state
  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const isDraggingRef = useRef(false);

  const categories = useMemo(() => data?.categories || [], [data?.categories]);

  // Set default active tab when data arrives if current tab doesn't exist
  React.useEffect(() => {
    if (categories.length > 0 && !categories.some((c) => c.id === activeTabId)) {
      setActiveTabId(categories[0].id);
    }
  }, [categories, activeTabId]);

  const activeCategory = useMemo(() => {
    return categories.find((c) => c.id === activeTabId) || categories[0];
  }, [categories, activeTabId]);

  const activeProducts = useMemo(() => {
    return activeCategory?.products || [];
  }, [activeCategory]);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (!tabsRef.current) return;
    const scrollAmount = direction === 'left' ? -200 : 200;
    const finalAmount = isRtl ? -scrollAmount : scrollAmount;
    tabsRef.current.scrollBy({ left: finalAmount, behavior: 'smooth' });
  };

  const scrollProducts = (direction: 'left' | 'right') => {
    if (!productsScrollRef.current) return;
    const cardEl = productsScrollRef.current.firstElementChild as HTMLElement;
    const scrollAmount = cardEl ? cardEl.offsetWidth + 12 : 220;
    const finalAmount = isRtl ? -scrollAmount : scrollAmount;
    productsScrollRef.current.scrollBy({ left: (direction === 'left' ? -1 : 1) * finalAmount, behavior: 'smooth' });
  };

  // Drag-to-scroll event handlers for mouse
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!productsScrollRef.current) return;
    isMouseDownRef.current = true;
    isDraggingRef.current = false;
    startXRef.current = e.pageX - productsScrollRef.current.offsetLeft;
    scrollLeftRef.current = productsScrollRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDownRef.current || !productsScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - productsScrollRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.3;
    if (Math.abs(x - startXRef.current) > 5) {
      isDraggingRef.current = true;
    }
    productsScrollRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isMouseDownRef.current = false;
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 60);
  };

  const onAddClick = async (product: any) => {
    if (isDraggingRef.current) return;
    const pid = String(product.id);
    setAddingId(pid);
    try {
      const success = await addToCart(product as Product, 1, { openDrawer: false });
      if (success) {
        setRecentlyAddedId(pid);
        if (onItemAdded) onItemAdded();
        setTimeout(() => {
          setRecentlyAddedId((prev) => (prev === pid ? null : prev));
        }, 2200);
      }
    } finally {
      setAddingId(null);
    }
  };

  if (isLoading) {
    return (
      <div
        className={`bg-surface rounded-2xl border border-border shadow-xs overflow-hidden transition-all ${
          compact ? 'p-3.5 sm:p-4' : 'p-4 sm:p-5'
        }`}
      >
        {/* Header Skeleton */}
        <div className="flex items-center justify-between pb-3 border-b border-border/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-surface-subtle shrink-0 animate-pulse" />
            <div>
              <div className="h-4 w-32 sm:w-36 bg-surface-subtle rounded-md animate-pulse" />
              <div className="h-3 w-48 sm:w-56 bg-surface-subtle/80 rounded-md mt-1.5 animate-pulse" />
            </div>
          </div>

          {/* Carousel Arrow Controls Skeleton */}
          <div className="hidden sm:flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-full bg-surface-subtle border border-border/60 animate-pulse" />
            <div className="w-7 h-7 rounded-full bg-surface-subtle border border-border/60 animate-pulse" />
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="relative mt-3 mb-3">
          <div className="flex items-center gap-1.5 overflow-hidden py-0.5 no-scrollbar">
            {[100, 120, 80, 75, 90, 110].map((width, i) => (
              <div
                key={i}
                style={{ width: `${width}px` }}
                className="h-[31px] rounded-full bg-surface-subtle animate-pulse shrink-0 border border-border/40"
              />
            ))}
          </div>
        </div>

        {/* Products Row Skeleton (Flex row matching exact card sizes) */}
        <div className="flex gap-2.5 sm:gap-3 overflow-hidden pb-1.5 pt-0.5 -mx-1 px-1 no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {Array.from({ length: visibleCount }).map((_, i) => (
            <div
              key={i}
              className={`${cardWidthClass} bg-white rounded-2xl border border-border/80 overflow-hidden flex flex-col justify-between shadow-xs`}
            >
              {/* Product Thumbnail Skeleton */}
              <div className="relative aspect-square w-full bg-surface-subtle animate-pulse" />

              {/* Product Info Skeleton */}
              <div className="p-2 sm:p-2.5 flex flex-col flex-1 justify-between text-start">
                <div>
                  <div className="h-4 w-14 bg-surface-subtle rounded animate-pulse mb-1" />
                  <div className="h-3.5 w-full bg-surface-subtle rounded animate-pulse" />
                </div>

                {/* Quick Add Button Skeleton */}
                <div className="mt-2 pt-1.5 border-t border-border/50">
                  <div className="h-[29px] w-full rounded-full bg-surface-subtle animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data?.enabled || categories.length === 0 || activeProducts.length === 0) {
    return null;
  }

  const sectionTitle =
    locale === 'ar'
      ? data.title_ar || data.title || 'اجعلها مثالية'
      : data.title_en || data.title || 'Make it perfect';

  const subtitle =
    locale === 'ar'
      ? 'أضف لمسات أخيرة مميزة تنسجم مع هديتك'
      : 'Add the perfect finishing touches to your gift';

  return (
    <div
      className={`bg-surface rounded-2xl border border-border shadow-xs overflow-hidden transition-all ${
        compact ? 'p-3.5 sm:p-4' : 'p-4 sm:p-5'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/80">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-text-main flex items-center gap-1.5 leading-tight">
              <span>{sectionTitle}</span>
            </h3>
            <p className="text-[11px] text-text-muted mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Carousel Arrow Controls */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={() => scrollProducts('left')}
            className="w-7 h-7 rounded-full border border-border/80 hover:border-primary hover:bg-primary hover:text-white flex items-center justify-center text-text-muted transition-all cursor-pointer bg-surface active:scale-95 shadow-2xs"
            aria-label="Previous items"
          >
            {isRtl ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => scrollProducts('right')}
            className="w-7 h-7 rounded-full border border-border/80 hover:border-primary hover:bg-primary hover:text-white flex items-center justify-center text-text-muted transition-all cursor-pointer bg-surface active:scale-95 shadow-2xs"
            aria-label="Next items"
          >
            {isRtl ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="relative mt-3 mb-3">
        <div
          ref={tabsRef}
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-0.5 scroll-smooth select-none cursor-grab active:cursor-grabbing"
        >
          {categories.map((cat) => {
            const isActive = cat.id === activeTabId;
            const tabName =
              locale === 'ar'
                ? cat.name_ar || cat.name
                : cat.name_en || cat.name;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveTabId(cat.id)}
                className={`px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 border ${
                  isActive
                    ? 'bg-primary text-white border-primary shadow-xs font-bold scale-[1.02]'
                    : 'bg-surface-subtle text-text-main border-border/60 hover:border-primary/40 hover:bg-surface'
                }`}
              >
                {tabName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Draggable Products Row */}
      <div
        ref={productsScrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className="flex gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-1.5 pt-0.5 scroll-smooth -mx-1 px-1 select-none cursor-grab active:cursor-grabbing"
      >
        {activeProducts.map((p: any) => {
          const pid = String(p.id);
          const isAdding = addingId === pid;
          const isRecentlyAdded = recentlyAddedId === pid;
          const cartItem = cartItems.find((ci) => String(ci.productId) === pid);
          const inCartCount = cartItem ? cartItem.quantity : 0;
          const productName = getLocalizedProductName(p.name, locale);
          const imageUrl = formatStorageUrl(p.thumbnail || (p.images && p.images[0]));

          return (
            <div
              key={p.id}
              className={`${cardWidthClass} bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between group ${
                inCartCount > 0
                  ? 'border-primary ring-1.5 ring-primary/30 shadow-xs'
                  : 'border-border/80 hover:border-primary/50 hover:shadow-md'
              }`}
            >
              {/* Product Thumbnail */}
              <div className="relative aspect-square w-full bg-[#FAF7F2] overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={productName}
                  fill
                  sizes="(max-width: 640px) 136px, 155px"
                  unoptimized
                  draggable={false}
                  className="object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none select-none"
                />

                {/* In Cart Indicator Badge */}
                {inCartCount > 0 && (
                  <div className="absolute top-2 end-2 bg-primary text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full shadow-xs flex items-center justify-center min-w-[20px]">
                    {inCartCount}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-2 sm:p-2.5 flex flex-col flex-1 justify-between text-start">
                <div>
                  <div className="flex items-center gap-1 text-primary font-black text-xs sm:text-sm mb-0.5">
                    <PriceDisplay amount={p.price} />
                  </div>
                  <h4
                    className="text-[11px] sm:text-xs font-semibold text-text-main line-clamp-1 leading-snug group-hover:text-primary transition-colors"
                    title={productName}
                  >
                    {productName}
                  </h4>
                </div>

                {/* Quick Add Pill Button */}
                <div className="mt-2 pt-1.5 border-t border-border/50">
                  <button
                    onClick={() => onAddClick(p)}
                    disabled={isAdding || p.stock <= 0}
                    className={`w-full py-1 sm:py-1.5 px-2.5 rounded-full text-[11px] sm:text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                      isRecentlyAdded
                        ? 'bg-emerald-600 text-white shadow-xs border border-emerald-600'
                        : inCartCount > 0
                        ? 'bg-primary/10 text-primary border border-primary/40 hover:bg-primary hover:text-white shadow-2xs'
                        : 'border border-border text-text-main bg-surface-subtle hover:border-primary hover:bg-primary hover:text-white shadow-2xs'
                    }`}
                  >
                    {isAdding ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>{locale === 'ar' ? 'إضافة...' : 'Adding...'}</span>
                      </>
                    ) : isRecentlyAdded ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>{locale === 'ar' ? 'تمت الإضافة' : 'Added'}</span>
                      </>
                    ) : inCartCount > 0 ? (
                      <>
                        <Plus className="w-3 h-3" />
                        <span>{locale === 'ar' ? 'أضف المزيد' : 'Add more'}</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3" />
                        <span>{locale === 'ar' ? 'إضافة' : 'Add'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
