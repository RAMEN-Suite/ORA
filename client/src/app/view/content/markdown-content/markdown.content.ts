import { HttpResourceRef } from '@angular/common/http';
import { Component, computed, Signal } from '@angular/core';
import { MarkdownComponent } from 'ngx-markdown';
import { MarkdownContentProperties } from '../../../models/config/PageViews';
import { AbstractContent } from '../abstract.content';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  selector: 'content-markdown',
  imports: [MarkdownComponent, ProgressSpinner],
  templateUrl: './markdown.content.html',
})
export class MarkdownContent extends AbstractContent<MarkdownContentProperties> {
  protected readonly file: Signal<string | null> = computed((): string | null => this.properties()?.file ?? null);
  protected readonly $markdown: HttpResourceRef<string | undefined> = this.contentService.fetchMarkdown(this.file);

  protected readonly markdown: Signal<string | undefined> = computed((): string | undefined => {
    if (!this.$markdown.hasValue()) return undefined;
    return this.$markdown.value();
  });
}
