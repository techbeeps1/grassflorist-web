'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { type Locale } from '@/config/site';
import { useSavedAddresses, SavedAddressOption } from '@/hooks/useSavedAddresses';
import { CountryCodePicker, splitPhone } from '@/components/checkout/CountryCodePicker';
import { useAppDispatch } from '@/store';
import { addToast } from '@/store/slices/uiSlice';
import {
  MapPin,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  ExternalLink,
  X,
  Star,
  Check,
  AlertCircle,
} from 'lucide-react';

const AddressMapPicker = dynamic(
  () => import('@/components/checkout/AddressMapPicker').then((mod) => mod.AddressMapPicker),
  { ssr: false }
);

interface SavedAddressesManagerProps {
  user: any;
  locale: Locale;
  userOrders?: any[];
  profileUser?: any;
}

export function SavedAddressesManager({
  user,
  locale,
  userOrders,
  profileUser,
}: SavedAddressesManagerProps) {
  const dispatch = useAppDispatch();
  const isAr = locale === 'ar';

  const {
    savedAddresses,
    isLoaded,
    saveAddress,
    deleteAddress,
    setDefaultAddress,
  } = useSavedAddresses(user, locale, userOrders, profileUser);

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingAddressLink, setShippingAddressLink] = useState('');
  const [recipientFirstName, setRecipientFirstName] = useState('');
  const [recipientLastName, setRecipientLastName] = useState('');
  const [recipientCountryCode, setRecipientCountryCode] = useState('+966');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [city, setCity] = useState(isAr ? 'جدة' : 'Jeddah');
  const [district, setDistrict] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [isDefault, setIsDefault] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Open Edit Form
  const handleStartEdit = (addr?: SavedAddressOption) => {
    if (addr) {
      setEditingAddressId(addr.id);
      setShippingAddress(addr.shippingAddress || '');
      setShippingAddressLink(addr.shippingAddressLink || '');
      setRecipientFirstName(addr.recipientFirstName || '');
      setRecipientLastName(addr.recipientLastName || '');
      const parsed = splitPhone(addr.recipientPhone || '');
      setRecipientCountryCode(parsed.code || '+966');
      setRecipientPhone(parsed.number || '');
      setCity(addr.city || (isAr ? 'جدة' : 'Jeddah'));
      setDistrict(addr.district || '');
      setLatitude(addr.latitude);
      setLongitude(addr.longitude);
      setIsDefault(Boolean(addr.isDefault));
    } else {
      setEditingAddressId(null);
      setShippingAddress('');
      setShippingAddressLink('');
      setRecipientFirstName('');
      setRecipientLastName('');
      setRecipientCountryCode('+966');
      setRecipientPhone('');
      setCity(isAr ? 'جدة' : 'Jeddah');
      setDistrict('');
      setLatitude(undefined);
      setLongitude(undefined);
      setIsDefault(savedAddresses.length === 0);
    }
    setErrors({});
    setIsEditing(true);
    // Smooth scroll to form
    setTimeout(() => {
      document.getElementById('address-editor-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingAddressId(null);
    setErrors({});
  };

  const handleMapLocationSelect = (data: {
    address: string;
    locationLink: string;
    latitude: number;
    longitude: number;
    district?: string;
  }) => {
    setShippingAddress(data.address);
    setShippingAddressLink(data.locationLink);
    setLatitude(data.latitude);
    setLongitude(data.longitude);
    if (data.district) setDistrict(data.district);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.shippingAddress;
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!shippingAddress.trim()) {
      newErrors.shippingAddress = isAr ? 'يرجى إدخال عنوان الشحن' : 'Shipping address is required';
    }
    if (!recipientFirstName.trim()) {
      newErrors.recipientFirstName = isAr ? 'يرجى إدخال الاسم الأول' : 'Recipient first name is required';
    }
    if (!recipientLastName.trim()) {
      newErrors.recipientLastName = isAr ? 'يرجى إدخال اسم العائلة' : 'Recipient last name is required';
    }
    if (!recipientPhone.trim()) {
      newErrors.recipientPhone = isAr ? 'يرجى إدخال رقم الهاتف' : 'Phone number is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanNumber = recipientPhone.replace(/^0+/, '').trim();
      const fullPhone = `${recipientCountryCode}${cleanNumber}`;

      saveAddress({
        id: editingAddressId || undefined,
        recipientFirstName: recipientFirstName.trim(),
        recipientLastName: recipientLastName.trim(),
        recipientPhone: fullPhone,
        shippingAddress: shippingAddress.trim(),
        shippingAddressLink: shippingAddressLink.trim(),
        city: city || (isAr ? 'جدة' : 'Jeddah'),
        district: district.trim(),
        latitude,
        longitude,
        isDefault,
      });

      dispatch(
        addToast({
          message: isAr
            ? editingAddressId
              ? 'تم تحديث عنوان التوصيل بنجاح'
              : 'تمت إضافة عنوان التوصيل الجديد بنجاح'
            : editingAddressId
              ? 'Delivery address updated successfully'
              : 'New delivery address added successfully',
          type: 'success',
        })
      );

      setIsEditing(false);
      setEditingAddressId(null);
    } catch {
      dispatch(
        addToast({
          message: isAr ? 'حدث خطأ أثناء حفظ العنوان' : 'Error saving address',
          type: 'error',
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (addr: SavedAddressOption) => {
    const confirmMsg = isAr
      ? `هل أنت متأكد من حذف عنوان "${addr.label}"؟`
      : `Are you sure you want to remove this address "${addr.label}"?`;

    if (window.confirm(confirmMsg)) {
      deleteAddress(addr);
      dispatch(
        addToast({
          message: isAr ? 'تم حذف العنوان بنجاح' : 'Address removed successfully',
          type: 'success',
        })
      );
      if (editingAddressId === addr.id) {
        setIsEditing(false);
        setEditingAddressId(null);
      }
    }
  };

  const handleMakeDefault = (addr: SavedAddressOption) => {
    setDefaultAddress(addr.id);
    dispatch(
      addToast({
        message: isAr ? 'تم تعيين العنوان كافتراضي للطلبات' : 'Address set as primary for checkout',
        type: 'success',
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#E8DFD3]">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-[#1E1915] tracking-tight">
              {isAr ? 'العناوين المحفوظة' : 'Saved Addresses'}
            </h2>
            <span className="text-xs font-bold text-[#546e3a] bg-[#8fae2a]/15 px-2.5 py-0.5 rounded-full border border-[#8fae2a]/30">
              {savedAddresses.length}/5
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#7D7065] mt-1">
            {isAr
              ? 'إدارة العناوين الخمسة المحفوظة تلقائياً لتسريع إتمام الطلبات وتحديد مواقع التوصيل على الخريطة'
              : 'Manage your 5 saved delivery addresses used for fast checkout and precise map navigation'}
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={() => handleStartEdit()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2D3F33] hover:bg-[#1E2B23] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إضافة عنوان جديد' : 'Add New Address'}</span>
          </button>
        )}
      </div>

      {/* Anchor for smooth scroll */}
      <div id="address-editor-anchor" />

      {/* =========================================================================
          ADDRESS EDITOR (Exact Same Fields as Checkout Page)
         ========================================================================= */}
      {isEditing && (
        <div className="rounded-3xl border-2 border-[#8fae2a]/40 bg-white p-5 sm:p-7 shadow-lg space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#8fae2a]/15 text-[#546e3a] flex items-center justify-center font-bold">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {editingAddressId
                    ? isAr
                      ? 'تعديل عنوان التوصيل'
                      : 'Edit Delivery Address'
                    : isAr
                      ? 'إضافة عنوان توصيل جديد'
                      : 'Add New Delivery Address'}
                </h3>
                <p className="text-xs text-gray-500">
                  {isAr
                    ? 'حدد الموقع على الخريطة وتفاصيل المستلم المستخدمة في شحن الطلب'
                    : 'Pin the location on the map and fill in receiver details for delivery'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCancel}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Pin Address on Map (Jeddah) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 block">
                {isAr ? 'تحديد الموقع على الخريطة (جدة):' : 'Pin Address on Map (Jeddah):'}
              </label>
              <AddressMapPicker
                locale={locale}
                initialAddress={shippingAddress}
                initialLink={shippingAddressLink}
                onLocationSelect={handleMapLocationSelect}
              />
            </div>

            {/* 2. Shipping Address & Link in 1 row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                  {isAr ? 'عنوان الشحن' : 'Shipping address'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder={isAr ? 'اسم الحي، الشارع، أو رقم المبنى' : 'District, Street, Landmark'}
                  className={`w-full h-11 px-3.5 text-xs bg-white border rounded-xl focus:outline-none transition-all ${
                    errors.shippingAddress
                      ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500/20'
                      : 'border-gray-200 focus:border-[#8fae2a] focus:ring-2 focus:ring-[#8fae2a]/20'
                  }`}
                />
                {errors.shippingAddress && (
                  <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.shippingAddress}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5 flex items-center justify-between">
                  <span className="truncate">
                    {isAr ? 'رابط موقع الشحن (خرائط جوجل)' : 'Shipping address link'}
                  </span>
                  {shippingAddressLink && (
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
                      {isAr ? 'تم التحديد' : 'Pinned'}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={shippingAddressLink}
                    readOnly={Boolean(shippingAddressLink)}
                    onChange={(e) => setShippingAddressLink(e.target.value)}
                    placeholder="https://maps.google.com/..."
                    className={`w-full h-11 px-3.5 pe-9 text-xs border rounded-xl focus:outline-none transition-all ${
                      shippingAddressLink
                        ? 'bg-gray-50 border-gray-200 text-gray-600 font-mono text-[11px]'
                        : 'bg-white border-gray-200 focus:border-[#8fae2a]'
                    }`}
                  />
                  {shippingAddressLink && (
                    <a
                      href={shippingAddressLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute end-3 top-3 text-[#546e3a] hover:text-[#8fae2a]"
                      title={isAr ? 'فتح الرابط في خرائط جوجل' : 'Open in Google Maps'}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Recipient First Name & Recipient Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                  {isAr ? 'اسم المستلم الأول' : 'Recipient first name'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={recipientFirstName}
                  onChange={(e) => setRecipientFirstName(e.target.value)}
                  placeholder={isAr ? 'الاسم الأول' : 'First Name'}
                  className={`w-full h-11 px-3.5 text-xs bg-white border rounded-xl focus:outline-none transition-all ${
                    errors.recipientFirstName
                      ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500/20'
                      : 'border-gray-200 focus:border-[#8fae2a] focus:ring-2 focus:ring-[#8fae2a]/20'
                  }`}
                />
                {errors.recipientFirstName && (
                  <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.recipientFirstName}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                  {isAr ? 'اسم عائلة المستلم' : 'Recipient last name'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={recipientLastName}
                  onChange={(e) => setRecipientLastName(e.target.value)}
                  placeholder={isAr ? 'اسم العائلة' : 'Last Name'}
                  className={`w-full h-11 px-3.5 text-xs bg-white border rounded-xl focus:outline-none transition-all ${
                    errors.recipientLastName
                      ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500/20'
                      : 'border-gray-200 focus:border-[#8fae2a] focus:ring-2 focus:ring-[#8fae2a]/20'
                  }`}
                />
                {errors.recipientLastName && (
                  <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.recipientLastName}</span>
                  </p>
                )}
              </div>
            </div>

            {/* 4. Phone Number & City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                  {isAr ? 'رقم هاتف المستلم' : 'Phone number'} <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <CountryCodePicker
                    value={recipientCountryCode}
                    onChange={(item) => setRecipientCountryCode(item.dialCode)}
                    locale={locale}
                  />
                  <input
                    type="tel"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="5XXXXXXXX"
                    dir="ltr"
                    className={`flex-1 h-11 px-3.5 text-xs bg-white border rounded-xl focus:outline-none transition-all ${
                      errors.recipientPhone
                        ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500/20'
                        : 'border-gray-200 focus:border-[#8fae2a] focus:ring-2 focus:ring-[#8fae2a]/20'
                    }`}
                  />
                </div>
                {errors.recipientPhone && (
                  <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.recipientPhone}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                  {isAr ? 'المدينة' : 'City'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={isAr ? 'جدة' : 'Jeddah'}
                  className="w-full h-11 px-3.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#8fae2a] focus:ring-2 focus:ring-[#8fae2a]/20 transition-all"
                />
              </div>
            </div>

            {/* Default Checkbox */}
            <div className="pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-gray-700 select-none">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 text-[#8fae2a] rounded border-gray-300 focus:ring-[#8fae2a]"
                />
                <span>
                  {isAr
                    ? 'تعيين هذا العنوان كعنوان افتراضي رئيسي في صفحة الدفع (Checkout)'
                    : 'Set as primary default address for checkout'}
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={handleCancel}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold transition-all cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#8fae2a] hover:bg-[#7d9b23] text-white text-xs font-bold transition-all shadow-md cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? isAr
                      ? 'جاري الحفظ...'
                      : 'Saving...'
                    : isAr
                      ? 'حفظ العنوان'
                      : 'Save Address'}
                </span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          SAVED ADDRESSES LIST (Up to 5) - Full-Width Row Layout
         ========================================================================= */}
      {isLoaded && savedAddresses.length > 0 ? (
        <div className="space-y-3.5">
          {savedAddresses.map((addr, index) => {
            const fullName = [addr.recipientFirstName, addr.recipientLastName].filter(Boolean).join(' ').trim();
            const isPrimary = addr.isDefault || index === 0;

            return (
              <div
                key={addr.id}
                className={`w-full p-4 sm:p-5 rounded-2xl border transition-all text-start relative group flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${
                  isPrimary
                    ? 'bg-[#FAF8F5] border-[#8fae2a] shadow-xs'
                    : 'bg-white border-[#E8DFD3] hover:border-gray-300 shadow-2xs'
                }`}
              >
                {/* Address Info */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#8fae2a]/15 text-[#546e3a] flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </span>
                    <span className="text-sm font-bold text-gray-900 truncate">
                      {fullName || (isAr ? 'مستلم الطلب' : 'Recipient')}
                    </span>

                    {isPrimary && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EAF5EC] text-[#2D6A4F] border border-[#C8E6CF]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isAr ? 'العنوان الافتراضي' : 'Default Address'}</span>
                      </span>
                    )}

                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                      {addr.city || (isAr ? 'جدة' : 'Jeddah')}
                    </span>
                  </div>

                  {/* Street & Location */}
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
                    {addr.shippingAddress}
                    {addr.district ? `, ${addr.district}` : ''}
                  </p>

                  {/* Meta Details: Phone & Pinned Map Link */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500">
                    {addr.recipientPhone && (
                      <span className="font-mono" dir="ltr">
                        {addr.recipientPhone}
                      </span>
                    )}

                    {addr.shippingAddressLink && (
                      <a
                        href={addr.shippingAddressLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] text-[#546e3a] hover:text-[#8fae2a] font-semibold hover:underline"
                      >
                        <MapPin className="w-3 h-3 text-[#8fae2a]" />
                        <span>{isAr ? 'موقع الخريطة المحدد' : 'Pinned Map Location'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="flex items-center justify-between md:justify-end gap-2.5 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                  <div>
                    {!isPrimary ? (
                      <button
                        type="button"
                        onClick={() => handleMakeDefault(addr)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-600 hover:text-[#546e3a] hover:bg-[#8fae2a]/10 border border-gray-200 transition-colors cursor-pointer"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-500" />
                        <span>{isAr ? 'تعيين كافتراضي' : 'Set as Default'}</span>
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400 italic hidden md:inline">
                        {isAr ? 'العنوان الرئيسي للطلبات' : 'Primary for checkout'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(addr)}
                      className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 transition-all cursor-pointer"
                      title={isAr ? 'تعديل العنوان' : 'Edit address'}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(addr)}
                      className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 border border-gray-200 transition-all cursor-pointer"
                      title={isAr ? 'حذف العنوان' : 'Delete address'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : isLoaded && !isEditing ? (
        <div className="py-14 px-6 rounded-3xl border border-dashed border-[#D5C6B5] bg-[#FAF8F5]/60 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#EBF1ED] text-[#435849] flex items-center justify-center mx-auto shadow-2xs">
            <MapPin className="w-7 h-7 text-[#546e3a]" />
          </div>
          <h3 className="text-base font-bold text-gray-900">
            {isAr ? 'لا توجد عناوين محفوظة حتى الآن' : 'No saved delivery addresses yet'}
          </h3>
          <p className="text-xs sm:text-sm text-[#7D7065] max-w-md mx-auto">
            {isAr
              ? 'احفظ حتى 5 عناوين توصيل مع تحديد الموقع بدقة على الخريطة لتسريع تجربة الدفع لطلباتك والهدايا.'
              : 'Save up to 5 delivery addresses with precise map pinning to speed up checkout for flowers and gifts.'}
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => handleStartEdit()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2D3F33] text-white hover:bg-[#202E25] text-xs font-bold transition-all shadow-md cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'إضافة أول عنوان توصيل' : 'Add First Delivery Address'}</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
