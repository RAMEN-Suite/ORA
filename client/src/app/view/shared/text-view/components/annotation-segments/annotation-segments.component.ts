import { Component, forwardRef, input, InputSignal } from '@angular/core';
import { AnnotationSegment } from '../../models/TextAnnotation';
import { AnnotationSegmentComponent } from '../annotation-segment/annotation-segment.component';

@Component({
  selector: 'annotation-segments',
  imports: [forwardRef(() => AnnotationSegmentComponent)],
  templateUrl: './annotation-segments.component.html',
})
export class AnnotationSegmentsComponent {
  public readonly segments: InputSignal<AnnotationSegment[]> = input<AnnotationSegment[]>([]);
}
