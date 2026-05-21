import { Component, input, InputSignal } from '@angular/core';
import { ListSegment, StructureSegment, TableSegment, TextViewSegment } from '../../../../models/TextViewSegments';
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
  public readonly segments: InputSignal<TextViewSegment[]> = input<TextViewSegment[]>([]);

  protected isStructure(segment: TextViewSegment): segment is StructureSegment {
    return segment.kind === 'structure';
  }

  protected isTable(segment: TextViewSegment): segment is TableSegment {
    return segment.kind === 'table';
  }

  protected isList(segment: TextViewSegment): segment is ListSegment {
    return segment.kind === 'list';
  }
}
