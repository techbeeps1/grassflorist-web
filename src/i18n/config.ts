export const i18nConfig = {
  defaultLocale: 'ar',
  locales: ['ar', 'en'],
} as const;

export type Locale = (typeof i18nConfig.locales)[number];
