'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface DeliveryDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (dateStr: string) => void;
  minDate: string; // YYYY-MM-DD
  locale?: 'ar' | 'en';
  formatDisplayDate: (dateStr: string, locale: 'ar' | 'en') => string;
}

export function DeliveryDatePicker({
  value,
  onChange,
  minDate,
  locale = 'en',
  formatDisplayDate,
}: DeliveryDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse currently selected value or fallback to minDate
  const selectedDateObj = useMemo(() => {
    try {
      const [y, m, d] = (value || minDate).split('-').map(Number);
      return new Date(y, m - 1, d);
    } catch {
      return new Date();
    }
  }, [value, minDate]);

  // Current viewing month & year in the calendar
  const [viewYear, setViewYear] = useState(() => selectedDateObj.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => selectedDateObj.getMonth()); // 0-indexed

  // When value changes from outside (e.g. quick chips), sync viewing month if calendar is closed
  useEffect(() => {
    if (!isOpen) {
      setViewYear(selectedDateObj.getFullYear());
      setViewMonth(selectedDateObj.getMonth());
    }
  }, [value, isOpen, selectedDateObj]);

  // Minimum allowed date object
  const minDateObj = useMemo(() => {
    try {
      const [y, m, d] = minDate.split('-').map(Number);
      return new Date(y, m - 1, d);
    } catch {
      return new Date();
    }
  }, [minDate]);

  // Check if previous month is disabled (cannot go before minDate's month & year)
  const isPrevMonthDisabled = useMemo(() => {
    const minYear = minDateObj.getFullYear();
    const minM = minDateObj.getMonth();
    return viewYear < minYear || (viewYear === minYear && viewMonth <= minM);
  }, [viewYear, viewMonth, minDateObj]);

  // Month navigation
  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPrevMonthDisabled) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // Close calendar on outside click
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

  // Calendar days grid computation
  const daysInMonth = useMemo(() => {
    return new Date(viewYear, viewMonth + 1, 0).getDate();
  }, [viewYear, viewMonth]);

  // Day of week for 1st of viewMonth (0 = Sunday, 1 = Monday, ...)
  const startDayOfWeek = useMemo(() => {
    // 0 = Sun, 1 = Mon ... We align week starting Monday (0 = Mon, 6 = Sun)
    const day = new Date(viewYear, viewMonth, 1).getDay();
    return (day + 6) % 7; // Monday = 0, Sunday = 6
  }, [viewYear, viewMonth]);

  // Month & Year title
  const monthTitle = useMemo(() => {
    const d = new Date(viewYear, viewMonth, 1);
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
      month: 'long',
      year: 'numeric',
    }).format(d);
  }, [viewYear, viewMonth, locale]);

  // Weekday abbreviations starting Monday
  const weekDayLabels = useMemo(() => {
    if (locale === 'ar') {
      return ['إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت', 'أحد'];
    }
    return ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  }, [locale]);

  const handleSelectDay = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const dateStr = `${viewYear}-${mm}-${dd}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Clickable Full-Row Card */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen((prev) => !prev);
          }
        }}
        className={`w-full flex items-center justify-between p-3.5 rounded-xl border bg-white transition-all cursor-pointer select-none group shadow-2xs ${
          isOpen
            ? 'border-[#8fae2a] ring-2 ring-[#8fae2a]/25 shadow-sm'
            : 'border-gray-200 hover:border-[#8fae2a]/70 hover:shadow-xs'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              isOpen
                ? 'bg-[#8fae2a] text-white shadow-xs'
                : 'bg-[#546e3a]/10 text-[#546e3a] group-hover:bg-[#8fae2a] group-hover:text-white'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div className="text-start">
            <span className="text-[10.5px] text-gray-400 block font-medium leading-none mb-1">
              {locale === 'ar' ? 'التاريخ المحدد للتوصيل' : 'Selected delivery date'}
            </span>
            <span className="text-xs sm:text-sm font-bold text-gray-900 block capitalize tracking-tight">
              {formatDisplayDate(value, locale)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold text-[#546e3a] group-hover:text-[#8fae2a] ps-2">
          <span>{locale === 'ar' ? 'تغيير' : 'Change'}</span>
          <span className="text-base leading-none">🗓️</span>
        </div>
      </div>

      {/* Styled Dropdown Calendar Popover */}
      {isOpen && (
        <div className="absolute top-full start-0 mt-2 w-full max-w-sm bg-white border border-gray-200/90 rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in p-3.5">
          {/* Calendar Header with Navigation */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <button
              type="button"
              disabled={isPrevMonthDisabled}
              onClick={handlePrevMonth}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                isPrevMonthDisabled
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 cursor-pointer'
              }`}
              title={locale === 'ar' ? 'الشهر السابق' : 'Previous Month'}
            >
              {locale === 'ar' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            <span className="text-xs sm:text-sm font-black text-gray-800 capitalize tracking-tight">
              {monthTitle}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
              title={locale === 'ar' ? 'الشهر التالي' : 'Next Month'}
            >
              {locale === 'ar' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center pt-2.5 pb-1">
            {weekDayLabels.map((lbl, idx) => (
              <span key={idx} className="text-[10.5px] font-bold text-gray-400 py-0.5">
                {lbl}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center py-1">
            {/* Empty slots for start offset */}
            {Array.from({ length: startDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-8 sm:h-9 w-full" />
            ))}

            {/* Actual Days of viewMonth */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const cellDate = new Date(viewYear, viewMonth, day);
              const cellDateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

              // Is this date in the past compared to minDate?
              const isPast = cellDateStr < minDate;
              const isSelected = cellDateStr === value;
              const isToday = cellDateStr === minDate;

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  disabled={isPast}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectDay(day);
                  }}
                  className={`h-8 sm:h-9 w-full rounded-xl text-xs flex items-center justify-center transition-all cursor-pointer relative ${
                    isPast
                      ? 'text-gray-300 opacity-40 cursor-not-allowed hover:bg-transparent'
                      : isSelected
                      ? 'bg-[#8fae2a] text-white font-black shadow-xs scale-102 ring-2 ring-[#8fae2a]/30'
                      : isToday
                      ? 'bg-[#8fae2a]/15 text-[#546e3a] font-bold hover:bg-[#8fae2a]/25'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 font-medium'
                  }`}
                >
                  <span>{day}</span>
                  {isToday && !isSelected && (
                    <span className="w-1 h-1 rounded-full bg-[#8fae2a] absolute bottom-1 inset-x-0 mx-auto" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Actions */}
          <div className="pt-2.5 mt-2 border-t border-gray-100 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(minDate);
                setIsOpen(false);
              }}
              className="text-[#546e3a] hover:text-[#8fae2a] font-bold py-1 px-2 rounded-lg hover:bg-[#8fae2a]/10 transition-colors cursor-pointer"
            >
              {locale === 'ar' ? 'اليوم' : 'Today'}
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="text-gray-500 hover:text-gray-800 font-medium py-1 px-2.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              {locale === 'ar' ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
