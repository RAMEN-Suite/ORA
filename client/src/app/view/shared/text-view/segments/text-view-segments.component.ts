import { Component, input, InputSignal } from '@angular/core';
import { ListSegment, StructureSegment, TableSegment, ViewSegment } from '../../../../models/annotations/ViewSegments';
import { AnnotationListComponent } from '../layout/annotation-list.component';
import { AnnotationStructureComponent } from '../structure/annotation-structure.component';
import { AnnotationTableComponent } from '../layout/annotation-table.component';
import { AnnotationSegmentsComponent } from './annotation-segments.component';

@Component({
  selector: 'annotation-text-view-segments',
  imports: [AnnotationListComponent, AnnotationStructureComponent, AnnotationTableComponent, AnnotationSegmentsComponent],
  templateUrl: './text-view-segments.component.html',
})
export class TextViewSegmentsComponent {
  public readonly segments: InputSignal<ViewSegment[]> = input<ViewSegment[]>([]);

  protected isStructure(segment: ViewSegment): segment is StructureSegment {
    return segment.kind === 'structure';
  }

  protected isTable(segment: ViewSegment): segment is TableSegment {
    return segment.kind === 'table';
  }

  protected isList(segment: ViewSegment): segment is ListSegment {
    return segment.kind === 'list';
  }
}
