import { Component, computed, forwardRef, input, InputSignal, Signal } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TableCellSegment, TableRowSegment, TableSegment } from '../../../../../models/annotations/ViewSegments';
import { TextViewSegmentsComponent } from '../segments/text-view-segments.component';

@Component({
  selector: 'annotation-table',
  imports: [forwardRef(() => TextViewSegmentsComponent), TableModule],
  templateUrl: './annotation-table.component.html',
  host: { class: 'contents' },
})
export class AnnotationTableComponent {
  public readonly segment: InputSignal<TableSegment> = input.required<TableSegment>();

  protected readonly classes: Signal<string> = computed((): string => this.segment().annotation.classes.join(' '));

  protected rowClasses(row: TableRowSegment): string {
    return row.annotation.classes.join(' ');
  }

  protected cellClasses(cell: TableCellSegment): string {
    return cell.annotation.classes.join(' ');
  }
}
