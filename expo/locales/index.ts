import { pt } from './pt';
import { en } from './en';
import { es } from './es';
import { fr } from './fr';
import { de } from './de';
import { it } from './it';
import { zh } from './zh';
import { ar } from './ar';
import { ja } from './ja';
import { ru } from './ru';
import type { LanguageCode } from '@/constants/languages';

export const translations = {
  pt,
  en,
  es,
  fr,
  de,
  it,
  zh,
  ar,
  ja,
  ru,
} as const;

export type TranslationKey = keyof typeof pt;

export function getTranslation(language: LanguageCode, key: TranslationKey): string {
  return translations[language][key] || translations.pt[key];
}