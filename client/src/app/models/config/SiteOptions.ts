export interface SiteOptions {
  language: LanguageOptions;
  home: HomeOptions;
  navbar: NavbarOptions;
  footer: FooterOptions;
}

export type LanguageKey = 'de' | 'en' | 'fr' | 'es' | 'it';
export const AVAILABLE_LANGUAGES: LanguageKey[] = ['de', 'en', 'fr', 'es', 'it'];

export interface LanguageOptions {
  initial: LanguageKey;
  available: LanguageKey[];
}

export interface NavbarOptions {
  image?: string;
  items?: NavItem[];
}

export interface HomeOptions {
  hero?: HeroOptions;
}

export interface HeroOptions {
  title?: string;
  subTitle?: string;
  align?: HeroAlign;
  background?: HeroBackground;
  image?: string;
}

export type HeroAlign = 'left' | 'center' | 'right';
export type HeroBackground = 'gradient' | 'soft' | 'dark' | 'light';

export interface FooterOptions {
  notice?: string;
  columns: FooterColumn[];
  cooperation?: FooterCooperation;
  links?: NavItem[];
}

export interface MenuItem {
  label?: string;
  href?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  classes?: string[];
}

export interface NavItem extends MenuItem {
  label: string;
  isExactMatch?: boolean;
  items?: MenuItem[];
}

export interface ImageItem extends MenuItem {
  src: string;
  alt?: string;
}

export type FooterColumn = FooterLinks | FooterMarkdown | FooterSpace;

export interface FooterContent {
  caption: string;
  classes?: string[];
}

export interface FooterSpace {
  kind: 'empty';
  classes?: string[];
}

export interface FooterLinks extends FooterContent {
  kind: 'links';
  items: MenuItem[];
}

export interface FooterMarkdown extends FooterContent {
  kind: 'markdown';
  file: string;
}

export interface FooterCooperation {
  caption?: string;
  items: ImageItem[];
}
