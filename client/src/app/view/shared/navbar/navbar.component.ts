import { Component, computed, inject, Signal } from '@angular/core';
import { Menubar } from 'primeng/menubar';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass } from '@angular/common';
import { Button } from 'primeng/button';
import { Popover } from 'primeng/popover';
import { TranslocoDirective } from '@jsverse/transloco';
import { AVAILABLE_LANGUAGES, LanguageKey, NavItem, SiteOptions } from '../../../models/config/SiteOptions';
import { ConfigService } from '../../../services/config.service';
import { LanguageService } from '../../../services/language.service';

@Component({
  selector: 'shared-navbar',
  imports: [Menubar, RouterLink, NgClass, RouterLinkActive, Button, Popover, TranslocoDirective],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  private readonly languageService: LanguageService = inject(LanguageService);
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

  protected readonly activeLanguage: Signal<LanguageKey | undefined> = this.languageService.activeLanguage;

  protected readonly languages: Signal<LanguageKey[]> = computed((): LanguageKey[] => {
    const languages: LanguageKey[] = this.config.language.available;
    return AVAILABLE_LANGUAGES.filter((key: LanguageKey): boolean => languages.includes(key));
  });

  protected handleLanguageChange(language: LanguageKey, popover: Popover): void {
    popover.hide();
    this.languageService.setActiveLanguage(language);
  }
}
