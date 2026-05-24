export interface SiteOptions {
  language: LanguageOptions;
  navbar: NavbarOptions;
}

export type LanguageKey = 'de' | 'en' | 'fr' | 'es' | 'it';
export const AVAILABLE_LANGUAGES: LanguageKey[] = ['de', 'en', 'fr', 'es', 'it'];

export interface LanguageOptions {
  initial: LanguageKey;
  available: LanguageKey[];
}

interface NavbarOptions {
  image?: string;
  items?: NavItem[];
}

export interface NavItem {
  label: string;
  href?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  isExactMatch?: boolean;
  items?: NavItem[];
}
