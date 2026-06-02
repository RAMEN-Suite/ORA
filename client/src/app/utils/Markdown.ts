import { inject } from '@angular/core';
import { MarkedRenderer } from 'ngx-markdown';
import { Tokens } from 'marked';
import { ContentService } from '../services/content.service';

const IMAGE_HTML: RegExp = /^<img\b[^>]*>$/i;

export function markedOptionsFactory(): { renderer: MarkedRenderer } {
  const contentService: ContentService = inject(ContentService);
  const renderer: MarkedRenderer = new MarkedRenderer();

  renderer.link = ({ href, title, text }: Tokens.Link): string => {
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
