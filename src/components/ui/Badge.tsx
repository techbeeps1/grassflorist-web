import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'outline' | 'discount';
  size?: 'sm' | 'md';
}

export function Badge({
  className,
  variant = 'primary',
  size = 'sm',
  children,
  ...props
}: BadgeProps) {
  const base = 'inline-flex items-center font-semibold rounded-full select-none';

  const variants = {
    primary: 'bg-[#EBF1EC] text-[#334438] border border-[#D9E5DC]',
    secondary: 'bg-[#FAF3ED] text-[#8C6D45] border border-[#EFE0D3]',
    accent: 'bg-[#F7EFE8] text-[#987760] border border-[#ECD9CC]',
    success: 'bg-[#EFF7F2] text-[#4A7C59] border border-[#DCEEE3]',
    warning: 'bg-[#FAF3EA] text-[#A66C24] border border-[#F5E5CE]',
    discount: 'bg-[#FAF0F0] text-[#9E3948] border border-[#F4D6D6] font-bold tracking-tight shadow-2xs',
    outline: 'border border-[#E4D8CB] text-[#5A5049] bg-white',
  };

  const sizes = {
    sm: 'text-[11px] px-2.5 py-0.5',
    md: 'text-xs px-3 py-1',
  };

  return (
    <span className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
}
