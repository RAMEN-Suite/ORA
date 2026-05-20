import { Component, computed, input, InputSignal, Signal } from '@angular/core';
import { Divider } from 'primeng/divider';
import { ResolvedInlineAnnotation } from '../../models/TextAnnotation';
import { AnnotationPopoverEntryComponent } from './annotation-popover-entry/annotation-popover-entry.component';

@Component({
  selector: 'annotation-popover',
  imports: [Divider, AnnotationPopoverEntryComponent],
  templateUrl: './annotation-popover.component.html',
})
export class AnnotationPopoverComponent {
  public readonly annotations: InputSignal<ResolvedInlineAnnotation[]> = input.required<ResolvedInlineAnnotation[]>();
  public readonly isOpen: InputSignal<boolean> = input<boolean>(false);

  protected readonly popoverAnnotations: Signal<ResolvedInlineAnnotation[]> = computed((): ResolvedInlineAnnotation[] => {
    return this.annotations().filter((annotation: ResolvedInlineAnnotation): boolean => {
      return annotation.definition.behavior === 'popover';
    });
  });
}
