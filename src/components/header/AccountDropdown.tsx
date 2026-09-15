'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { useAppDispatch, useAppSelector } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { addToast } from '@/store/slices/uiSlice';
import {
  User as UserIcon,
  LogOut,
  Package,
  Heart,
  ChevronDown,
  UserCheck,
  Sparkles,
} from 'lucide-react';

interface AccountDropdownProps {
  locale: Locale;
}

export function AccountDropdown({ locale }: AccountDropdownProps) {
  const dict = getDictionary(locale);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    dispatch(logout());
    dispatch(
      addToast({
        type: 'info',
        message: dict.auth.logoutSuccess,
      })
    );
    router.push(locale === 'ar' ? '/' : '/en');
  };

  const loginUrl = locale === 'ar' ? '/login' : '/en/login';
  const registerUrl = locale === 'ar' ? '/register' : '/en/register';
  const accountUrl = locale === 'ar' ? '/account' : '/en/account';
  const wishlistUrl = locale === 'ar' ? '/wishlist' : '/en/wishlist';

  if (!isAuthenticated || !user) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="User account"
          className="flex items-center gap-1.5 p-2 text-text-main hover:text-primary hover:bg-surface-subtle rounded-full transition-colors cursor-pointer"
        >
          <UserIcon className="w-5 h-5" />
          <span className="hidden xl:inline text-xs font-bold">
            {dict.auth.signIn}
          </span>
        </button>

        {isOpen && (
          <div className="absolute top-full end-0 mt-2 w-56 bg-white rounded-2xl p-3 border border-[#E4D8CB] shadow-xl z-50 animate-fade-in text-start">
            <div className="p-2 border-b border-[#E4D8CB] mb-2">
              <span className="text-xs font-black text-[#201B18] block">
                {dict.auth.loginTitle}
              </span>
              <span className="text-[11px] text-[#7D7065] block mt-0.5">
                {locale === 'ar' ? 'للوصول إلى طلباتك والمفضلة' : 'Access orders & saved items'}
              </span>
            </div>

            <div className="space-y-1">
              <Link
                href={loginUrl}
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-[#435849] hover:bg-[#344539] text-white text-xs font-bold transition-all shadow-xs"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{dict.auth.signIn}</span>
              </Link>

              <Link
                href={registerUrl}
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-[#435849] hover:bg-[#FAF8F5] text-xs font-bold transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{dict.auth.createAccount}</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Logged in user dropdown
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="My Account"
        className="flex items-center gap-2 p-1.5 pe-2.5 text-text-main hover:bg-surface-subtle rounded-full border border-border/80 transition-colors cursor-pointer select-none"
      >
        <div className="w-7 h-7 rounded-full bg-[#435849] text-white flex items-center justify-center text-xs font-bold uppercase shadow-xs">
          {user.name.charAt(0) || 'G'}
        </div>
        <span className="hidden lg:inline text-xs font-bold text-[#201B18] max-w-[90px] truncate">
          {user.name}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#8C8075] transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full end-0 mt-2 w-64 bg-white rounded-2xl p-3 border border-[#E4D8CB] shadow-xl z-50 animate-fade-in text-start">
          {/* User Header */}
          <div className="p-2.5 border-b border-[#E4D8CB] mb-2 bg-[#FAF8F5] rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#201B18] block truncate">
                {user.name}
              </span>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[#8CA841]/20 text-[#435849]">
                VIP
              </span>
            </div>
            <span className="text-[11px] text-[#7D7065] block truncate mt-0.5">
              {user.email}
            </span>
          </div>

          {/* Links */}
          <div className="space-y-0.5 text-xs font-bold text-[#4A4036]">
            <Link
              href={accountUrl}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-[#FAF8F5] hover:text-[#435849] transition-colors"
            >
              <UserIcon className="w-4 h-4 text-[#8C8075]" />
              <span>{dict.account.profileTab}</span>
            </Link>

            <Link
              href={accountUrl}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-[#FAF8F5] hover:text-[#435849] transition-colors"
            >
              <Package className="w-4 h-4 text-[#8C8075]" />
              <span>{dict.account.ordersTab}</span>
            </Link>

            <Link
              href={wishlistUrl}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-[#FAF8F5] hover:text-rose-600 transition-colors"
            >
              <Heart className="w-4 h-4 text-rose-500" />
              <span>{dict.wishlist.title}</span>
            </Link>

            <div className="pt-2 mt-2 border-t border-[#E4D8CB]">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer text-start"
              >
                <LogOut className="w-4 h-4" />
                <span>{dict.account.logout}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
