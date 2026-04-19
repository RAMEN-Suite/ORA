import {ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {providePrimeNG} from 'primeng/config';
import {SuitePreset} from '../styles/suite-preset.js';

export const appConfig: ApplicationConfig = {
  providers: [
    providePrimeNG({
      theme: { preset: SuitePreset, options: { darkModeSelector: '.dark' } },
      ripple: true,
    }),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
  ],
};
