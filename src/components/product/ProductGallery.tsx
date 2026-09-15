'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { type Locale } from '@/config/site';
import { Badge } from '@/components/ui/Badge';
import { calculateDiscount } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ProductGalleryProps {
  images: string[];
  productName: string;
  price: number;
  originalPrice?: number;
  newArrival?: boolean;
  locale: Locale;
}

export function ProductGallery({
  images,
  productName,
  price,
  originalPrice,
  newArrival,
  locale,
}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const discount = calculateDiscount(price, originalPrice);
  const activeImage = images[selectedIndex] || images[0];

  return (
    <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 select-none">
      {/* Thumbnails list */}
      <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto no-scrollbar shrink-0 max-h-[550px]">
        {images.map((img, idx) => {
          const isSelected = selectedIndex === idx;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={cn(
                'relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer bg-surface-subtle',
                isSelected
                  ? 'border-primary ring-2 ring-primary/20 scale-[0.98]'
                  : 'border-border/70 hover:border-primary/50 opacity-80 hover:opacity-100'
              )}
              aria-label={`View image ${idx + 1}`}
            >
              <Image
                src={img}
                alt={`${productName} - thumbnail ${idx + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          );
        })}
      </div>

      {/* Main Active Image Display */}
      <div className="relative flex-1 aspect-[4/5] rounded-2xl overflow-hidden bg-surface-subtle border border-border/80 shadow-xs">
        <Image
          src={activeImage}
          alt={productName}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition-all duration-300"
        />

        {/* Badges */}
        <div className="absolute top-4 start-4 flex flex-col gap-2 z-10 pointer-events-none">
          {discount && discount > 0 && (
            <Badge variant="discount" size="md">
              {discount}% {locale === 'ar' ? 'خصم خاص' : 'SPECIAL OFFER'}
            </Badge>
          )}
          {newArrival && (
            <Badge variant="primary" size="md">
              {locale === 'ar' ? 'وصل حديثاً' : 'NEW ARRIVAL'}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
