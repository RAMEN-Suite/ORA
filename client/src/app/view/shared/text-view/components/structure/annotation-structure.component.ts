import { Component, computed, forwardRef, input, InputSignal, Signal } from '@angular/core';
import { StructureSegment } from '../../models/TextViewSegments';
import { TextViewSegmentsComponent } from '../segments/text-view-segments.component';

@Component({
  selector: 'annotation-structure',
  imports: [forwardRef(() => TextViewSegmentsComponent)],
  templateUrl: './annotation-structure.component.html',
})
export class AnnotationStructureComponent {
  public readonly segment: InputSignal<StructureSegment> = input.required<StructureSegment>();
  protected readonly classes: Signal<string> = computed((): string => this.segment().annotation.classes.join(' '));
  protected readonly renderAs: Signal<string> = computed((): string => this.segment().annotation.definition.renderAs);
}
