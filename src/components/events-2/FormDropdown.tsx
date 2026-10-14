'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type Locale } from '@/config/site';

export interface DropdownOption {
  id: string;
  label?: { en: string; ar: string } | string;
  name?: { en: string; ar: string } | string;
  icon?: React.ElementType;
  description?: { en: string; ar: string } | string;
}

interface FormDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  locale: Locale;
  placeholder?: string;
  icon?: React.ElementType;
  className?: string;
  id?: string;
  disabled?: boolean;
  allowClear?: boolean;
}

export function FormDropdown({
  value,
  onChange,
  options,
  locale,
  placeholder,
  icon: DefaultIcon,
  className,
  id,
  disabled = false,
  allowClear = false,
}: FormDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isRtl = locale === 'ar';

  const selectedOption = options.find((opt) => opt.id === value);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const getLabel = (opt?: DropdownOption) => {
    if (!opt) return '';
    const textObj = opt.label || opt.name;
    if (!textObj) return opt.id;
    if (typeof textObj === 'string') return textObj;
    return textObj[locale] || textObj.en || opt.id;
  };

  const SelectedIcon = selectedOption?.icon || DefaultIcon;

  return (
    <div ref={containerRef} className={cn('relative w-full select-none', className)}>
      {/* Trigger Button */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={cn(
          'w-full h-11 sm:h-12 px-4 rounded-xl border text-xs sm:text-sm font-semibold transition-all flex items-center justify-between gap-3 text-start cursor-pointer shadow-2xs',
          isOpen
            ? 'bg-white border-[#435849] ring-2 ring-[#435849]/15'
            : 'bg-[#FAF8F5] hover:bg-white text-[#201B18] border-[#E4DACD] hover:border-[#435849]/50',
          disabled && 'opacity-60 cursor-not-allowed bg-gray-100 border-gray-200'
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {SelectedIcon && (
            <SelectedIcon className="w-4 h-4 text-[#435849] shrink-0" />
          )}
          <span
            className={cn(
              'truncate',
              selectedOption ? 'text-[#201B18] font-bold' : 'text-[#8A7E74] font-normal'
            )}
          >
            {selectedOption
              ? getLabel(selectedOption)
              : placeholder || (isRtl ? 'اختر...' : 'Select...')}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {allowClear && selectedOption && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="p-1 text-[#8A7E74] hover:text-[#201B18] rounded-md hover:bg-gray-100 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={cn(
              'w-4 h-4 text-[#8A7E74] transition-transform duration-200',
              isOpen && 'rotate-180 text-[#435849]'
            )}
          />
        </div>
      </button>

      {/* Floating Menu */}
      {isOpen && !disabled && (
        <div className="absolute top-full start-0 mt-1.5 w-full bg-white border border-[#E4DACD] rounded-xl shadow-xl z-50 overflow-hidden py-1 max-h-64 overflow-y-auto animate-fade-in text-start">
          {allowClear && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs text-[#8A7E74] hover:bg-[#FAF8F5] transition-colors border-b border-gray-100 cursor-pointer"
            >
              <span>{isRtl ? 'إلغاء الاختيار (فارغ)' : 'Clear selection (None)'}</span>
            </button>
          )}

          {options.map((opt) => {
            const isSelected = opt.id === value;
            const OptIcon = opt.icon;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange(opt.id);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full flex items-center justify-between px-3.5 py-2.5 text-xs sm:text-sm transition-colors cursor-pointer text-start',
                  isSelected
                    ? 'bg-[#2D3F33] text-white font-bold'
                    : 'text-[#201B18] hover:bg-[#FAF8F5]'
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {OptIcon && (
                    <OptIcon
                      className={cn(
                        'w-4 h-4 shrink-0',
                        isSelected ? 'text-white' : 'text-[#435849]'
                      )}
                    />
                  )}
                  <span className="truncate">{getLabel(opt)}</span>
                </div>
                {isSelected && (
                  <Check className="w-4 h-4 text-white shrink-0 ms-2" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface FormMultiSelectDropdownProps {
  values: string[];
  onChange: (values: string[]) => void;
  options: DropdownOption[];
  locale: Locale;
  placeholder?: string;
  icon?: React.ElementType;
  className?: string;
}

export function FormMultiSelectDropdown({
  values,
  onChange,
  options,
  locale,
  placeholder,
  icon: DefaultIcon,
  className,
}: FormMultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isRtl = locale === 'ar';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getLabel = (opt?: DropdownOption) => {
    if (!opt) return '';
    const textObj = opt.label || opt.name;
    if (!textObj) return opt.id;
    if (typeof textObj === 'string') return textObj;
    return textObj[locale] || textObj.en || opt.id;
  };

  const toggleOption = (id: string) => {
    if (values.includes(id)) {
      if (values.length > 1) {
        onChange(values.filter((v) => v !== id));
      }
    } else {
      onChange([...values, id]);
    }
  };

  const selectedLabels = values
    .map((v) => {
      const found = options.find((opt) => opt.id === v);
      return found ? getLabel(found) : v;
    })
    .filter(Boolean);

  return (
    <div ref={containerRef} className={cn('relative w-full select-none', className)}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'w-full min-h-[44px] px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition-all flex items-center justify-between gap-3 text-start cursor-pointer shadow-2xs',
          isOpen
            ? 'bg-white border-[#435849] ring-2 ring-[#435849]/15'
            : 'bg-[#FAF8F5] hover:bg-white text-[#201B18] border-[#E4DACD] hover:border-[#435849]/50'
        )}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
          {DefaultIcon && <DefaultIcon className="w-4 h-4 text-[#435849] shrink-0" />}
          {values.length === 0 ? (
            <span className="text-[#8A7E74] font-normal">
              {placeholder || (isRtl ? 'اختر الخيارات المطلوبة...' : 'Select options...')}
            </span>
          ) : (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs bg-[#2D3F33] text-white px-2 py-0.5 rounded-full font-bold">
                {values.length} {isRtl ? 'محدد' : 'selected'}
              </span>
              <span className="text-xs text-[#201B18] truncate max-w-[220px]">
                {selectedLabels.join(', ')}
              </span>
            </div>
          )}
        </div>

        <ChevronDown
          className={cn(
            'w-4 h-4 text-[#8A7E74] shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180 text-[#435849]'
          )}
        />
      </button>

      {/* Floating Menu */}
      {isOpen && (
        <div className="absolute top-full start-0 mt-1.5 w-full bg-white border border-[#E4DACD] rounded-xl shadow-xl z-50 overflow-hidden py-1 max-h-64 overflow-y-auto animate-fade-in text-start">
          <div className="px-3 py-1.5 bg-[#FAF8F5] border-b border-[#E4DACD]/50 text-[11px] text-[#8A7E74] font-semibold flex justify-between">
            <span>{isRtl ? 'انقر لتحديد أو إلغاء الخيارات' : 'Click to select or deselect'}</span>
            <span>{values.length} / {options.length}</span>
          </div>

          {options.map((opt) => {
            const isSelected = values.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggleOption(opt.id)}
                className={cn(
                  'w-full flex items-center justify-between px-3.5 py-2.5 text-xs sm:text-sm transition-colors cursor-pointer text-start',
                  isSelected
                    ? 'bg-[#2D3F33]/5 font-bold text-[#201B18]'
                    : 'text-[#5A5049] hover:bg-[#FAF8F5]'
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div
                    className={cn(
                      'w-4 h-4 rounded-md border flex items-center justify-center transition-all shrink-0',
                      isSelected
                        ? 'bg-[#2D3F33] border-[#2D3F33] text-white'
                        : 'border-[#C8BEB2] bg-white'
                    )}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="truncate">{getLabel(opt)}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
