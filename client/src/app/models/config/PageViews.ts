export interface PageViews {
  home: HomeOptions;
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
