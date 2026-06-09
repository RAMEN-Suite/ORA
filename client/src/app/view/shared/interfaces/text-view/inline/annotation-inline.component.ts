import { Component, computed, forwardRef, input, InputSignal, Signal } from '@angular/core';
import { AnnotationSegmentsComponent } from '../segments/annotation-segments.component';
import { AnnotationDialogComponent } from '../dialog/annotation-dialog.component';
import { InlineRangeSegment } from '../../../../../models/annotations/ViewSegments';
import { InlineAnnotation } from '../../../../../models/annotations/ResolvedAnnotation';

@Component({
  selector: 'annotation-inline',
  imports: [forwardRef(() => AnnotationSegmentsComponent), AnnotationDialogComponent],
  templateUrl: './annotation-inline.component.html',
})
export class AnnotationInlineComponent {
  public readonly segment: InputSignal<InlineRangeSegment> = input.required<InlineRangeSegment>();

  protected readonly classes: Signal<string> = computed((): string => {
    const annotations: InlineAnnotation[] = this.segment().annotations;
    const styleClasses: string[] = annotations.flatMap((annotation: InlineAnnotation): string[] => annotation.classes);
    return Array.from(new Set(styleClasses)).join(' ');
  });
}
