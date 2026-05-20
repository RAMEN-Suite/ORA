import { Component, computed, forwardRef, input, InputSignal, Signal } from '@angular/core';
import { InlineAnnotation, InlineRangeSegment } from '../../models/TextAnnotation';
import { AnnotationSegmentsComponent } from '../segments/annotation-segments.component';
import { AnnotationPopoverComponent } from '../popover/annotation-popover.component';

@Component({
  selector: 'annotation-inline',
  imports: [forwardRef(() => AnnotationSegmentsComponent), AnnotationPopoverComponent],
  templateUrl: './annotation-inline.component.html',
})
export class AnnotationInlineComponent {
  public readonly segment: InputSignal<InlineRangeSegment> = input.required<InlineRangeSegment>();

  protected readonly classes: Signal<string> = computed((): string => {
    const classes: string[] = this.segment().annotations.flatMap((a: InlineAnnotation): string[] => a.classes);
    return Array.from(new Set(classes)).join(' ');
  });
}
