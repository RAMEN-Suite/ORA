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
import { provideMarkdown } from 'ngx-markdown';
import { TranslocoHttpLoader } from './transloco-loader';
import { provideTransloco } from '@jsverse/transloco';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer((): Promise<void> => inject(ConfigService).init()),
    providePrimeNG({ theme: { preset: SuitePreset, options: { darkModeSelector: '.dark' } } }),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })),
    provideHttpClient(withInterceptors([withHttpCacheInterceptor()])),
    provideHttpCache(withLocalStorage()),
    provideMarkdown(),
    provideTransloco({
      config: {
        availableLangs: ['de', 'en', 'fr', 'it', 'es'],
        defaultLang: 'de',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),
  ],
};
