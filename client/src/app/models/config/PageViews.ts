export interface PageViews {
  home: HomeOptions;
  pages?: Page[];
}

export interface Page {
  path: string;
  title: string;
  icon?: string;
  content?: PageContent;
  views?: PageView[];
}

export interface PageView {
  path: string;
  title: string;
  icon?: string;
  content?: PageContent;
  views?: PageView[];
}

export interface PageContent {
  main?: ContentSection[];
  aside?: ContentSection[];
}

export interface ContentSection {
  blocks: Content[];
}

export interface HomeOptions {
  hero?: HeroOptions;
  main?: ContentSection[];
  aside?: ContentSection[];
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

export type Content = MarkdownContent;

export interface ContentOf<TType extends string, TProperties> {
  type: TType;
  properties: TProperties;
}

export type MarkdownContent = ContentOf<'markdown', MarkdownContentProperties>;

export interface MarkdownContentProperties {
  file: string;
}
