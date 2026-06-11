import { Component, computed, inject, input, InputSignal, Signal } from '@angular/core';
import { ContentService } from '../../../../services/content.service';
import { TranslocoDirective } from '@jsverse/transloco';
import { NgClass, NgStyle } from '@angular/common';

type HeroAlign = 'left' | 'center' | 'right';
type HeroBackground = 'gradient' | 'soft' | 'dark' | 'light';

@Component({
  selector: 'shared-hero',
  imports: [TranslocoDirective, NgClass, NgStyle],
  templateUrl: './hero.component.html',
})
export class HeroComponent {
  public align: InputSignal<HeroAlign> = input<HeroAlign>('center');
  public title: InputSignal<string | undefined> = input<string>();
  public subTitle: InputSignal<string | undefined> = input<string>();

  public image: InputSignal<string | undefined> = input<string>();
  public background: InputSignal<HeroBackground> = input<HeroBackground>('light');

  private readonly contentService: ContentService = inject(ContentService);

  protected readonly heroImage: Signal<string | null> = computed((): string | null => {
    const image: string | undefined = this.image();
    return image ? this.contentService.resolveAssetUrl(image) : null;
  });

  protected readonly heroClasses: Signal<string[]> = computed((): string[] => {
    const background: string = this.heroImage() ? 'bg-dark md:bg-parallax' : `bg-${this.background()}`;
    return [background, this.resolveHeroAlign(this.align())];
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

  private resolveHeroAlign(align: HeroAlign): string {
    switch (align) {
      case 'left':
        return 'items-start text-left';
      case 'right':
        return 'items-end text-right';
      case 'center':
        return 'items-center text-center';
    }
  }
}
