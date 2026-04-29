import { Component, inject, signal, Signal } from '@angular/core';
import { HttpResourceRef } from '@angular/common/http';
import { ListService } from '../../../services/api/list.service';
import { TableModule } from 'primeng/table';
import { List, Listable, ListOptions } from '../../../models/List';
import { RAMEN } from '../../../models/RAMEN';
import Collection = RAMEN.Collection;

@Component({
  selector: 'app-collections',
  imports: [TableModule],
  templateUrl: './collections.screen.html',
  styleUrl: './collections.screen.scss',
})
export class CollectionsScreen {
  private readonly data: ListService = inject(ListService);

  public collection: Signal<string> = signal('Communication');
  public options: Signal<ListOptions> = signal({ orderBy: 'label', asc: true, limit: 50, skip: 0 });

  public readonly $collections: HttpResourceRef<List<Collection>> = this.data.fetchList(
    Listable.COLLECTION,
    this.collection,
    this.options,
  );
}
