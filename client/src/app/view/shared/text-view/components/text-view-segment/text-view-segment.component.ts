import { Component, computed, input, InputSignal, Signal } from '@angular/core';
import { AnnotationSegment } from '../../models/TextAnnotation';
import { AnnotationSegmentComponent } from '../annotation-segment/annotation-segment.component';
import { AnnotationStructureComponent } from '../annotation-structure/annotation-structure.component';
import { StructureSegment, TextViewSegment } from '../../models/TextViewSegments';

@Component({
  selector: 'annotation-text-view-segment',
  imports: [AnnotationSegmentComponent, AnnotationStructureComponent],
  templateUrl: './text-view-segment.component.html',
})
export class TextViewSegmentComponent {
  public readonly segment: InputSignal<TextViewSegment> = input.required<TextViewSegment>();

  protected readonly structureSegment: Signal<StructureSegment | undefined> = computed((): StructureSegment | undefined => {
    const segment: TextViewSegment = this.segment();
    return this.isStructureSegment(segment) ? segment : undefined;
  });

  protected readonly annotationSegment: Signal<AnnotationSegment | undefined> = computed((): AnnotationSegment | undefined => {
    const segment: TextViewSegment = this.segment();
    return this.isStructureSegment(segment) ? undefined : segment;
  });

  private isStructureSegment(segment: TextViewSegment): segment is StructureSegment {
    return segment.kind === 'structure';
  }
}
