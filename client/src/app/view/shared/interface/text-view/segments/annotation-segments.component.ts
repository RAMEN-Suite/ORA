import { Component, input, InputSignal } from '@angular/core';
import { AnnotationInlineComponent } from '../inline/annotation-inline.component';
import { AnnotationDetachComponent } from '../inline/annotation-detach.component';
import { AnnotationSegment } from '../../../../../models/annotations/ViewSegments';

@Component({
  selector: 'annotation-segments',
  imports: [AnnotationInlineComponent, AnnotationDetachComponent],
  templateUrl: './annotation-segments.component.html',
})
export class AnnotationSegmentsComponent {
  public readonly segments: InputSignal<AnnotationSegment[]> = input<AnnotationSegment[]>([]);
}
