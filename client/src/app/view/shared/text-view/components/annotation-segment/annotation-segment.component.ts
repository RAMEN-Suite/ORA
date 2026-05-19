import { Component, input, InputSignal } from '@angular/core';
import { AnnotationSegment } from '../../models/TextAnnotation';
import { AnnotationInlineComponent } from '../annotation-inline/annotation-inline.component';
import { AnnotationInteractionComponent } from '../annotation-interaction/annotation-interaction.component';
import { AnnotationZeroPointComponent } from '../annotation-zero-point/annotation-zero-point.component';

@Component({
  selector: 'annotation-segment',
  imports: [AnnotationInlineComponent, AnnotationInteractionComponent, AnnotationZeroPointComponent],
  templateUrl: './annotation-segment.component.html',
})
export class AnnotationSegmentComponent {
  public readonly segment: InputSignal<AnnotationSegment> = input.required<AnnotationSegment>();
}
