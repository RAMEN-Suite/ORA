import { Component, computed, input, InputSignal, Signal } from '@angular/core';
import { ViewResponse } from '../../../../../services/view.service';
import { InlineAnnotation } from '../../models/TextAnnotation';
import { AnnotationPopoverEntryComponent } from './annotation-popover-entry.component';
import { Divider } from 'primeng/divider';

export type AnnotationPopoverResponses = Record<string, ViewResponse | undefined>;

@Component({
  selector: 'annotation-popover-content',
  imports: [AnnotationPopoverEntryComponent, Divider],
  templateUrl: './annotation-popover-content.component.html',
})
export class AnnotationPopoverContentComponent {
  public readonly annotations: InputSignal<InlineAnnotation[]> = input.required<InlineAnnotation[]>();
  public readonly responses: InputSignal<AnnotationPopoverResponses> = input<AnnotationPopoverResponses>({});
  public readonly isOpen: InputSignal<boolean> = input<boolean>(false);

  protected readonly popoverAnnotations: Signal<InlineAnnotation[]> = computed((): InlineAnnotation[] => {
    return this.annotations().filter((a: InlineAnnotation): boolean => a.definition.behavior === 'popover');
  });

  protected response(annotation: InlineAnnotation): ViewResponse | undefined {
    return this.responses()[annotation.uuid];
  }
}
