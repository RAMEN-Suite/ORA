import { Component, computed, input, InputSignal, Signal } from '@angular/core';
import { ResolvedAnnotation } from '../../models/TextAnnotation';
import { AnnotationPopoverEntryComponent } from './annotation-popover-entry/annotation-popover-entry.component';
import { Divider } from 'primeng/divider';

@Component({
  selector: 'annotation-popover',
  imports: [AnnotationPopoverEntryComponent, Divider],
  templateUrl: './annotation-popover.component.html',
})
export class AnnotationPopoverComponent {
  public readonly annotations: InputSignal<ResolvedAnnotation[]> = input.required<ResolvedAnnotation[]>();
  public readonly isOpen: InputSignal<boolean> = input<boolean>(false);

  protected readonly popoverAnnotations: Signal<ResolvedAnnotation[]> = computed((): ResolvedAnnotation[] => {
    return this.annotations().filter((annotation: ResolvedAnnotation): boolean => annotation.definition.behavior === 'popover');
  });
}
