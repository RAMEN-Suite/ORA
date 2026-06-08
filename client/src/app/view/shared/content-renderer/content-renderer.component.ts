import { Component, input, InputSignal } from '@angular/core';
import { Content } from '../../../models/config/PageViews';
import { MarkdownContent } from '../../content/markdown-content/markdown.content';

@Component({
  selector: 'content-renderer',
  imports: [MarkdownContent],
  templateUrl: './content-renderer.component.html',
  host: { class: 'contents' },
})
export class ContentRendererComponent {
  public readonly blocks: InputSignal<Content[]> = input<Content[]>([]);
  public readonly styleClass: InputSignal<string> = input('');
}
