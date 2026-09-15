'use client';

import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuantitySelectorProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
  disabled?: boolean;
  className?: string;
}

export function QuantitySelector({
  quantity,
  onIncrease,
  onDecrease,
  min = 1,
  max = 99,
  size = 'md',
  disabled = false,
  className,
}: QuantitySelectorProps) {
  const isMin = quantity <= min;
  const isMax = quantity >= max;

  const sizes = {
    sm: 'h-8 text-xs',
    md: 'h-10 text-sm',
  };

  const btnSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center border border-border rounded-lg bg-surface select-none overflow-hidden',
        sizes[size],
        className
      )}
    >
      <button
        type="button"
        disabled={disabled || isMin}
        onClick={onDecrease}
        aria-label="Decrease quantity"
        className={cn(
          'flex items-center justify-center text-text-muted hover:text-text-main hover:bg-surface-subtle transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer',
          btnSizes[size]
        )}
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      <span className="min-w-[36px] text-center font-bold text-text-main px-1">
        {quantity}
      </span>

      <button
        type="button"
        disabled={disabled || isMax}
        onClick={onIncrease}
        aria-label="Increase quantity"
        className={cn(
          'flex items-center justify-center text-text-muted hover:text-text-main hover:bg-surface-subtle transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer',
          btnSizes[size]
        )}
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
