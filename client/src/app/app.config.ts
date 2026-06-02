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
import { provideTransloco } from '@jsverse/transloco';
import { markedOptionsFactory } from './utils/Markdown';
import { LanguageService } from './services/language.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer(initApplication),
    providePrimeNG({ theme: { preset: SuitePreset, options: { darkModeSelector: '.dark' } } }),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })),
    provideMarkdown({ markedOptions: { provide: MARKED_OPTIONS, useFactory: markedOptionsFactory } }),
    provideHttpClient(withInterceptors([withHttpCacheInterceptor()])),
    provideHttpCache(withLocalStorage()),
    provideTransloco({ config: { reRenderOnLangChange: true, prodMode: !isDevMode() }, loader: TranslocoHttpLoader }),
  ],
};

async function initApplication(): Promise<void> {
  const configService: ConfigService = inject(ConfigService);
  const languageService: LanguageService = inject(LanguageService);

  await configService.init();
  if (!configService.hasConfig()) return;
  languageService.init();
}
