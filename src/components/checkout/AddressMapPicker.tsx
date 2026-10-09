'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Search, Crosshair, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

declare global {
  interface Window {
    google?: any;
  }
}

interface AddressMapPickerProps {
  locale: 'en' | 'ar';
  initialAddress?: string;
  initialLink?: string;
  onLocationSelect: (data: {
    address: string;
    locationLink: string;
    latitude: number;
    longitude: number;
    district?: string;
  }) => void;
}

// Google Maps API Key provided from WordPress site
const GOOGLE_MAPS_API_KEY = 'AIzaSyCbosaeW7BGsaBs14c5MwSJF7-6XRZedHE';

// Center from WordPress code
const JEDDAH_CENTER = {
  lat: 21.4925,
  lng: 39.17757,
};

// Exact Delivery Zone Polygon coordinates from WordPress code
const DELIVERY_AREA_COORDS = [
  { lat: 21.818088379848316, lng: 39.01471270367331 },
  { lat: 21.80294790216168, lng: 39.03067721172995 },
  { lat: 21.80470109206031, lng: 39.036342037169405 },
  { lat: 21.782067355063255, lng: 39.047843349425264 },
  { lat: 21.760227193634563, lng: 39.052306545226045 },
  { lat: 21.732494465354165, lng: 39.06911788257433 },
  { lat: 21.710327795459033, lng: 39.08422408374621 },
  { lat: 21.65864547036133, lng: 39.097785332525504 },
  { lat: 21.539897506890657, lng: 39.113234856451285 },
  { lat: 21.514771481965248, lng: 39.132576435833315 },
  { lat: 21.52211752093328, lng: 39.15248915555988 },
  { lat: 21.468725079819862, lng: 39.150123596191406 },
  { lat: 21.413834021864837, lng: 39.17826632382738 },
  { lat: 21.377072825265373, lng: 39.181356228612536 },
  { lat: 21.337104529116193, lng: 39.132947720311755 },
  { lat: 21.326502681758722, lng: 39.107457666708456 },
  { lat: 21.299475989425357, lng: 39.10488274605416 },
  { lat: 21.2472111864781, lng: 39.13896900226067 },
  { lat: 21.254250700731614, lng: 39.345649300112235 },
  { lat: 21.366837117598777, lng: 39.37792163897942 },
  { lat: 21.456013223135034, lng: 39.4369731526513 },
  { lat: 21.557533915627797, lng: 39.37232190264064 },
  { lat: 21.58818414777881, lng: 39.32768994463283 },
  { lat: 21.766847652938292, lng: 39.26348858965236 },
  { lat: 21.826193691933415, lng: 39.26569623149006 },
  { lat: 21.875266913703523, lng: 39.26054639018147 },
  { lat: 21.888647593171203, lng: 39.16750592387287 },
  { lat: 21.842171076581817, lng: 39.083496207088785 },
];

export function AddressMapPicker({
  locale,
  initialAddress,
  initialLink,
  onLocationSelect,
}: AddressMapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const polygonRef = useRef<any>(null);

  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [areaNotice, setAreaNotice] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState(initialAddress || '');

  // Check if coordinates fall within designated delivery polygon
  const isLocationInDeliveryArea = useCallback((latLng: any): boolean => {
    if (!polygonRef.current || !window.google?.maps?.geometry?.poly?.containsLocation) {
      return true; // Fallback if geometry library not yet available
    }
    return window.google.maps.geometry.poly.containsLocation(latLng, polygonRef.current);
  }, []);

  // Place marker and geocode address inside area
  const handleLocationInsideArea = useCallback(
    (latLng: any) => {
      const lat = typeof latLng.lat === 'function' ? latLng.lat() : latLng.lat;
      const lng = typeof latLng.lng === 'function' ? latLng.lng() : latLng.lng;

      // Move or create marker
      if (markerRef.current) {
        markerRef.current.setPosition(latLng);
      } else if (mapInstanceRef.current && window.google) {
        markerRef.current = new window.google.maps.Marker({
          position: latLng,
          map: mapInstanceRef.current,
          animation: window.google.maps.Animation.DROP,
        });
      }

      setAreaNotice(null);

      const addressLink = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

      // Reverse geocode via Google Geocoder
      if (window.google?.maps?.Geocoder) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: latLng }, (results: any, status: any) => {
          if (status === 'OK' && results && results[0]) {
            const formatted = results[0].formatted_address;
            let district = '';

            // Extract district / sublocality
            const sublocality = results[0].address_components?.find((c: any) =>
              c.types.includes('sublocality') || c.types.includes('neighborhood')
            );
            if (sublocality) district = sublocality.long_name;

            setSelectedAddress(formatted);
            onLocationSelect({
              address: formatted,
              locationLink: addressLink,
              latitude: lat,
              longitude: lng,
              district,
            });
          } else {
            const fallback = `Jeddah (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
            setSelectedAddress(fallback);
            onLocationSelect({
              address: fallback,
              locationLink: addressLink,
              latitude: lat,
              longitude: lng,
            });
          }
        });
      } else {
        const fallback = `Jeddah (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
        setSelectedAddress(fallback);
        onLocationSelect({
          address: fallback,
          locationLink: addressLink,
          latitude: lat,
          longitude: lng,
        });
      }
    },
    [onLocationSelect]
  );

  // When location is clicked/chosen
  const processLocationSelection = useCallback(
    (latLng: any) => {
      if (isLocationInDeliveryArea(latLng)) {
        handleLocationInsideArea(latLng);
      } else {
        const warning =
          locale === 'ar'
            ? 'يرجى اختيار موقع داخل نطاق منطقة التوصيل المحددة باللون الأخضر.'
            : 'Please select a location within the highlighted delivery area.';
        setAreaNotice(warning);
        alert(warning);
      }
    },
    [isLocationInDeliveryArea, handleLocationInsideArea, locale]
  );

  // Initialize Map
  const initializeGoogleMap = useCallback(() => {
    if (!mapContainerRef.current || !window.google?.maps) return;
    if (mapInstanceRef.current) return;

    // Create Map
    const map = new window.google.maps.Map(mapContainerRef.current, {
      center: JEDDAH_CENTER,
      zoom: 11,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
    });
    mapInstanceRef.current = map;

    // Draw the delivery area polygon (matching WordPress style)
    const areaPolygon = new window.google.maps.Polygon({
      paths: DELIVERY_AREA_COORDS,
      strokeColor: '#40FF40',
      strokeOpacity: 0.85,
      strokeWeight: 2.5,
      fillColor: '#40FF40',
      fillOpacity: 0.2,
      map: map,
    });
    polygonRef.current = areaPolygon;

    // Map Click Listener
    map.addListener('click', (event: any) => {
      if (event?.latLng) {
        processLocationSelection(event.latLng);
      }
    });

    // Polygon Click Listener
    areaPolygon.addListener('click', (event: any) => {
      if (event?.latLng) {
        processLocationSelection(event.latLng);
      }
    });

    // Setup Google Places Autocomplete on the input
    if (searchInputRef.current && window.google.maps.places?.Autocomplete) {
      const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current, {
        componentRestrictions: { country: 'sa' },
        fields: ['geometry', 'formatted_address', 'address_components'],
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) {
          return;
        }

        const loc = place.geometry.location;
        if (isLocationInDeliveryArea(loc)) {
          map.setCenter(loc);
          map.setZoom(15);
          handleLocationInsideArea(loc);
        } else {
          const warning =
            locale === 'ar'
              ? 'العنوان المحدد يقع خارج نطاق منطقة التوصيل المتاحة.'
              : 'The selected address is outside of the active delivery coverage area.';
          setAreaNotice(warning);
          alert(warning);
        }
      });
    }

    setIsMapLoaded(true);
  }, [processLocationSelection, isLocationInDeliveryArea, handleLocationInsideArea, locale]);

  // Load Google Maps Script
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if already loaded
    if (window.google?.maps?.geometry && window.google?.maps?.places) {
      initializeGoogleMap();
      return;
    }

    const scriptId = 'google-maps-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry&language=${locale}`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        initializeGoogleMap();
      };

      script.onerror = () => {
        setLoadError('Failed to load Google Maps. Please check network connection.');
      };

      document.head.appendChild(script);
    } else {
      script.addEventListener('load', () => initializeGoogleMap());
      if (window.google?.maps) {
        initializeGoogleMap();
      }
    }
  }, [initializeGoogleMap, locale]);

  // "Locate Me" GPS Button
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert(locale === 'ar' ? 'المتصفح لا يدعم تحديد الموقع' : 'Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        if (!window.google?.maps) return;

        const currentPos = new window.google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter(currentPos);
          mapInstanceRef.current.setZoom(15);
        }

        processLocationSelection(currentPos);
      },
      () => {
        setIsLocating(false);
        alert(
          locale === 'ar'
            ? 'تعذر الوصول إلى موقعك الحالي. يرجى تفعيل إذن الموقع أو اختيار الموقع يدوياً من الخريطة.'
            : 'Unable to access your current location. Please allow location permissions.'
        );
      },
      { timeout: 10000 }
    );
  };

  return (
    <div className="space-y-3">
      {/* Search Input with Google Places Autocomplete */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input
            ref={searchInputRef}
            type="text"
            id="shipping_address_search"
            placeholder={
              locale === 'ar'
                ? 'ابحث عن عنوان في جدة (حي، شارع، معلم)...'
                : 'Search for an address in Jeddah...'
            }
            className="w-full h-11 px-3.5 ps-10 text-xs bg-white border border-gray-200 rounded-lg focus:border-[#8fae2a] focus:outline-none transition-all shadow-2xs"
          />
          <Search className="w-4 h-4 text-gray-400 absolute start-3.5 top-3.5 pointer-events-none" />
        </div>

        <button
          type="button"
          onClick={handleLocateMe}
          disabled={isLocating}
          className="h-11 px-4 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:border-[#8fae2a] hover:text-[#546e3a] transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
        >
          {isLocating ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8fae2a]" /> : <Crosshair className="w-3.5 h-3.5 text-[#546e3a]" />}
          <span>{locale === 'ar' ? 'موقعي الحالي' : 'Locate Me'}</span>
        </button>
      </div>

      {/* Out of Delivery Area Warning Notice */}
      {areaNotice && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-900 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{areaNotice}</span>
        </div>
      )}

      {/* Interactive Google Map Box */}
      <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-2xs bg-gray-50">
        <div
          ref={mapContainerRef}
          id="shipping_map"
          style={{ height: '300px' }}
          className="w-full z-0"
        />

        {!isMapLoaded && !loadError && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center gap-2 text-xs text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin text-[#8fae2a]" />
            <span>{locale === 'ar' ? 'جارٍ تحميل خريطة جوجل...' : 'Loading Google Maps...'}</span>
          </div>
        )}

        {loadError && (
          <div className="absolute inset-0 bg-white flex items-center justify-center p-4 text-center text-xs text-red-500">
            {loadError}
          </div>
        )}

        {/* Legend / Status badge */}
        <div className="absolute bottom-2.5 start-2.5 z-10 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-gray-200 shadow-xs flex items-center gap-2 text-[11px] font-medium text-gray-700">
          <span className="w-3 h-3 rounded-full bg-[#40FF40] border border-green-600 inline-block shrink-0" />
          <span>
            {locale === 'ar'
              ? 'المنطقة الخضراء: نطاق التوصيل المعتمد لمدينة جدة'
              : 'Green Zone: Active delivery coverage area in Jeddah'}
          </span>
        </div>
      </div>

      {selectedAddress && (
        <div className="text-[11.5px] text-[#546e3a] font-semibold flex items-center gap-1.5 px-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#8fae2a]" />
          <span>
            {locale === 'ar' ? 'الموقع المحدد: ' : 'Selected Spot: '}
            <span className="text-gray-800 font-normal">{selectedAddress}</span>
          </span>
        </div>
      )}
    </div>
  );
}
