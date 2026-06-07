import { Component, computed, inject, Signal } from '@angular/core';
import { Menubar } from 'primeng/menubar';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { Button } from 'primeng/button';
import { Popover } from 'primeng/popover';
import { TranslocoDirective } from '@jsverse/transloco';
import { AVAILABLE_LANGUAGES, LanguageKey, NavItem, SiteOptions } from '../../../models/config/SiteOptions';
import { ConfigService } from '../../../services/config.service';
import { LanguageService } from '../../../services/language.service';
import { Nullable } from 'primeng/ts-helpers';

@Component({
  selector: 'shared-navbar',
  imports: [Menubar, RouterLink, NgClass, RouterLinkActive, Button, Popover, TranslocoDirective, NgTemplateOutlet],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  private readonly languageService: LanguageService = inject(LanguageService);
  private readonly configService: ConfigService = inject(ConfigService);
  private readonly config: SiteOptions = this.configService.config().getSiteOptions();

  protected readonly image: Signal<string | undefined> = computed((): string | undefined => this.config.navbar.image);
  protected readonly navItems: Signal<NavItem[]> = computed((): NavItem[] => this.config.navbar.items ?? []);

  protected readonly activeLanguage: Signal<LanguageKey | undefined> = this.languageService.activeLanguage;
  protected readonly languages: Signal<LanguageKey[]> = computed((): LanguageKey[] => {
    const languages: LanguageKey[] = this.config.language.available;
    return AVAILABLE_LANGUAGES.filter((key: LanguageKey): boolean => languages.includes(key));
  });

  protected handleOpenLanguages(popover: Popover, event: Event): void {
    popover.toggle(event);

    requestAnimationFrame((): void => {
      popover.align();
      this.resetPopoverOffset(popover);
    });
  }

  protected handleLanguageChange(language: LanguageKey, popover: Popover): void {
    popover.hide();
    this.languageService.setActiveLanguage(language);
  }

  protected isExternal(item: NavItem): boolean {
    return !!item.href && /^(https?:)?\/\//.test(item.href);
  }

  private resetPopoverOffset(popover: Popover): void {
    const container: Nullable<HTMLElement> = popover.container;
    if (!container) return;
    container.style.top = `${container.offsetTop - window.scrollY}px`;
    container.style.left = `${container.offsetLeft + 15 - window.scrollX}px`;
  }
}
