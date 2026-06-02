import { Component, computed, inject, input, InputSignal, signal, Signal, WritableSignal } from '@angular/core';
import { AbstractBlock } from '../abstract.block';
import { CitationLink, CitationProps } from '../../../models/config/DetailViews';
import { environment } from '../../../../envs/environment';
import { TranslocoDirective } from '@jsverse/transloco';
import { Fieldset } from 'primeng/fieldset';
import { Clipboard } from '@angular/cdk/clipboard';
import { MarkdownComponent } from 'ngx-markdown';
import { Button } from 'primeng/button';

interface ResolvedLink {
  label: string;
  href: string;
  icon: string;
}

@Component({
  selector: 'block-citation',
  imports: [TranslocoDirective, Fieldset, MarkdownComponent, Button],
  templateUrl: './citation-block.component.html',
})
export class CitationBlockComponent extends AbstractBlock<CitationProps> {
  private readonly clipboard: Clipboard = inject(Clipboard);

  public readonly uuid: InputSignal<string | null> = input<string | null>(null);

  protected readonly title: Signal<string> = computed((): string => this.properties()?.title ?? '');
  protected readonly citation: Signal<string> = computed((): string => this.resolveTemplate(this.properties()?.citation));
  protected readonly license: Signal<string> = computed((): string => this.resolveTemplate(this.properties()?.license));

  protected readonly usage: Signal<string> = computed((): string => {
    const licenseText: string = this.license();
    const url: string = environment.softwareURL;
    const softwareText: string = this.translocoService.translate('app.shared.citation.usageSoftware', { url });
    return [licenseText, softwareText].filter(Boolean).join(' ');
  });

  protected readonly hasCopied: WritableSignal<boolean> = signal(false);
  protected readonly permalink: Signal<string> = computed((): string => {
    const host: string = this.resolveHost();
    return `${host}/id/${encodeURIComponent(this.uuid() ?? '')}`;
  });

  protected readonly links: Signal<ResolvedLink[]> = computed((): ResolvedLink[] => {
    const links: CitationLink[] = this.properties()?.links ?? [];
    const resolved: ResolvedLink[] = links.map((link: CitationLink): ResolvedLink => {
      return {
        label: link.label,
        href: this.resolveText(link.href),
        icon: link.icon ?? 'pi pi-external-link',
      };
    });

    return resolved.filter((link: ResolvedLink): boolean => link.href.trim().length > 0);
  });

  protected handleCopyLink(): void {
    this.clipboard.copy(this.permalink());
    this.hasCopied.set(true);
    window.setTimeout((): void => this.hasCopied.set(false), 1200);
  }

  protected handlePrintWindow(): void {
    window.print();
  }

  protected handleOpenLink(link: ResolvedLink): void {
    window.open(link.href, '_blank', 'noopener,noreferrer');
  }

  private resolveHost(): string {
    const configured: string | undefined = environment.appHost.trim();
    const host: string = configured || window.location.origin;
    return host.replace(/\/$/, '');
  }
}
