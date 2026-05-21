import { Component, computed, forwardRef, input, InputSignal, Signal } from '@angular/core';
import { InlineAnnotation, InlineRangeSegment } from '../../../../models/TextAnnotation';
import { AnnotationSegmentsComponent } from '../segments/annotation-segments.component';
import { AnnotationDialogComponent } from '../dialog/annotation-dialog.component';

@Component({
  selector: 'annotation-inline',
  imports: [forwardRef(() => AnnotationSegmentsComponent), AnnotationDialogComponent],
  templateUrl: './annotation-inline.component.html',
})
export class AnnotationInlineComponent {
  public readonly segment: InputSignal<InlineRangeSegment> = input.required<InlineRangeSegment>();

  protected readonly classes: Signal<string> = computed((): string => {
    const annotations: InlineAnnotation[] = this.segment().annotations;
    const styleClasses: string[] = annotations.flatMap((a: InlineAnnotation): string[] => a.classes);
    return Array.from(new Set(styleClasses)).join(' ');
  });
}
