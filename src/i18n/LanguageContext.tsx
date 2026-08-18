import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Language, translations } from './translations';

const LOCAL_STORAGE_LANG_KEY = 'family_tree_lang_v1';

function getNested(obj: any, path: string[]): unknown {
  return path.reduce((acc, key) => (acc && typeof acc === 'object' ? acc[key] : undefined), obj);
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const val = vars[key];
    return val !== undefined ? String(val) : match;
  });
}

function detectInitialLanguage(): Language {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_LANG_KEY);
    if (saved === 'lt' || saved === 'en') return saved;
  } catch {
    // ignore
  }
  if (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('lt')) {
    return 'lt';
  }
  return 'en';
}

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(detectInitialLanguage);

  const setLang = useCallback((next: Language) => {
    setLangState(next);
    try {
      localStorage.setItem(LOCAL_STORAGE_LANG_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const path = key.split('.');
      const dict: Record<string, unknown> = translations[lang];
      const value = getNested(dict, path);
      if (typeof value === 'string') return interpolate(value, vars);

      const fallback = getNested(translations.en, path);
      if (typeof fallback === 'string') return interpolate(fallback, vars);

      return key;
    },
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export function useTranslation(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return ctx;
}
