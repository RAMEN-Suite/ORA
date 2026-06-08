import { inject } from '@angular/core';
import { MarkedRenderer } from 'ngx-markdown';
import { Parser, Tokens } from 'marked';
import { ContentService } from '../services/content.service';

const IMAGE_HTML: RegExp = /^<img\b[^>]*>$/i;

export function markedOptionsFactory(): { renderer: MarkedRenderer } {
  const contentService: ContentService = inject(ContentService);
  const renderer: MarkedRenderer = new MarkedRenderer();

  renderer.heading = ({ depth, tokens }: Tokens.Heading): string => {
    const tag: string = `h${depth}`;
    const classes: string = resolveHeadingClasses(depth);
    const text: string = Parser.parseInline(tokens);

    return `<${tag} class="${classes}">${text}</${tag}>`;
  };

  renderer.paragraph = ({ tokens }: Tokens.Paragraph): string => {
    const text: string = Parser.parseInline(tokens);

    return `<p class="mb-5 leading-relaxed">${text}</p>`;
  };

  renderer.link = ({ href, title, tokens }: Tokens.Link): string => {
    const text: string = Parser.parseInline(tokens);

    if (!href) return text;

    const safeHref: string = escapeAttribute(href);
    const titleAttribute: string = createOptionalAttribute('title', title);

    return `<a href="${safeHref}"${titleAttribute} target="_blank" rel="noopener noreferrer">${text}</a>`;
  };

  renderer.image = ({ href, title, text }: Tokens.Image): string => {
    if (!href) return '';

    const src: string = contentService.resolveAssetUrl(href);
    const safeSrc: string = escapeAttribute(src);
    const safeAlt: string = escapeAttribute(text);
    const titleAttribute: string = createOptionalAttribute('title', title);

    return `<img src="${safeSrc}" alt="${safeAlt}"${titleAttribute} loading="lazy" decoding="async">`;
  };

  renderer.html = ({ text }: Tokens.HTML): string => {
    return resolveHtmlImage(text, contentService);
  };

  return { renderer };
}

function resolveHeadingClasses(depth: number): string {
  switch (depth) {
    case 1:
      return 'mb-5 text-3xl font-semibold leading-tight';
    case 2:
      return 'mb-4 text-2xl font-semibold leading-tight';
    case 3:
      return 'mb-4 text-xl font-semibold leading-tight';
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

function resolveHtmlImage(text: string, contentService: ContentService): string {
  const html: string = text.trim();
  if (!IMAGE_HTML.test(html)) return text;

  const template: HTMLTemplateElement = document.createElement('template');
  template.innerHTML = html;

  const image: Element | null = template.content.firstElementChild;
  if (!(image instanceof HTMLImageElement)) return text;

  const src: string | null = image.getAttribute('src');
  if (!src) return text;

  image.setAttribute('src', contentService.resolveAssetUrl(src));
  image.setAttribute('loading', image.getAttribute('loading') ?? 'lazy');
  image.setAttribute('decoding', image.getAttribute('decoding') ?? 'async');

  return template.innerHTML;
}

function createOptionalAttribute(name: string, value: string | null | undefined): string {
  return value ? ` ${name}="${escapeAttribute(value)}"` : '';
}

function escapeAttribute(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}
