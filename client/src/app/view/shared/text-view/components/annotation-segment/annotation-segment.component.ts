import { Component, input, InputSignal } from '@angular/core';
import { AnnotationSegment } from '../../models/TextAnnotation';
import { AnnotationZeroPointComponent } from '../annotation-zero-point/annotation-zero-point.component';
import { AnnotationSpanComponent } from '../annotation-span/annotation-span.component';

@Component({
  selector: 'annotation-segment',
  imports: [AnnotationZeroPointComponent, AnnotationSpanComponent],
  templateUrl: './annotation-segment.component.html',
})
export class AnnotationSegmentComponent {
  public readonly segment: InputSignal<AnnotationSegment> = input.required<AnnotationSegment>();
}
