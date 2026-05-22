import { MarkedRenderer } from 'ngx-markdown';
import { Tokens } from 'marked';
import Link = Tokens.Link;

export function markedOptionsFactory(): { renderer: MarkedRenderer } {
  const renderer = new MarkedRenderer();

  renderer.link = ({ href, title, text }: Link): string => {
    const titleAttr: string = title ? ` title="${title}"` : '';
    return `<a href="${href}"${titleAttr} class="underline underline-offset-2" target="_blank" rel="noopener noreferrer">${text}</a>`;
  };

  return { renderer };
}
