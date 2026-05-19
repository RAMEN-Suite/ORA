import { Component, computed, forwardRef, input, InputSignal, Signal } from '@angular/core';
import { InlineAnnotationSegment } from '../../models/TextAnnotation';
import { AnnotationSegmentsComponent } from '../annotation-segments/annotation-segments.component';

@Component({
  selector: 'annotation-inline',
  imports: [forwardRef(() => AnnotationSegmentsComponent)],
  templateUrl: './annotation-inline.component.html',
})
export class AnnotationInlineComponent {
  public readonly segment: InputSignal<InlineAnnotationSegment> = input.required<InlineAnnotationSegment>();
  protected readonly classes: Signal<string> = computed((): string => this.segment().annotation.classes.join(' '));
}
