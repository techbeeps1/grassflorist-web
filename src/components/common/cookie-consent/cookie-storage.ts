import { CookiePreferences, COOKIE_CONSENT_KEY } from './cookie-consent-data';

export const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  functional: true,
  analytics: true,
  performance: true,
  advertisement: true,
  uncategorized: true,
  updatedAt: new Date().toISOString(),
};

export const REJECT_ALL_PREFERENCES: CookiePreferences = {
  necessary: true,
  functional: false,
  analytics: false,
  performance: false,
  advertisement: false,
  uncategorized: false,
  updatedAt: new Date().toISOString(),
};

export function getStoredConsent(): CookiePreferences | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.necessary === true) {
      return parsed as CookiePreferences;
    }
  } catch (e) {
    console.error('Error reading cookie consent preferences:', e);
  }
  return null;
}

export function applyGtagConsent(prefs: CookiePreferences) {
  if (typeof window === 'undefined') return;
  const w = window as any;
  if (typeof w.gtag === 'function') {
    try {
      w.gtag('consent', 'update', {
        analytics_storage: prefs.analytics ? 'granted' : 'denied',
        ad_storage: prefs.advertisement ? 'granted' : 'denied',
        ad_user_data: prefs.advertisement ? 'granted' : 'denied',
        ad_personalization: prefs.advertisement ? 'granted' : 'denied',
        functionality_storage: prefs.functional ? 'granted' : 'denied',
        performance_storage: prefs.performance ? 'granted' : 'denied',
      });
    } catch (e) {
      // ignore
    }
  }
}

export function saveConsent(prefs: Partial<CookiePreferences>): CookiePreferences {
  const full: CookiePreferences = {
    necessary: true,
    functional: prefs.functional ?? false,
    analytics: prefs.analytics ?? false,
    performance: prefs.performance ?? false,
    advertisement: prefs.advertisement ?? false,
    uncategorized: prefs.uncategorized ?? false,
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(full));
      
      // Write Cookie for 1 year
      const date = new Date();
      date.setFullYear(date.getFullYear() + 1);
      const expires = `expires=${date.toUTCString()}`;
      const cookieVal = `action:yes,necessary:yes,functional:${full.functional ? 'yes' : 'no'},analytics:${full.analytics ? 'yes' : 'no'},performance:${full.performance ? 'yes' : 'no'},advertisement:${full.advertisement ? 'yes' : 'no'},uncategorized:${full.uncategorized ? 'yes' : 'no'}`;
      document.cookie = `cookieyes-consent=${encodeURIComponent(cookieVal)}; ${expires}; path=/; SameSite=Lax`;
    } catch (e) {
      console.error('Error storing cookie consent:', e);
    }

    applyGtagConsent(full);
    window.dispatchEvent(new CustomEvent('grass-cookie-consent-updated', { detail: full }));
  }

  return full;
}

export function openCookiePreferencesModal() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-cookie-preferences'));
  }
}
