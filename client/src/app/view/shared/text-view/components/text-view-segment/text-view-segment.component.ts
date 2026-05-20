import { Component, input, InputSignal } from '@angular/core';
import { AnnotationSegment } from '../../models/TextAnnotation';
import { ListSegment, StructureSegment, TableSegment, TextViewSegment } from '../../models/TextViewSegments';
import { AnnotationSegmentComponent } from '../annotation-segment/annotation-segment.component';
import { AnnotationStructureComponent } from '../annotation-structure/annotation-structure.component';
import { AnnotationTableComponent } from '../annotation-table/annotation-table.component';
import { AnnotationListComponent } from '../annotation-list/annotation-list.component';

@Component({
  selector: 'annotation-text-view-segment',
  imports: [AnnotationSegmentComponent, AnnotationStructureComponent, AnnotationTableComponent, AnnotationListComponent],
  templateUrl: './text-view-segment.component.html',
  host: { class: 'contents' },
})
export class TextViewSegmentComponent {
  public readonly segment: InputSignal<TextViewSegment> = input.required<TextViewSegment>();

  protected isStructure(segment: TextViewSegment): boolean {
    return segment.kind === 'structure';
  }

  protected isTable(segment: TextViewSegment): boolean {
    return segment.kind === 'table';
  }

  protected isList(segment: TextViewSegment): boolean {
    return segment.kind === 'list';
  }

  protected asStructure(segment: TextViewSegment): StructureSegment {
    return segment as StructureSegment;
  }

  protected asTable(segment: TextViewSegment): TableSegment {
    return segment as TableSegment;
  }

  protected asList(segment: TextViewSegment): ListSegment {
    return segment as ListSegment;
  }

  protected asAnnotation(segment: TextViewSegment): AnnotationSegment {
    return segment as AnnotationSegment;
  }
}
