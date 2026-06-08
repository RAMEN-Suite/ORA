export interface PageViews {
  home: HomeOptions;
}

export interface HomeOptions {
  hero?: HeroOptions;
  main?: Content[];
  aside?: Content[];
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
