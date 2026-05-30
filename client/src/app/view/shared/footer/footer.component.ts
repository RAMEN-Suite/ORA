import { Component, inject } from '@angular/core';
import { AsyncPipe, NgClass, NgTemplateOutlet } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';
import { MarkdownComponent } from 'ngx-markdown';
import { ImageModule } from 'primeng/image';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { environment } from '../../../../envs/environment';
import { ConfigService } from '../../../services/config.service';
import { ContentService } from '../../../services/content.service';
import {
  FooterColumn,
  FooterCooperation,
  FooterMarkdown,
  ImageItem,
  NavItem,
  SiteOptions,
} from '../../../models/config/SiteOptions';

const MARKDOWN_IMAGE: RegExp = /!\[([^\]]*)]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g;
const EXTERNAL_URL: RegExp = /^https?:\/\//i;

@Component({
  selector: 'shared-footer',
  imports: [MarkdownComponent, AsyncPipe, NgClass, NgTemplateOutlet, TranslocoDirective, ImageModule],
  templateUrl: './footer.component.html',
})
export class FooterComponent {
  private readonly configService: ConfigService = inject(ConfigService);
  private readonly contentService: ContentService = inject(ContentService);

  private readonly config: SiteOptions = this.configService.config().site();
  private readonly markdowns: Map<string, Observable<string>> = new Map<string, Observable<string>>();

  protected readonly columns: FooterColumn[] = this.config.footer.columns;
  protected readonly cooperation: FooterCooperation | undefined = this.config.footer.cooperation;
  protected readonly links: NavItem[] = this.config.footer.links ?? [];

  protected readonly notice: string | undefined = this.config.footer.notice;
  protected readonly softwareUrl: string = environment.softwareURL;
  protected readonly currentYear: number = new Date().getFullYear();

  protected getMarkdown(column: FooterMarkdown): Observable<string> {
    const cached: Observable<string> | undefined = this.markdowns.get(column.file);
    if (cached) return cached;

    const markdown: Observable<string> = this.contentService.fetchMarkdownOnce(column.file).pipe(
      map((content: string): string => this.resolveMarkdownAssets(content)),
      shareReplay(1),
    );

    this.markdowns.set(column.file, markdown);
    return markdown;
  }

  protected getAssetUrl(src: string): string {
    const normalizedSrc: string = src.startsWith('/') ? src.slice(1) : src;
    return this.contentService.assetUrl(normalizedSrc);
  }

  protected getImageAlt(item: ImageItem, translate: (key: string) => string): string {
    if (item.alt) return translate(item.alt);
    if (item.label) return translate(item.label);
    return '';
  }

  private resolveMarkdownAssets(markdown: string): string {
    return markdown.replace(MARKDOWN_IMAGE, (_match: string, alt: string, src: string, title?: string): string => {
      if (EXTERNAL_URL.test(src)) return title ? `![${alt}](${src} "${title}")` : `![${alt}](${src})`;
      const assetUrl: string = this.getAssetUrl(src);
      return title ? `![${alt}](${assetUrl} "${title}")` : `![${alt}](${assetUrl})`;
    });
  }
}
