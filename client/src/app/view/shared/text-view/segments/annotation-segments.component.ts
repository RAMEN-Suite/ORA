import { Component, input, InputSignal } from '@angular/core';
import { AnnotationSegment } from '../../../../models/TextAnnotation';
import { AnnotationInlineComponent } from '../inline/annotation-inline.component';
import { AnnotationZeroPointComponent } from '../inline/annotation-zero-point.component';

@Component({
  selector: 'annotation-segments',
  imports: [AnnotationInlineComponent, AnnotationZeroPointComponent],
  templateUrl: './annotation-segments.component.html',
})
export class AnnotationSegmentsComponent {
  public readonly segments: InputSignal<AnnotationSegment[]> = input<AnnotationSegment[]>([]);
}
