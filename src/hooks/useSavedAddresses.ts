import { useState, useEffect, useMemo, useCallback } from 'react';
import { type Locale } from '@/config/site';

export interface SavedAddressOption {
  id: string;
  label: string;
  recipientFirstName: string;
  recipientLastName: string;
  recipientPhone: string;
  shippingAddress: string;
  shippingAddressLink: string;
  city: string;
  district?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

export function useSavedAddresses(
  user: any,
  locale: Locale = 'ar',
  userOrders?: any[],
  profileUser?: any
) {
  const [localAddresses, setLocalAddresses] = useState<SavedAddressOption[]>([]);
  const [deletedAddressKeys, setDeletedAddressKeys] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadFromStorage = useCallback(() => {
    if (!user?.id) {
      setLocalAddresses([]);
      setDeletedAddressKeys([]);
      setIsLoaded(true);
      return;
    }
    try {
      const storageKey = `grass_saved_addresses_${user.id}`;
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        setLocalAddresses(JSON.parse(raw));
      } else {
        setLocalAddresses([]);
      }

      const delKey = `grass_deleted_address_keys_${user.id}`;
      const rawDel = localStorage.getItem(delKey);
      if (rawDel) {
        setDeletedAddressKeys(JSON.parse(rawDel));
      } else {
        setDeletedAddressKeys([]);
      }
    } catch {
      // ignore JSON errors
    } finally {
      setIsLoaded(true);
    }
  }, [user?.id]);

  useEffect(() => {
    loadFromStorage();

    const handleAddressUpdate = () => {
      loadFromStorage();
    };

    window.addEventListener('grass_addresses_updated', handleAddressUpdate);
    window.addEventListener('storage', handleAddressUpdate);

    return () => {
      window.removeEventListener('grass_addresses_updated', handleAddressUpdate);
      window.removeEventListener('storage', handleAddressUpdate);
    };
  }, [loadFromStorage]);

  // Combined list of up to 5 saved addresses (matching checkout logic exactly)
  const savedAddresses = useMemo<SavedAddressOption[]>(() => {
    if (!user) return [];

    const list: SavedAddressOption[] = [];
    const seenKeys = new Set<string>();
    const deletedSet = new Set(deletedAddressKeys);

    // 1. From localAddresses (most recent or manually managed)
    localAddresses.forEach((addr, idx) => {
      const key = `${addr.shippingAddress || ''}_${addr.recipientPhone || ''}`.trim().toLowerCase();
      if (key && !seenKeys.has(key) && !deletedSet.has(key) && !deletedSet.has(addr.id)) {
        seenKeys.add(key);
        list.push({
          ...addr,
          isDefault: idx === 0,
        });
      }
    });

    // 2. From User Past Orders (if under 5)
    if (list.length < 5 && Array.isArray(userOrders) && userOrders.length > 0) {
      for (let idx = 0; idx < userOrders.length; idx++) {
        if (list.length >= 5) break;
        const order = userOrders[idx];
        const rec = order?.recipient;
        if (rec && (rec.street || rec.city)) {
          const street = rec.street || '';
          const phone = rec.phone || '';
          const key = `${street}_${phone}`.trim().toLowerCase();
          const orderId = `order_${order.orderNumber || idx}`;
          if (key && !seenKeys.has(key) && !deletedSet.has(key) && !deletedSet.has(orderId)) {
            seenKeys.add(key);
            const nameParts = (rec.name || '').trim().split(' ');
            const fName = nameParts[0] || '';
            const lName = nameParts.slice(1).join(' ') || '';
            list.push({
              id: orderId,
              label: `${rec.name || 'Recipient'} - ${street}${rec.district ? `, ${rec.district}` : ''} (${rec.city || 'Jeddah'})`,
              recipientFirstName: fName,
              recipientLastName: lName,
              recipientPhone: phone.replace(/^\+966/, ''),
              shippingAddress: street,
              shippingAddressLink: order.location_link || order.shipping_address_link || '',
              city: rec.city || (locale === 'ar' ? 'جدة' : 'Jeddah'),
              district: rec.district || '',
              isDefault: list.length === 0,
            });
          }
        }
      }
    }

    // 3. From User Profile (if still under 5)
    if (list.length < 5) {
      const activeProfile = profileUser || user;
      if (activeProfile && (activeProfile.street || activeProfile.address || activeProfile.city)) {
        const street = activeProfile.street || activeProfile.address || '';
        const phone = activeProfile.phone || '';
        const key = `${street}_${phone}`.trim().toLowerCase();
        if (key && !seenKeys.has(key) && !deletedSet.has(key) && !deletedSet.has('profile_address')) {
          seenKeys.add(key);
          const nameParts = (activeProfile.name || `${activeProfile.first_name || ''} ${activeProfile.last_name || ''}`).trim().split(' ');
          list.push({
            id: 'profile_address',
            label: `${activeProfile.name || 'My Profile'} - ${street}${activeProfile.district ? `, ${activeProfile.district}` : ''} (${activeProfile.city || 'Jeddah'})`,
            recipientFirstName: nameParts[0] || '',
            recipientLastName: nameParts.slice(1).join(' ') || '',
            recipientPhone: (activeProfile.phone || '').replace(/^\+966/, ''),
            shippingAddress: street,
            shippingAddressLink: '',
            city: activeProfile.city || (locale === 'ar' ? 'جدة' : 'Jeddah'),
            district: activeProfile.district || '',
            isDefault: list.length === 0,
          });
        }
      }
    }

    return list.slice(0, 5);
  }, [user, localAddresses, userOrders, profileUser, deletedAddressKeys, locale]);

  // Add or Edit Address (MAX 5)
  const saveAddress = useCallback(
    (addrData: {
      id?: string;
      recipientFirstName: string;
      recipientLastName: string;
      recipientPhone: string;
      shippingAddress: string;
      shippingAddressLink?: string;
      city: string;
      district?: string;
      latitude?: number;
      longitude?: number;
      isDefault?: boolean;
    }) => {
      if (!user?.id || !addrData.shippingAddress) return;

      const labelName = `${addrData.recipientFirstName} ${addrData.recipientLastName}`.trim();
      const label = `${labelName ? `${labelName} - ` : ''}${addrData.shippingAddress}${addrData.district ? `, ${addrData.district}` : ''} (${addrData.city || 'Jeddah'})`;

      const id = addrData.id && !addrData.id.startsWith('order_') && addrData.id !== 'profile_address'
        ? addrData.id
        : `saved_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      const newOption: SavedAddressOption = {
        id,
        label,
        recipientFirstName: addrData.recipientFirstName,
        recipientLastName: addrData.recipientLastName,
        recipientPhone: addrData.recipientPhone,
        shippingAddress: addrData.shippingAddress,
        shippingAddressLink: addrData.shippingAddressLink || '',
        city: addrData.city || (locale === 'ar' ? 'جدة' : 'Jeddah'),
        district: addrData.district || '',
        latitude: addrData.latitude,
        longitude: addrData.longitude,
      };

      // Current full list from savedAddresses
      let currentList = [...savedAddresses];

      // If updating an existing one
      const existingIdx = currentList.findIndex((a) => a.id === addrData.id);
      if (existingIdx !== -1) {
        currentList[existingIdx] = newOption;
      } else {
        // Dedup by address + phone
        currentList = currentList.filter(
          (item) =>
            `${item.shippingAddress}_${item.recipientPhone}`.trim().toLowerCase() !==
            `${addrData.shippingAddress}_${addrData.recipientPhone}`.trim().toLowerCase()
        );
        // Prepend new item
        currentList = [newOption, ...currentList];
      }

      // If marked as default, ensure it is at index 0
      if (addrData.isDefault) {
        currentList = [newOption, ...currentList.filter((a) => a.id !== newOption.id)];
      }

      // Keep max 5
      const max5 = currentList.slice(0, 5);

      try {
        localStorage.setItem(`grass_saved_addresses_${user.id}`, JSON.stringify(max5));
        setLocalAddresses(max5);
        window.dispatchEvent(new Event('grass_addresses_updated'));
      } catch {
        // ignore
      }
    },
    [user?.id, savedAddresses, locale]
  );

  // Delete an address
  const deleteAddress = useCallback(
    (addrToRemove: SavedAddressOption) => {
      if (!user?.id) return;
      const key = `${addrToRemove.shippingAddress || ''}_${addrToRemove.recipientPhone || ''}`.trim().toLowerCase();

      const newDeletedKeys = [...deletedAddressKeys, key, addrToRemove.id];
      setDeletedAddressKeys(newDeletedKeys);
      try {
        localStorage.setItem(`grass_deleted_address_keys_${user.id}`, JSON.stringify(newDeletedKeys));
      } catch {}

      const updatedLocal = localAddresses.filter(
        (a) =>
          a.id !== addrToRemove.id &&
          `${a.shippingAddress || ''}_${a.recipientPhone || ''}`.trim().toLowerCase() !== key
      );
      setLocalAddresses(updatedLocal);
      try {
        localStorage.setItem(`grass_saved_addresses_${user.id}`, JSON.stringify(updatedLocal));
        window.dispatchEvent(new Event('grass_addresses_updated'));
      } catch {}
    },
    [user?.id, deletedAddressKeys, localAddresses]
  );

  // Set default address (move to top)
  const setDefaultAddress = useCallback(
    (addressId: string) => {
      if (!user?.id) return;
      const found = savedAddresses.find((a) => a.id === addressId);
      if (!found) return;

      const reordered = [found, ...savedAddresses.filter((a) => a.id !== addressId)].slice(0, 5);
      setLocalAddresses(reordered);
      try {
        localStorage.setItem(`grass_saved_addresses_${user.id}`, JSON.stringify(reordered));
        window.dispatchEvent(new Event('grass_addresses_updated'));
      } catch {}
    },
    [user?.id, savedAddresses]
  );

  return {
    savedAddresses,
    isLoaded,
    saveAddress,
    deleteAddress,
    setDefaultAddress,
  };
}
