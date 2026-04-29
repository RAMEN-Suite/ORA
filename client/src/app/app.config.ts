import {
  ApplicationConfig,
  inject,
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
import { ConfigService } from './services/api/config.service';
import { provideMarkdown } from 'ngx-markdown';

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
  ],
};
