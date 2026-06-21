import { effect, EffectCleanupRegisterFn, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslocoService } from '@jsverse/transloco';
import { Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TitleService {
  private readonly title: Title = inject(Title);
  private readonly transloco: TranslocoService = inject(TranslocoService);

  private readonly defaultTitle: string = this.title.getTitle();
  private readonly value: WritableSignal<string | null> = signal(null);

  public constructor() {
    effect((onCleanup: EffectCleanupRegisterFn): void => {
      const value: string | null = this.value();
      if (!value) return this.title.setTitle(this.defaultTitle);

      const subscription: Subscription = this.transloco.selectTranslate(value).subscribe(this.translate.bind(this));
      onCleanup((): void => subscription.unsubscribe());
    });
  }

  public set(value: string | null | undefined): void {
    this.value.set(value ?? null);
  }

  public reset(): void {
    this.value.set(null);
  }

  private translate(translated: string): void {
    this.title.setTitle(this.format(translated));
  }

  private format(title: string): string {
    if (!this.defaultTitle || title === this.defaultTitle) return title;
    return `${title} | ${this.defaultTitle}`;
  }
}
