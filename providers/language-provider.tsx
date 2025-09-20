import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { LanguageCode, DEFAULT_LANGUAGE } from '@/constants/languages';
import { getTranslation, TranslationKey } from '@/locales';

const RTL_LANGUAGES: LanguageCode[] = ['ar'];
const STORAGE_KEY = 'app_language';

export const [LanguageProvider, useLanguage] = createContextHook(() => {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(DEFAULT_LANGUAGE);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const isValidLanguage = useCallback((language: string): boolean => {
    if (!language || typeof language !== 'string' || language.trim().length === 0) {
      return false;
    }
    const validLanguages: LanguageCode[] = ['pt', 'en', 'es', 'fr', 'de', 'it', 'zh', 'ar', 'ja', 'ru'];
    return validLanguages.includes(language.trim() as LanguageCode);
  }, []);

  const loadSavedLanguage = useCallback(async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedLanguage && isValidLanguage(savedLanguage)) {
        setCurrentLanguage(savedLanguage.trim() as LanguageCode);
      }
    } catch (error) {
      console.log('Error loading saved language:', error);
    } finally {
      setIsLoaded(true);
    }
  }, [isValidLanguage]);

  useEffect(() => {
    loadSavedLanguage();
  }, [loadSavedLanguage]);

  const setLanguage = useCallback(async (language: LanguageCode) => {
    if (!language || typeof language !== 'string' || language.trim().length === 0) {
      return;
    }
    const sanitizedLanguage = language.trim();
    if (sanitizedLanguage.length > 10) {
      return;
    }
    if (!isValidLanguage(sanitizedLanguage)) {
      return;
    }
    try {
      await AsyncStorage.setItem(STORAGE_KEY, sanitizedLanguage);
      setCurrentLanguage(sanitizedLanguage as LanguageCode);
    } catch (error) {
      console.log('Error saving language:', error);
    }
  }, [isValidLanguage]);

  const t = useCallback((key: TranslationKey): string => {
    if (!key || typeof key !== 'string' || key.trim().length === 0) {
      return '';
    }
    const sanitizedKey = key.trim();
    if (sanitizedKey.length > 100) {
      return '';
    }
    return getTranslation(currentLanguage, sanitizedKey as TranslationKey);
  }, [currentLanguage]);

  const isRTL = useMemo(() => RTL_LANGUAGES.includes(currentLanguage), [currentLanguage]);

  return {
    currentLanguage,
    setLanguage,
    t,
    isRTL,
    isLoaded,
  };
});