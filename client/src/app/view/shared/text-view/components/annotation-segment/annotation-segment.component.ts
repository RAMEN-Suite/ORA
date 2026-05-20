import { Component, input, InputSignal } from '@angular/core';
import { AnnotationSegment } from '../../models/TextAnnotation';
import { AnnotationInlineRangeComponent } from '../annotation-inline-range/annotation-inline-range.component';
import { AnnotationZeroPointComponent } from '../annotation-zero-point/annotation-zero-point.component';

@Component({
  selector: 'annotation-segment',
  imports: [AnnotationInlineRangeComponent, AnnotationZeroPointComponent],
  templateUrl: './annotation-segment.component.html',
  host: { class: 'contents' },
})
export class AnnotationSegmentComponent {
  public readonly segment: InputSignal<AnnotationSegment> = input.required<AnnotationSegment>();
}
