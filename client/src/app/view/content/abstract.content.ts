import { Component, inject, input, InputSignal } from '@angular/core';
import { ContentService } from '../../services/content.service';

@Component({ template: '', host: { class: 'contents' } })
export abstract class AbstractContent<TProperties extends object = object> {
  protected readonly contentService: ContentService = inject(ContentService);
  public readonly properties: InputSignal<TProperties | undefined> = input<TProperties>();
}
