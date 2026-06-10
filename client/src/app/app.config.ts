import {
  ApplicationConfig,
  EnvironmentInjector,
  inject,
  isDevMode,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import { SuitePreset, zIndex } from '../styles/suite-preset.js';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpCache, withHttpCacheInterceptor, withLocalStorage } from '@ngneat/cashew';
import { ConfigService } from './services/config.service';
import { MARKED_OPTIONS, provideMarkdown, SANITIZE } from 'ngx-markdown';
import { TranslocoHttpLoader } from './transloco-loader';
import { provideTransloco, provideTranslocoTranspiler } from '@jsverse/transloco';
import { Markdown } from './parser/markdown/Markdown';
import { LanguageService } from './services/language.service';
import { Transpiler } from './parser/Transpiler';
import { sanitizeMarkdownHtml } from './parser/markdown/MarkdownSanitizer';
import { MarkdownRegistry } from './parser/markdown/MarkdownRegistry';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer(initApplication),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })),
    providePrimeNG({ theme: { preset: SuitePreset, options: { darkModeSelector: '.dark' } }, zIndex }),

    provideHttpClient(withInterceptors([withHttpCacheInterceptor()])),
    provideHttpCache(withLocalStorage()),

    provideTransloco({ config: { reRenderOnLangChange: true, prodMode: !isDevMode() }, loader: TranslocoHttpLoader }),
    provideTranslocoTranspiler(Transpiler),

    provideMarkdown({
      sanitize: { provide: SANITIZE, useValue: sanitizeMarkdownHtml },
      markedOptions: { provide: MARKED_OPTIONS, useFactory: Markdown.create },
    }),
  ],
};

async function initApplication(): Promise<void> {
  const configService: ConfigService = inject(ConfigService);
  const languageService: LanguageService = inject(LanguageService);
  const injector: EnvironmentInjector = inject(EnvironmentInjector);

  MarkdownRegistry.register(injector);
  await configService.init();

  if (!configService.hasConfig()) return;
  languageService.init();
}
