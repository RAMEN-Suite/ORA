import DOMPurify from 'dompurify';

export function sanitizeMarkdownHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ['md-p-image'],
    ADD_ATTR: ['preview', 'appendTo'],
  });
}
