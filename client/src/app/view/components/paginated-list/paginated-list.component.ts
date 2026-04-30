import { Component, input, InputSignal, output, OutputEmitterRef } from '@angular/core';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { DataView } from 'primeng/dataview';
import { NodesViewComponent } from '../data-view/nodes-view/nodes-view.component';

type TableRow = Record<string, unknown>;

@Component({
  selector: 'shared-paginated-list',
  imports: [TableModule, DataView, NodesViewComponent],
  templateUrl: './paginated-list.component.html',
})
export class PaginatedListComponent {
  public readonly isLoading: InputSignal<boolean> = input(false);

  public readonly items: InputSignal<TableRow[]> = input<TableRow[]>([]);
  public readonly totalRecords: InputSignal<number> = input(0);
  public readonly rows: InputSignal<number> = input(0);
  public readonly skip: InputSignal<number> = input(0);

  public readonly onPageChange: OutputEmitterRef<{ limit: number; skip: number }> = output();

  protected handleLazyLoad(event: TableLazyLoadEvent): void {
    this.onPageChange.emit({ skip: event.first ?? 0, limit: event.rows ?? this.rows() });
  }

  protected readonly Math: Math = Math;
}
