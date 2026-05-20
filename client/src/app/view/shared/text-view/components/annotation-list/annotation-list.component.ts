import { Component, computed, forwardRef, input, InputSignal, Signal } from '@angular/core';
import { ListItemSegment, ListSegment } from '../../models/TextViewSegments';
import { TextViewSegmentsComponent } from '../text-view-segments/text-view-segments.component';

@Component({
  selector: 'annotation-list',
  imports: [forwardRef(() => TextViewSegmentsComponent)],
  templateUrl: './annotation-list.component.html',
  host: { class: 'contents' },
})
export class AnnotationListComponent {
  public readonly segment: InputSignal<ListSegment> = input.required<ListSegment>();

  protected readonly classes: Signal<string> = computed((): string => this.segment().annotation.classes.join(' '));
  protected readonly isOrdered: Signal<boolean> = computed((): boolean => this.segment().annotation.definition.renderAs === 'ol');

  protected itemClasses(item: ListItemSegment): string {
    return item.annotation.classes.join(' ');
  }
}
