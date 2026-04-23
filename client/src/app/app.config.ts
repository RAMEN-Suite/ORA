import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import { SuitePreset } from '../styles/suite-preset.js';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpCache, withHttpCacheInterceptor } from '@ngneat/cashew';

export const appConfig: ApplicationConfig = {
  providers: [
    providePrimeNG({
      theme: { preset: SuitePreset, options: { darkModeSelector: '.dark' } },
    }),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(withInterceptors([withHttpCacheInterceptor()])),
    provideHttpCache(),
    provideRouter(routes),
  ],
};
