import { Component, computed, forwardRef, input, InputSignal, Signal } from '@angular/core';
import { AnnotationSegmentsComponent } from '../annotation-segments/annotation-segments.component';
import { StructureSegment } from '../../models/TextViewSegments';

@Component({
  selector: 'annotation-structure',
  imports: [forwardRef(() => AnnotationSegmentsComponent)],
  templateUrl: './annotation-structure.component.html',
  host: { class: 'contents' },
})
export class AnnotationStructureComponent {
  public readonly segment: InputSignal<StructureSegment> = input.required<StructureSegment>();
  protected readonly classes: Signal<string> = computed((): string => this.segment().annotation.classes.join(' '));
  protected readonly renderAs: Signal<string> = computed((): string => this.segment().annotation.definition.renderAs);
}
