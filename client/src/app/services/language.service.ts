import { inject, Injectable, signal, Signal, WritableSignal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { LanguageKey, LanguageOptions } from '../models/config/SiteOptions';
import { ConfigService } from './config.service';

const LANGUAGE_STORAGE_KEY = 'language';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly configService: ConfigService = inject(ConfigService);
  private readonly translocoService: TranslocoService = inject(TranslocoService);
  private readonly activeLanguageState: WritableSignal<LanguageKey | undefined> = signal(undefined);

  public readonly activeLanguage: Signal<LanguageKey | undefined> = this.activeLanguageState.asReadonly();

  public init(): void {
    const options: LanguageOptions = this.configService.config().getSiteOptions().language;
    const current: LanguageKey = this.getStored(options.available) ?? this.getBrowser(options.available) ?? options.initial;

    this.translocoService.setAvailableLangs(options.available);
    this.translocoService.setDefaultLang(options.initial);
    this.setActiveLanguage(current);
  }

  public setActiveLanguage(language: LanguageKey): void {
    this.translocoService.setActiveLang(language);
    this.activeLanguageState.set(language);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }

  private getStored(available: LanguageKey[]): LanguageKey | null {
    const stored: string | null = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return this.isAvailableLanguage(stored, available) ? stored : null;
  }

  private getBrowser(available: LanguageKey[]): LanguageKey | null {
    const languages: readonly string[] = navigator.languages.length ? navigator.languages : [navigator.language];

    for (const language of languages) {
      const key: string | undefined = language.toLowerCase().split('-').at(0);
      if (this.isAvailableLanguage(key, available)) return key;
    }

    return null;
  }

  private isAvailableLanguage(language: unknown, available: LanguageKey[]): language is LanguageKey {
    return typeof language === 'string' && available.includes(language as LanguageKey);
  }
}
