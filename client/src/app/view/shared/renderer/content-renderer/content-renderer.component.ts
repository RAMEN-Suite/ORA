import { Component, input, InputSignal } from '@angular/core';
import { ContentSection } from '../../../../models/config/PageViews';
import { MarkdownContent } from '../../../content/markdown-content/markdown.content';
import { LinkListContent } from '../../../content/link-list-content/link-list.content';

@Component({
  selector: 'content-renderer',
  imports: [MarkdownContent, LinkListContent],
  templateUrl: './content-renderer.component.html',
  host: { class: 'contents' },
})
export class ContentRendererComponent {
  public sections: InputSignal<ContentSection[]> = input<ContentSection[]>([]);
}
