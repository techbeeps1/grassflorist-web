'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AccordionItemProps {
  id: string;
  title: React.ReactNode;
  children: React.ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
  variant?: 'card' | 'classic';
}

export function AccordionItem({
  id,
  title,
  children,
  isOpen = false,
  onToggle,
  className,
  variant = 'card',
}: AccordionItemProps) {
  if (variant === 'classic') {
    return (
      <div className={cn('border-b border-[#EFE7DC] transition-colors', className)}>
        <button
          type="button"
          id={`accordion-btn-${id}`}
          aria-expanded={isOpen}
          aria-controls={`accordion-content-${id}`}
          onClick={onToggle}
          className="w-full flex items-center justify-between py-4 sm:py-5 text-start font-serif sm:font-sans font-bold text-sm sm:text-base text-[#1E1915] hover:text-[#435849] transition-colors cursor-pointer group"
        >
          <span className="pe-4">{title}</span>
          <div
            className={cn(
              'w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 shadow-2xs',
              isOpen
                ? 'bg-[#435849] text-white rotate-180'
                : 'bg-[#FAF7F2] text-[#63574C] group-hover:bg-[#435849] group-hover:text-white'
            )}
          >
            <ChevronDown className="w-4 h-4 transition-transform duration-300" />
          </div>
        </button>

        {/* Smooth Expand/Collapse Container */}
        <div
          id={`accordion-content-${id}`}
          role="region"
          aria-labelledby={`accordion-btn-${id}`}
          className={cn(
            'grid transition-[grid-template-rows,opacity] duration-300 ease-in-out',
            isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          )}
        >
          <div className="overflow-hidden">
            <div className="pb-5 pt-1 text-xs sm:text-[13.5px] text-[#63574C] leading-relaxed">
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Modern Luxury Card Variant (Default)
  return (
    <div
      className={cn(
        'rounded-2xl transition-all duration-300 overflow-hidden border',
        isOpen
          ? 'bg-white border-[#8CA841]/60 shadow-[0_6px_20px_rgba(67,88,73,0.07)] ring-1 ring-[#8CA841]/20'
          : 'bg-white hover:bg-white border-[#EBE3D7] hover:border-[#8CA841]/40 shadow-[0_1px_4px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_16px_rgba(67,88,73,0.05)]',
        className
      )}
    >
      <button
        type="button"
        id={`accordion-btn-${id}`}
        aria-expanded={isOpen}
        aria-controls={`accordion-content-${id}`}
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 sm:px-6 py-4.5 sm:py-5 text-start cursor-pointer group select-none"
      >
        <span
          className={cn(
            'font-serif sm:font-sans text-[14.5px] sm:text-[15.5px] font-bold transition-colors leading-snug pe-4',
            isOpen ? 'text-[#1E1915]' : 'text-[#2C241E] group-hover:text-[#435849]'
          )}
        >
          {title}
        </span>

        {/* Rotating Circular Indicator */}
        <div
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 shadow-2xs',
            isOpen
              ? 'bg-[#435849] text-white rotate-180 scale-105'
              : 'bg-[#FAF7F2] text-[#63574C] border border-[#EAE3D7] group-hover:bg-[#435849] group-hover:text-white group-hover:border-[#435849]'
          )}
        >
          <ChevronDown className="w-4 h-4 transition-transform duration-300" />
        </div>
      </button>

      {/* Smooth Expand/Collapse Animated Body */}
      <div
        id={`accordion-content-${id}`}
        role="region"
        aria-labelledby={`accordion-btn-${id}`}
        className={cn(
          'grid transition-[grid-template-rows,opacity] duration-300 ease-in-out',
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
        )}
      >
        <div className="overflow-hidden">
          <div className="px-5 sm:px-6 pb-5 pt-0">
            <div className="pt-3 border-t border-[#F2ECE4] text-xs sm:text-[13.5px] text-[#63574C] leading-relaxed">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export interface AccordionProps {
  items: {
    id: string;
    title: React.ReactNode;
    content: React.ReactNode;
  }[];
  allowMultiple?: boolean;
  className?: string;
  variant?: 'card' | 'classic';
}

export function Accordion({
  items,
  allowMultiple = false,
  className,
  variant = 'card',
}: AccordionProps) {
  const [openIds, setOpenIds] = useState<string[]>([items[0]?.id || '']);

  const handleToggle = (id: string) => {
    if (allowMultiple) {
      setOpenIds((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    } else {
      setOpenIds((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div
      className={cn(
        variant === 'card' ? 'space-y-3 sm:space-y-3.5' : 'divide-y divide-[#EFE7DC]',
        className
      )}
    >
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          id={item.id}
          title={item.title}
          variant={variant}
          isOpen={openIds.includes(item.id)}
          onToggle={() => handleToggle(item.id)}
        >
          {item.content}
        </AccordionItem>
      ))}
    </div>
  );
}
