'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { setCartDrawerOpen, addToast } from '@/store/slices/uiSlice';
import { selectCartItemsCount } from '@/store/slices/cartSlice';
import { logout } from '@/store/slices/authSlice';
import { type Locale } from '@/config/site';
import {
  Home,
  ShoppingCart,
  User,
  LogIn,
  UserPlus,
  LogOut,
  Package,
  X,
  ChevronRight,
  ShieldCheck,
  Heart,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileBottomBarProps {
  locale: Locale;
}

export function MobileBottomBar({ locale }: MobileBottomBarProps) {
  const isRtl = locale === 'ar';
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const cartCount = useAppSelector(selectCartItemsCount);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [mounted, setMounted] = useState(false);
  const [isAuthSheetOpen, setIsAuthSheetOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close sheet on route change
  useEffect(() => {
    setIsAuthSheetOpen(false);
  }, [pathname]);

  // Prevent background scroll when auth sheet is open
  useEffect(() => {
    if (isAuthSheetOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAuthSheetOpen]);

  const displayCartCount = mounted ? cartCount : 0;

  const homeUrl = locale === 'ar' ? '/' : '/en';
  const wishlistUrl = locale === 'ar' ? '/wishlist' : '/en/wishlist';
  const loginUrl = locale === 'ar' ? '/login' : '/en/login';
  const registerUrl = locale === 'ar' ? '/register' : '/en/register';
  const accountUrl = locale === 'ar' ? '/account' : '/en/account';

  const isHome = pathname === '/' || pathname === '/en' || pathname === '/en/';
  const isAccountActive =
    pathname.includes('/account') ||
    pathname.includes('/login') ||
    pathname.includes('/register') ||
    isAuthSheetOpen;

  const handleLogout = () => {
    setIsAuthSheetOpen(false);
    dispatch(logout());
    dispatch(
      addToast({
        type: 'info',
        message: isRtl ? 'تم تسجيل الخروج بنجاح' : 'Logged out successfully',
      })
    );
    router.push(homeUrl);
  };

  return (
    <>
      {/* 🌟 Floating Pill Capsule Mobile Navigation Bar (< md) */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-3 inset-x-4 sm:inset-x-8 z-40 md:hidden max-w-[290px] mx-auto bg-white/98 backdrop-blur-md rounded-full shadow-[0_10px_35px_rgba(0,0,0,0.12)] border border-gray-100/90 px-3 py-1.5 transition-transform duration-300 select-none"
      >
        <div className="grid grid-cols-3 items-center justify-items-center relative">
          {/* 1. Cart Tab (Shopping Cart icon with Green Badge) */}
          <button
            onClick={() => dispatch(setCartDrawerOpen(true))}
            aria-label="Open Cart"
            className="flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer w-full text-center group active:scale-95 text-[#606B76] hover:text-[#8CA841]"
          >
            <div className="relative">
              <ShoppingCart className="w-[22px] h-[22px] stroke-[1.8] transition-transform duration-200 group-hover:scale-105" />

              {/* Green Circular Badge */}
              {displayCartCount > 0 && (
                <span className="absolute -top-1.5 -end-2.5 min-w-[17px] h-[17px] bg-[#8CA841] text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 shadow-xs border border-white animate-scale-in">
                  {displayCartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">
              {isRtl ? 'السلة' : 'Cart'}
            </span>
          </button>

          {/* 2. Center Elevated Home Button (Protruding Circle with Green Halo) */}
          <div className="flex flex-col items-center justify-center w-full relative">
            <Link
              href={homeUrl}
              aria-label="Home"
              className="group -mt-6 relative flex flex-col items-center cursor-pointer active:scale-90 transition-transform"
            >
              <div
                className={cn(
                  'w-13 h-13 rounded-full bg-white shadow-[0_6px_20px_rgba(0,0,0,0.12)] border-[3px] border-white flex items-center justify-center transition-all duration-200 ring-4',
                  isHome ? 'ring-[#8CA841]/20 shadow-[0_8px_25px_rgba(140,168,65,0.3)]' : 'ring-gray-100 shadow-md'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                    isHome ? 'bg-[#8CA841]/12' : 'bg-gray-50 group-hover:bg-[#8CA841]/10'
                  )}
                >
                  <Home
                    className={cn(
                      'w-5 h-5 transition-transform duration-200',
                      isHome ? 'text-[#8CA841] fill-[#8CA841] scale-105' : 'text-[#606B76] group-hover:text-[#8CA841]'
                    )}
                  />
                </div>
              </div>
              <span
                className={cn(
                  'text-[10px] mt-0.5 tracking-tight',
                  isHome ? 'font-bold text-[#8CA841]' : 'font-medium text-[#606B76]'
                )}
              >
                {isRtl ? 'الرئيسية' : 'Home'}
              </span>
            </Link>
          </div>

          {/* 3. Account Tab (User outline icon) */}
          <button
            onClick={() => setIsAuthSheetOpen(true)}
            aria-label="Open Account or Sign In Sheet"
            className={cn(
              'flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer w-full text-center group active:scale-95',
              isAccountActive ? 'text-[#8CA841]' : 'text-[#606B76] hover:text-[#8CA841]'
            )}
          >
            <div className="relative">
              {mounted && isAuthenticated && user ? (
                <div className="w-[22px] h-[22px] rounded-full bg-[#8CA841] text-white flex items-center justify-center text-[10px] font-black uppercase shadow-xs">
                  {user.name?.charAt(0) || 'G'}
                </div>
              ) : (
                <User
                  className={cn(
                    'w-[22px] h-[22px] transition-transform duration-200',
                    isAccountActive ? 'stroke-[2.3] text-[#8CA841]' : 'stroke-[1.8]'
                  )}
                />
              )}
            </div>
            <span
              className={cn(
                'text-[10px] mt-0.5 tracking-tight truncate max-w-[58px]',
                isAccountActive ? 'font-bold text-[#8CA841]' : 'font-medium'
              )}
            >
              {mounted && isAuthenticated && user
                ? (isRtl ? 'حسابي' : 'Account')
                : (isRtl ? 'حسابي' : 'Account')}
            </span>
          </button>
        </div>
      </nav>

      {/* 🌟 Modern Mobile Auth & Account Slide-Up Sheet */}
      {isAuthSheetOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setIsAuthSheetOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
          />

          {/* Bottom Sheet Card */}
          <div
            dir={isRtl ? 'rtl' : 'ltr'}
            className="relative w-full bg-white rounded-t-3xl border-t border-[#E8DFD5] shadow-2xl p-5 pt-4 pb-[max(env(safe-area-inset-bottom),1.5rem)] z-10 animate-slide-up text-start max-h-[85vh] overflow-y-auto"
          >
            {/* Grabber Handle */}
            <div className="w-12 h-1.5 bg-[#DDD3C6] rounded-full mx-auto mb-4" />

            {/* Header with Close Button */}
            <div className="flex items-center justify-between pb-3 border-b border-[#EFEBE5] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#8CA841] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  {mounted && isAuthenticated && user
                    ? (user.name?.charAt(0) || 'G')
                    : <User className="w-4 h-4 text-white" />}
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#201B18]">
                    {mounted && isAuthenticated && user
                      ? user.name
                      : (isRtl ? 'مرحباً بكم في غراس فلوريست' : 'Welcome to Grass Florist')}
                  </h3>
                  <p className="text-[11px] text-[#7D7065]">
                    {mounted && isAuthenticated && user
                      ? user.email
                      : (isRtl ? 'سجل الدخول أو أنشئ حساباً لمتابعة طلباتك' : 'Sign in or join to manage orders & wishlist')}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAuthSheetOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FAF8F5] hover:bg-[#F2ECE4] text-[#5A5049] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close sheet"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conditional Content: Unauthenticated vs Authenticated */}
            {!isAuthenticated || !user ? (
              <div className="space-y-3">
                {/* 1. Primary Action: Sign In Button */}
                <Link
                  href={loginUrl}
                  onClick={() => setIsAuthSheetOpen(false)}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl bg-[#2D3F33] hover:bg-[#1E2E23] text-white font-bold text-sm shadow-md transition-all active:scale-[0.98]"
                >
                  <LogIn className="w-4 h-4 text-[#8CA841]" />
                  <span>{isRtl ? 'تسجيل الدخول' : 'Sign In'}</span>
                </Link>

                {/* 2. Secondary Action: Sign Up / Register Button */}
                <Link
                  href={registerUrl}
                  onClick={() => setIsAuthSheetOpen(false)}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl bg-[#FAF8F5] hover:bg-[#F2ECE4] text-[#2D3F33] border border-[#DDD3C6] font-bold text-sm shadow-2xs transition-all active:scale-[0.98]"
                >
                  <UserPlus className="w-4 h-4 text-[#2D3F33]" />
                  <span>{isRtl ? 'إنشاء حساب جديد (تسجيل)' : 'Create New Account (Sign Up)'}</span>
                </Link>

                {/* Benefits Pill */}
                <div className="pt-3 border-t border-[#EFEBE5] flex items-center justify-center gap-4 text-[11px] text-[#7D7065]">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#8CA841]" />
                    <span>{isRtl ? 'تتبع فوري للطلبات' : 'Live Order Tracking'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    <span>{isRtl ? 'حفظ المفضلة' : 'Saved Wishlist'}</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Authenticated Quick Links */
              <div className="space-y-1.5 text-xs font-bold text-[#201B18]">
                <Link
                  href={`${accountUrl}?tab=orders`}
                  onClick={() => setIsAuthSheetOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-[#FAF8F5] text-[#201B18] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Package className="w-4 h-4 text-[#8CA841]" />
                    <span>{isRtl ? 'طلباتي ومتابعة التوصيل' : 'My Orders & Tracking'}</span>
                  </div>
                  <ChevronRight className={cn('w-4 h-4 text-[#8A7E74]', isRtl && 'rotate-180')} />
                </Link>

                <Link
                  href={`${accountUrl}?tab=profile`}
                  onClick={() => setIsAuthSheetOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-[#FAF8F5] text-[#201B18] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-[#8CA841]" />
                    <span>{isRtl ? 'ملفي الشخصي والعناوين' : 'Profile & Addresses'}</span>
                  </div>
                  <ChevronRight className={cn('w-4 h-4 text-[#8A7E74]', isRtl && 'rotate-180')} />
                </Link>

                <Link
                  href={wishlistUrl}
                  onClick={() => setIsAuthSheetOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-[#FAF8F5] text-[#201B18] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span>{isRtl ? 'قائمة أمنياتي' : 'My Wishlist'}</span>
                  </div>
                  <ChevronRight className={cn('w-4 h-4 text-[#8A7E74]', isRtl && 'rotate-180')} />
                </Link>

                <div className="pt-2 border-t border-[#EFEBE5] mt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 p-3 rounded-xl hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{isRtl ? 'تسجيل الخروج' : 'Log Out'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
