import { Component, input, InputSignal, output, OutputEmitterRef } from '@angular/core';
import { TableModule } from 'primeng/table';
import { DataView } from 'primeng/dataview';
import { NodesViewComponent } from '../data-view/nodes-view/nodes-view.component';
import { PAGE_LIMITS, PaginationUtils } from '../../../../utils/PaginationUtils';
import { LazyLoadEvent } from 'primeng/api';
import { Property } from '../property-list/property-list.component';
import { MobilePaginationComponent } from './mobile-pagination/mobile-pagination.component';

type TableRow = Record<string, unknown>;

@Component({
  selector: 'shared-paginated-list',
  imports: [TableModule, DataView, NodesViewComponent, MobilePaginationComponent],
  templateUrl: './paginated-list.component.html',
})
export class PaginatedListComponent {
  public readonly items: InputSignal<TableRow[]> = input<TableRow[]>([]);
  public readonly properties: InputSignal<Property[]> = input<Property[]>([]);
  public readonly routeTarget: InputSignal<string[]> = input<string[]>([]);

  public readonly totalRecords: InputSignal<number> = input(0);
  public readonly rows: InputSignal<number> = input(25);
  public readonly skip: InputSignal<number> = input(0);

  public readonly isLoading: InputSignal<boolean> = input(false);
  public readonly pageChange: OutputEmitterRef<{ limit: number; skip: number }> = output();

  protected handleLazyLoad(event: LazyLoadEvent): void {
    const limit: number = PaginationUtils.parseLimit(event.rows ?? this.rows());
    const skip: number = event.first ?? 0;
    this.pageChange.emit({ limit, skip });
  }

  protected readonly Math: Math = Math;
  protected readonly PAGE_LIMITS: number[] = [...PAGE_LIMITS];
}
