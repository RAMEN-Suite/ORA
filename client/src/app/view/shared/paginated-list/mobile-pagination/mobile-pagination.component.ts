import { Component, input, InputSignal, output, OutputEmitterRef } from '@angular/core';
import { Badge } from 'primeng/badge';
import { Button } from 'primeng/button';
import { PaginationUtils } from '../../../../utils/PaginationUtils';
import { LazyLoadEvent } from 'primeng/api';

@Component({
  selector: 'app-mobile-pagination',
  imports: [Badge, Button],
  templateUrl: './mobile-pagination.component.html',
})
export class MobilePaginationComponent {
  public readonly totalRecords: InputSignal<number> = input(0);
  public readonly rows: InputSignal<number> = input(0);
  public readonly skip: InputSignal<number> = input(0);

  public readonly onLazyLoad: OutputEmitterRef<LazyLoadEvent> = output();

  protected first(): void {
    this.onLazyLoad.emit({ first: 0, rows: this.rows() });
  }

  protected previous(): void {
    const first: number = Math.max(this.skip() - this.rows(), 0);
    this.onLazyLoad.emit({ first, rows: this.rows() });
  }

  protected next(): void {
    const first: number = Math.min(this.skip() + this.rows(), this.totalRecords() - this.rows());
    this.onLazyLoad.emit({ first, rows: this.rows() });
  }

  protected last(): void {
    this.onLazyLoad.emit({ first: this.totalRecords() - this.rows(), rows: this.rows() });
  }

  protected readonly PaginationUtils: typeof PaginationUtils = PaginationUtils;
}
