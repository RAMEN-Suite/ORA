import { Component, computed, inject, Signal } from '@angular/core';
import { ConfigService } from '../../../services/config.service';
import { ContentSection, HomeOptions } from '../../../models/config/PageViews';
import { HeroComponent } from '../../shared/interfaces/hero/hero.component';
import { ScreenShellComponent } from '../../shared/layout/screen-shell/screen-shell.component';
import { ContentRendererComponent } from '../../shared/renderer/content-renderer/content-renderer.component';
import { TranslocoDirective } from '@jsverse/transloco';
import { TitleService } from '../../../services/title.service';

@Component({
  selector: 'screen-home',
  imports: [HeroComponent, ScreenShellComponent, ContentRendererComponent, TranslocoDirective],
  templateUrl: './home.screen.html',
})
export class HomeScreen {
  private readonly titleService: TitleService = inject(TitleService);
  private readonly configService: ConfigService = inject(ConfigService);

  protected readonly options: HomeOptions = this.configService.config().getHomeOptions();
  protected readonly mainContent: Signal<ContentSection[]> = computed((): ContentSection[] => this.options.main ?? []);
  protected readonly asideContent: Signal<ContentSection[]> = computed((): ContentSection[] => this.options.aside ?? []);

  public constructor() {
    this.titleService.reset();
  }
}
