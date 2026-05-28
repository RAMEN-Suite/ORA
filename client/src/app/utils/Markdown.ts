import { MarkedRenderer } from 'ngx-markdown';
import { Tokens } from 'marked';

export function markedOptionsFactory(): { renderer: MarkedRenderer } {
  const renderer = new MarkedRenderer();

  renderer.link = ({ href, title, text }: Tokens.Link): string => {
    const titleAttr: string = title ? ` title="${title}"` : '';
    return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`;
  };

  return { renderer };
}
