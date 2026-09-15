import { type Locale } from './config';
import arDict from './dictionaries/ar.json';
import enDict from './dictionaries/en.json';

const dictionaries = {
  ar: arDict,
  en: enDict,
};

export type Dictionary = typeof arDict;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] || dictionaries.ar;
}
