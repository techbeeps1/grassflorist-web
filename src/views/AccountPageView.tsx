'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { useAppDispatch, useAppSelector } from '@/store';
import { logout, updateUser } from '@/store/slices/authSlice';
import { addToast } from '@/store/slices/uiSlice';
import { useGetUserOrdersQuery, useUpdateProfileMutation } from '@/store/api/authApi';
import { Order } from '@/types/order';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { CurrencySymbol } from '@/components/common/CurrencySymbol';
import {
  User as UserIcon,
  Package,
  MapPin,
  Heart,
  LogOut,
  Edit3,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
} from 'lucide-react';

interface AccountPageViewProps {
  locale: Locale;
}

type AccountTab = 'profile' | 'orders' | 'addresses';

export function AccountPageView({ locale }: AccountPageViewProps) {
  const dict = getDictionary(locale);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const wishlistItems = useAppSelector((state) => state.wishlist.items);

  const [activeTab, setActiveTab] = useState<AccountTab>('profile');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Profile Edit State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || 'جدة');
  const [district, setDistrict] = useState(user?.district || '');
  const [street, setStreet] = useState(user?.street || '');
  const [isEditing, setIsEditing] = useState(false);

  const [updateProfileMutation, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const { data: userOrders = [], isLoading: isOrdersLoading } = useGetUserOrdersQuery(undefined, {
    skip: !isAuthenticated,
  });

  const isRtl = locale === 'ar';
  const ArrowIcon = isRtl ? ChevronLeft : ChevronRight;

  // Protect Account Route
  useEffect(() => {
    if (!isAuthenticated) {
      router.push(locale === 'ar' ? '/login?redirect=/account' : '/en/login?redirect=/account');
    }
  }, [isAuthenticated, locale, router]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || '');
      setCity(user.city || 'جدة');
      setDistrict(user.district || '');
      setStreet(user.street || '');
    }
  }, [user]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#FAF7F2]">
        <div className="w-8 h-8 rounded-full border-2 border-[#435849] border-t-transparent animate-spin" />
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfileMutation({
        userId: user.id,
        name,
        email,
        phone,
        city,
        district,
        street,
      }).unwrap();

      dispatch(updateUser({ name, email, phone, city, district, street }));
      setIsEditing(false);
      dispatch(
        addToast({
          type: 'success',
          message: dict.account.profileUpdated,
        })
      );
    } catch {
      dispatch(
        addToast({
          type: 'error',
          message: 'Error updating profile',
        })
      );
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(
      addToast({
        type: 'info',
        message: dict.auth.logoutSuccess,
      })
    );
    router.push(locale === 'ar' ? '/' : '/en');
  };

  const breadcrumbs = [
    { label: dict.nav.home, href: locale === 'ar' ? '/' : '/en' },
    { label: dict.account.title },
  ];

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{dict.account.statusDelivered}</span>
          </span>
        );
      case 'preparing':
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5" />
            <span>{dict.account.statusProcessing}</span>
          </span>
        );
      case 'on_delivery':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            <Truck className="w-3.5 h-3.5" />
            <span>{dict.account.statusShipped}</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-8 sm:py-12 bg-[#FAF7F2]">
      <div className="site-container max-w-5xl mx-auto">
        <Breadcrumbs items={breadcrumbs} locale={locale} className="mb-6" />

        {/* User Greeting Hero Card */}
        <div className="bg-gradient-to-r from-[#FAF3ED] via-[#F5ECE2] to-[#EAE0D3] rounded-3xl p-6 sm:p-8 mb-8 border border-[#E4D8CB] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 text-start">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#435849] text-white flex items-center justify-center font-serif text-2xl sm:text-3xl font-bold shadow-md uppercase">
              {user.name.charAt(0) || 'G'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#201B18] tracking-tight">
                  {user.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#8CA841]/20 text-[#435849] text-[10px] font-extrabold uppercase tracking-wide">
                  VIP Club
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#7D7065] mt-0.5">{user.email}</p>
              {user.phone && <p className="text-xs text-[#8C8075] mt-0.5" dir="ltr">{user.phone}</p>}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/90 hover:bg-rose-50 text-rose-600 hover:text-rose-700 text-xs font-bold border border-rose-200 transition-all cursor-pointer shadow-xs shrink-0"
          >
            <LogOut className="w-4 h-4" />
            <span>{dict.account.logout}</span>
          </button>
        </div>

        {/* Navigation Tabs & Main Area Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sidebar Nav */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-3 border border-[#E4D8CB] shadow-xs space-y-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center justify-between p-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-[#435849] text-white shadow-xs'
                  : 'text-[#4A4036] hover:bg-[#FAF7F2]'
              }`}
            >
              <div className="flex items-center gap-3">
                <UserIcon className="w-4 h-4" />
                <span>{dict.account.profileTab}</span>
              </div>
              <ArrowIcon className="w-4 h-4 opacity-70" />
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between p-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-[#435849] text-white shadow-xs'
                  : 'text-[#4A4036] hover:bg-[#FAF7F2]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4" />
                <span>{dict.account.ordersTab}</span>
              </div>
              <div className="flex items-center gap-2">
                {userOrders.length > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      activeTab === 'orders'
                        ? 'bg-white/20 text-white'
                        : 'bg-[#EBF1ED] text-[#435849]'
                    }`}
                  >
                    {userOrders.length}
                  </span>
                )}
                <ArrowIcon className="w-4 h-4 opacity-70" />
              </div>
            </button>

            <button
              onClick={() => setActiveTab('addresses')}
              className={`w-full flex items-center justify-between p-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'addresses'
                  ? 'bg-[#435849] text-white shadow-xs'
                  : 'text-[#4A4036] hover:bg-[#FAF7F2]'
              }`}
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4" />
                <span>{dict.account.addressesTab}</span>
              </div>
              <ArrowIcon className="w-4 h-4 opacity-70" />
            </button>

            <Link
              href={locale === 'ar' ? '/wishlist' : '/en/wishlist'}
              className="w-full flex items-center justify-between p-3.5 rounded-xl text-xs sm:text-sm font-bold text-[#4A4036] hover:bg-[#FAF7F2] transition-all"
            >
              <div className="flex items-center gap-3">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>{dict.account.wishlistTab}</span>
              </div>
              <div className="flex items-center gap-2">
                {wishlistItems.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700">
                    {wishlistItems.length}
                  </span>
                )}
                <ArrowIcon className="w-4 h-4 opacity-70" />
              </div>
            </Link>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-[#E4D8CB] shadow-xs text-start">
            {/* TAB 1: PROFILE */}
            {activeTab === 'profile' && (
              <div>
                <div className="flex items-center justify-between pb-5 border-b border-[#E4D8CB] mb-6">
                  <div>
                    <h2 className="text-lg font-black text-[#201B18] tracking-tight">
                      {dict.account.profileTab}
                    </h2>
                    <p className="text-xs text-[#7D7065] mt-0.5">
                      {locale === 'ar'
                        ? 'عرض وتعديل معلومات حسابك المسجلة'
                        : 'Manage your personal profile and contact information'}
                    </p>
                  </div>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#EBF1ED] text-[#435849] text-xs font-bold border border-[#D5C6B5] transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{dict.account.editProfile}</span>
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#201B18] mb-1.5">
                          {dict.auth.name}
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full h-11 px-3.5 text-xs sm:text-sm bg-[#FAF8F5] border border-[#D5C6B5] rounded-xl text-[#201B18] focus:outline-none focus:border-[#435849]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#201B18] mb-1.5">
                          {dict.auth.email}
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full h-11 px-3.5 text-xs sm:text-sm bg-[#FAF8F5] border border-[#D5C6B5] rounded-xl text-[#201B18] focus:outline-none focus:border-[#435849]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#201B18] mb-1.5">
                          {dict.auth.phone}
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          dir="ltr"
                          placeholder="05xxxxxxxx"
                          className="w-full h-11 px-3.5 text-xs sm:text-sm bg-[#FAF8F5] border border-[#D5C6B5] rounded-xl text-[#201B18] focus:outline-none focus:border-[#435849] text-start"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#201B18] mb-1.5">
                          {dict.checkout.deliveryCity}
                        </label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full h-11 px-3.5 text-xs sm:text-sm bg-[#FAF8F5] border border-[#D5C6B5] rounded-xl text-[#201B18] focus:outline-none focus:border-[#435849]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#201B18] mb-1.5">
                          {dict.checkout.deliveryDistrict}
                        </label>
                        <input
                          type="text"
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          placeholder={locale === 'ar' ? 'حي الروضة' : 'Al Rawdah'}
                          className="w-full h-11 px-3.5 text-xs sm:text-sm bg-[#FAF8F5] border border-[#D5C6B5] rounded-xl text-[#201B18] focus:outline-none focus:border-[#435849]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#201B18] mb-1.5">
                          {dict.checkout.deliveryStreet}
                        </label>
                        <input
                          type="text"
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          placeholder={locale === 'ar' ? 'شارع الأمير سلطان' : 'Prince Sultan St'}
                          className="w-full h-11 px-3.5 text-xs sm:text-sm bg-[#FAF8F5] border border-[#D5C6B5] rounded-xl text-[#201B18] focus:outline-none focus:border-[#435849]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-[#E4D8CB]">
                      <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        isLoading={isUpdating}
                        className="font-bold text-xs sm:text-sm"
                      >
                        <span>{dict.account.saveChanges}</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="md"
                        onClick={() => setIsEditing(false)}
                        className="text-xs sm:text-sm font-semibold text-[#7D7065]"
                      >
                        <span>{dict.common.close}</span>
                      </Button>
                    </div>
                  </form>
                ) : (
                  /* Profile Details View */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E4D8CB]/80 space-y-1">
                      <span className="text-[11px] text-[#8C8075] font-bold uppercase block">
                        {dict.auth.name}
                      </span>
                      <p className="text-sm font-extrabold text-[#201B18]">{user.name}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E4D8CB]/80 space-y-1">
                      <span className="text-[11px] text-[#8C8075] font-bold uppercase block">
                        {dict.auth.email}
                      </span>
                      <p className="text-sm font-extrabold text-[#201B18]">{user.email}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E4D8CB]/80 space-y-1">
                      <span className="text-[11px] text-[#8C8075] font-bold uppercase block">
                        {dict.auth.phone}
                      </span>
                      <p className="text-sm font-extrabold text-[#201B18]" dir="ltr">
                        {user.phone || (locale === 'ar' ? 'غير مسجل' : 'Not added')}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E4D8CB]/80 space-y-1">
                      <span className="text-[11px] text-[#8C8075] font-bold uppercase block">
                        {dict.checkout.deliveryCity}
                      </span>
                      <p className="text-sm font-extrabold text-[#201B18]">
                        {user.city || 'جدة'} {user.district ? `- ${user.district}` : ''}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: ORDER HISTORY */}
            {activeTab === 'orders' && (
              <div>
                <div className="pb-5 border-b border-[#E4D8CB] mb-6">
                  <h2 className="text-lg font-black text-[#201B18] tracking-tight">
                    {dict.account.ordersTab}
                  </h2>
                  <p className="text-xs text-[#7D7065] mt-0.5">
                    {locale === 'ar'
                      ? 'متابعة وتفاصيل كافة طلباتك مع متجر غراس'
                      : 'Track the status and history of your flower orders'}
                  </p>
                </div>

                {isOrdersLoading ? (
                  <div className="py-12 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-2 border-[#435849] border-t-transparent animate-spin" />
                  </div>
                ) : userOrders.length > 0 ? (
                  <div className="space-y-4">
                    {userOrders.map((order) => (
                      <div
                        key={order.orderNumber}
                        className="p-5 rounded-2xl border border-[#E4D8CB] bg-[#FAF8F5] hover:border-[#435849]/40 transition-all space-y-4 shadow-xs"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E4D8CB]">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-sm font-black text-[#201B18]">
                              {order.orderNumber}
                            </span>
                            {getStatusBadge(order.status)}
                          </div>
                          <div className="text-xs text-[#7D7065] flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>
                              {new Date(order.createdAt).toLocaleDateString(
                                locale === 'ar' ? 'ar-SA' : 'en-US',
                                { year: 'numeric', month: 'short', day: 'numeric' }
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Order Items Preview */}
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2.5">
                                <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white border border-[#E4D8CB] shrink-0">
                                  {item.product.thumbnail && (
                                    <Image
                                      src={item.product.thumbnail}
                                      alt={item.product.name[locale]}
                                      fill
                                      className="object-cover"
                                    />
                                  )}
                                </div>
                                <div>
                                  <span className="font-bold text-[#201B18] block line-clamp-1">
                                    {item.product.name[locale]}
                                  </span>
                                  <span className="text-[11px] text-[#7D7065]">
                                    {dict.product.quantity}: {item.quantity}
                                  </span>
                                </div>
                              </div>
                              <span dir="ltr" className="font-bold text-[#435849] inline-flex items-center gap-1">
                                <CurrencySymbol className="w-3 h-3" />
                                <span>{item.itemTotal}</span>
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Total & Action */}
                        <div className="pt-3 border-t border-[#E4D8CB] flex items-center justify-between">
                          <div className="text-xs">
                            <span className="text-[#7D7065]">{dict.account.orderTotal}: </span>
                            <span dir="ltr" className="font-black text-sm sm:text-base text-[#435849] inline-flex items-center gap-1">
                              <CurrencySymbol className="w-3.5 h-3.5" />
                              <span>{order.total}</span>
                            </span>
                          </div>

                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="px-4 py-2 rounded-xl bg-[#435849] hover:bg-[#334438] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                          >
                            <span>{dict.account.viewOrderDetails}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 px-4 space-y-3">
                    <div className="w-16 h-16 rounded-full bg-[#FAF3ED] flex items-center justify-center text-[#435849] mx-auto mb-2">
                      <Package className="w-8 h-8" />
                    </div>
                    <h3 className="text-base font-bold text-[#201B18]">{dict.account.noOrders}</h3>
                    <p className="text-xs text-[#7D7065] max-w-sm mx-auto">
                      {dict.account.noOrdersDesc}
                    </p>
                    <div className="pt-2">
                      <Link href={locale === 'ar' ? '/products' : '/en/products'}>
                        <Button variant="primary" size="md" className="font-bold text-xs">
                          <span>{dict.account.startShopping}</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: SAVED ADDRESSES */}
            {activeTab === 'addresses' && (
              <div>
                <div className="pb-5 border-b border-[#E4D8CB] mb-6">
                  <h2 className="text-lg font-black text-[#201B18] tracking-tight">
                    {dict.account.addressesTab}
                  </h2>
                  <p className="text-xs text-[#7D7065] mt-0.5">
                    {locale === 'ar'
                      ? 'العناوين المحفوظة لتسهيل وتنسيق سرعة التوصيل'
                      : 'Manage your saved delivery addresses for faster checkout'}
                  </p>
                </div>

                <div className="p-5 rounded-2xl border-2 border-primary/30 bg-[#FAF8F5] relative space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#435849] flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      <span>{locale === 'ar' ? 'العنوان الافتراضي (جدة)' : 'Primary Address (Jeddah)'}</span>
                    </span>
                    <span className="px-2 py-0.5 bg-primary-light text-primary text-[10px] font-bold rounded-full">
                      {locale === 'ar' ? 'افتراضي' : 'Default'}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-[#201B18]">
                    {user.name}
                  </p>
                  <p className="text-xs text-[#7D7065] leading-relaxed">
                    {user.street || (locale === 'ar' ? 'طريق الملك عبدالعزيز، حي الروضة' : 'King Abdulaziz Rd, Al Rawdah')}, {user.district || (locale === 'ar' ? 'حي الروضة' : 'Al Rawdah')}, {user.city || 'جدة'}
                  </p>
                  {user.phone && <p className="text-xs text-[#8C8075]" dir="ltr">{user.phone}</p>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ORDER DETAILS MODAL */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#E4D8CB] shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto text-start">
              <div className="flex items-center justify-between pb-4 border-b border-[#E4D8CB]">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#201B18]">
                    {dict.account.orderDetailsTitle}
                  </h3>
                  <span className="font-mono text-xs font-bold text-[#7D7065]">
                    {selectedOrder.orderNumber}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-[#8C8075] hover:text-[#201B18] rounded-full hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Banner */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E4D8CB]">
                <span className="text-xs font-bold text-[#7D7065]">
                  {dict.account.orderStatus}:
                </span>
                {getStatusBadge(selectedOrder.status)}
              </div>

              {/* Recipient & Delivery */}
              <div className="space-y-2 text-xs">
                <span className="font-bold text-[#201B18] block uppercase tracking-wider text-[11px]">
                  {dict.account.recipientInfo}
                </span>
                <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E4D8CB] space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-[#7D7065]">{dict.checkout.recipientName}:</span>
                    <span className="font-semibold text-[#201B18]">{selectedOrder.recipient.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7D7065]">{dict.checkout.recipientPhone}:</span>
                    <span className="font-semibold text-[#201B18]" dir="ltr">{selectedOrder.recipient.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7D7065]">{dict.checkout.deliveryCity}:</span>
                    <span className="font-semibold text-[#201B18]">{selectedOrder.recipient.city} - {selectedOrder.recipient.district}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7D7065]">{dict.checkout.deliveryDate}:</span>
                    <span className="font-semibold text-[#201B18]">{selectedOrder.delivery.date} ({selectedOrder.delivery.timeSlot})</span>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <span className="font-bold text-[#201B18] block uppercase tracking-wider text-[11px]">
                  {dict.account.orderItems}
                </span>
                <div className="divide-y divide-[#E4D8CB] border border-[#E4D8CB] rounded-xl overflow-hidden">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="p-3 bg-[#FAF8F5] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-white border border-[#E4D8CB] shrink-0">
                          {item.product.thumbnail && (
                            <Image
                              src={item.product.thumbnail}
                              alt={item.product.name[locale]}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-[#201B18] block line-clamp-1">{item.product.name[locale]}</span>
                          <span className="text-[11px] text-[#7D7065]">Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <span dir="ltr" className="font-bold text-[#435849] inline-flex items-center gap-1">
                        <CurrencySymbol className="w-3 h-3" />
                        <span>{item.itemTotal}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Summary */}
              <div className="p-4 rounded-xl bg-[#435849] text-white flex items-center justify-between">
                <span className="text-xs font-bold">{dict.cart.total}</span>
                <span dir="ltr" className="text-lg font-black inline-flex items-center gap-1.5">
                  <CurrencySymbol className="w-4 h-4 brightness-0 invert" />
                  <span>{selectedOrder.total}</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
