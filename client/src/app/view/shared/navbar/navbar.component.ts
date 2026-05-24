import { Component, computed, inject, signal, Signal, WritableSignal } from '@angular/core';
import { Menubar } from 'primeng/menubar';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass } from '@angular/common';
import { Button } from 'primeng/button';
import { Popover } from 'primeng/popover';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { AVAILABLE_LANGUAGES, LanguageKey, NavItem, SiteOptions } from '../../../models/config/SiteOptions';
import { ConfigService } from '../../../services/config.service';

@Component({
  selector: 'shared-navbar',
  imports: [Menubar, RouterLink, NgClass, RouterLinkActive, Button, Popover, TranslocoDirective],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  private readonly translocoService: TranslocoService = inject(TranslocoService);
  private readonly configService: ConfigService = inject(ConfigService);
  private readonly config: SiteOptions = this.configService.config().site();

  protected image: Signal<string | undefined> = computed((): string | undefined => this.config.navbar.image);
  protected menuItems: Signal<NavItem[]> = computed((): NavItem[] => [
    {
      label: 'Startseite',
      href: '/',
      isExactMatch: true,
    },
    {
      label: 'Gesamtkorpus',
      href: '/collections',
      isExactMatch: false,
    },
    {
      label: 'Register',
      href: '/entities',
      isExactMatch: false,
    },
  ]);

  protected readonly activeLanguage: WritableSignal<LanguageKey | undefined> = signal(this.initialLanguage());

  protected readonly languages: Signal<LanguageKey[]> = computed((): LanguageKey[] => {
    const languages: LanguageKey[] = this.config.language.available;
    return AVAILABLE_LANGUAGES.filter((key: LanguageKey): boolean => languages.includes(key));
  });

  protected handleLanguageChange(language: LanguageKey, popover: Popover): void {
    popover.hide();
    this.translocoService.setActiveLang(language);
    this.activeLanguage.set(language);
  }

  private initialLanguage(): LanguageKey | undefined {
    const activeLanguage: string = this.translocoService.getActiveLang();
    const key: LanguageKey | undefined = AVAILABLE_LANGUAGES.find((key: LanguageKey): boolean => key === activeLanguage);
    return key ?? this.languages()[0];
  }
}
