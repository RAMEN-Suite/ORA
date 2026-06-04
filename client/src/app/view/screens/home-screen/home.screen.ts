import { Component, computed, inject, Signal } from '@angular/core';
import { NgClass, NgStyle } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';
import { ConfigService } from '../../../services/config.service';
import { ContentService } from '../../../services/content.service';
import { HeroAlign, HomeOptions } from '../../../models/config/SiteOptions';

@Component({
  selector: 'screen-home',
  imports: [NgClass, TranslocoDirective, NgStyle],
  templateUrl: './home.screen.html',
})
export class HomeScreen {
  private readonly configService: ConfigService = inject(ConfigService);
  private readonly contentService: ContentService = inject(ContentService);

  protected readonly options: HomeOptions = this.configService.config().getSite().home;

  protected readonly heroImage: Signal<string | null> = computed((): string | null => {
    const image: string | undefined = this.options.hero?.image;
    return image ? this.contentService.resolveAssetUrl(image) : null;
  });

  protected readonly heroClasses: Signal<string[]> = computed((): string[] => {
    const align: HeroAlign | undefined = this.options.hero?.align;
    const background: string = this.heroImage() ? 'bg-dark md:bg-parallax' : `bg-${this.options.hero?.background ?? 'light'}`;
    return [background, this.resolveHeroAlign(align)];
  });

  protected readonly heroStyles: Signal<Record<string, string | null>> = computed((): Record<string, string | null> => {
    const image: string | null = this.heroImage();
    if (!image) return {};

    return {
      'background-image': `url(${image})`,
      'background-size': 'cover',
      'background-position': 'center',
      'background-repeat': 'no-repeat',
    };
  });

  private resolveHeroAlign(align: HeroAlign | undefined): string {
    switch (align ?? 'center') {
      case 'left':
        return 'items-start text-left';
      case 'right':
        return 'items-end text-right';
      case 'center':
        return 'items-center text-center';
    }
  }
}
