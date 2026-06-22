import { inject } from '@angular/core';
import { MarkedOptions, MarkedRenderer } from 'ngx-markdown';
import { Parser, Tokens } from 'marked';
import { ContentService } from '../../services/content.service';

const IMAGE_HTML: RegExp = /^<img\b[^>]*>$/i;
const LINK_HTML: RegExp = /^<a\b[^>]*>.*<\/a>$/is;
const VECTOR_IMAGE: RegExp = /\.svg(?:[?#].*)?$/i;

export class Markdown {
  public static create(): MarkedOptions {
    const contentService: ContentService = inject(ContentService);
    const factory = new Markdown(contentService);
    return factory.createOptions();
  }

  private constructor(private readonly contentService: ContentService) {}

  private createOptions(): MarkedOptions {
    const renderer: MarkedRenderer = new MarkedRenderer();

    renderer.heading = (token: Tokens.Heading): string => this.renderHeading(token);
    renderer.paragraph = (token: Tokens.Paragraph): string => this.renderParagraph(token);
    renderer.link = (token: Tokens.Link): string => this.renderLink(token);
    renderer.image = (token: Tokens.Image): string => this.renderImage(token.href, token.title, token.text);
    renderer.html = (token: Tokens.HTML): string => this.renderHtml(token);
    renderer.list = (token: Tokens.List): string => this.renderList(token);
    renderer.listitem = (token: Tokens.ListItem): string => this.renderListItem(token);

    return { renderer };
  }

  private renderHeading({ depth, tokens }: Tokens.Heading): string {
    const tag: string = `h${depth}`;
    const classes: string = this.resolveHeadingClasses(depth);
    const text: string = Parser.parseInline(tokens);

    return `<${tag} class="${classes}">${text}</${tag}>`;
  }

  private renderParagraph({ tokens }: Tokens.Paragraph): string {
    const text: string = Parser.parseInline(tokens);

    return `<p class="my-3 leading-relaxed">${text}</p>`;
  }

  private renderList({ ordered, start, items }: Tokens.List): string {
    const tag: string = ordered ? 'ol' : 'ul';
    const startAttribute: string = ordered && start !== 1 ? ` start="${start}"` : '';
    const classes: string = ordered ? 'my-3 ms-8 list-decimal space-y-2' : 'my-3 ms-6 list-none space-y-2';
    const html: string = items.map((item: Tokens.ListItem): string => this.renderListItem(item)).join('');

    return `<${tag}${startAttribute} class="${classes}">${html}</${tag}>`;
  }

  private renderListItem({ tokens }: Tokens.ListItem): string {
    const html: string = Parser.parseInline(tokens);

    return `
    <li class="leading-relaxed">
      <span class="inline-flex items-baseline gap-2">
        <i class="pi pi-angle-double-right text-xs! shrink-0" aria-hidden="true"></i>
        <span>${html}</span>
      </span>
    </li>
  `;
  }

  private renderLink({ href, title, tokens }: Tokens.Link): string {
    const text: string = Parser.parseInline(tokens);
    if (!href) return text;
    return this.renderLinkHtml(href, title, text);
  }

  private renderHtml({ text }: Tokens.HTML): string {
    const html: string = text.trim();

    if (IMAGE_HTML.test(html)) return this.renderHtmlImage(html, text);
    if (LINK_HTML.test(html)) return this.renderHtmlLink(html, text);

    return text;
  }

  private renderHtmlImage(html: string, fallback: string): string {
    const image: HTMLImageElement | null = this.parseImageElement(html);
    if (!image) return fallback;

    const src: string | null = image.getAttribute('src');
    if (!src) return fallback;

    const alt: string | null = image.getAttribute('alt');
    const title: string | null = image.getAttribute('title');
    return this.renderImage(src, alt, title);
  }

  private renderImage(src: string | null | undefined, alt?: string | null, title?: string | null): string {
    if (!src) return '';

    const resolvedSrc: string = this.contentService.resolveAssetUrl(src);
    const safeSrc: string = this.escapeAttribute(resolvedSrc);
    const safeAlt: string = this.escapeAttribute(alt ?? '');
    const previewAttribute: string = VECTOR_IMAGE.test(src) ? '' : ' preview';

    const imageHtml: string = `<md-p-image append-to="body" src="${safeSrc}" alt="${safeAlt}"${previewAttribute}></md-p-image>`;
    if (!title) return imageHtml;

    return `
      <figure class="my-4">
        ${imageHtml}
        <figcaption class="text-center mb-2 text-sm leading-snug tracking-tight">${title}</figcaption>
      </figure>
    `;
  }

  private renderHtmlLink(html: string, fallback: string): string {
    const link: HTMLAnchorElement | null = this.parseLinkElement(html);
    if (!link) return fallback;

    const href: string | null = link.getAttribute('href');
    if (!href) return fallback;

    const title: string | null = link.getAttribute('title');
    return this.renderLinkHtml(href, title, link.innerHTML);
  }

  private renderLinkHtml(href: string, title: string | null | undefined, html: string): string {
    const safeHref: string = this.escapeAttribute(href);
    const titleAttribute: string = this.resolveOptionalAttribute('title', title);
    return `<a href="${safeHref}"${titleAttribute} target="_blank" rel="noopener noreferrer">${html}</a>`;
  }

  private parseImageElement(html: string): HTMLImageElement | null {
    const template: HTMLTemplateElement = document.createElement('template');
    template.innerHTML = html;

    const element: Element | null = template.content.firstElementChild;
    return element instanceof HTMLImageElement ? element : null;
  }

  private parseLinkElement(html: string): HTMLAnchorElement | null {
    const template: HTMLTemplateElement = document.createElement('template');
    template.innerHTML = html;

    const element: Element | null = template.content.firstElementChild;
    return element instanceof HTMLAnchorElement ? element : null;
  }

  private resolveHeadingClasses(depth: number): string {
    switch (depth) {
      case 1:
        return 'mb-5 md:text-3xl text-xl font-semibold leading-tight';
      case 2:
        return 'mb-4 md:text-2xl text-xl font-semibold leading-tight';
      case 3:
        return 'mb-4 md:text-xl text-lg font-semibold leading-tight';
      case 4:
        return 'mb-3 text-lg font-semibold leading-tight';
      case 5:
        return 'mb-3 text-base font-semibold leading-tight';
      case 6:
        return 'mb-3 text-sm font-semibold leading-tight';
      default:
        return 'mb-3 font-semibold leading-tight';
    }
  }

  private resolveOptionalAttribute(name: string, value: string | null | undefined): string {
    return value ? ` ${name}="${this.escapeAttribute(value)}"` : '';
  }

  private escapeAttribute(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');
  }
}
