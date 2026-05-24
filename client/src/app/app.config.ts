import {
  ApplicationConfig,
  inject,
  isDevMode,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import { SuitePreset } from '../styles/suite-preset.js';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpCache, withHttpCacheInterceptor, withLocalStorage } from '@ngneat/cashew';
import { ConfigService } from './services/config.service';
import { MARKED_OPTIONS, provideMarkdown } from 'ngx-markdown';
import { TranslocoHttpLoader } from './transloco-loader';
import { provideTransloco, TranslocoService } from '@jsverse/transloco';
import { markedOptionsFactory } from './utils/Markdown';
import { LanguageOptions } from './models/config/SiteOptions';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer(initApplication),
    providePrimeNG({ theme: { preset: SuitePreset, options: { darkModeSelector: '.dark' } } }),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })),
    provideHttpClient(withInterceptors([withHttpCacheInterceptor()])),
    provideHttpCache(withLocalStorage()),
    provideMarkdown({ markedOptions: { provide: MARKED_OPTIONS, useFactory: markedOptionsFactory } }),
    provideTransloco({ config: { reRenderOnLangChange: true, prodMode: !isDevMode() }, loader: TranslocoHttpLoader }),
  ],
};

async function initApplication(): Promise<void> {
  const configService: ConfigService = inject(ConfigService);
  const translocoService: TranslocoService = inject(TranslocoService);
  await inject(ConfigService).init();

  const options: LanguageOptions = configService.config().language();
  translocoService.setDefaultLang(options.initial);
  translocoService.setActiveLang(options.initial);
  translocoService.setAvailableLangs(options.available);
}
