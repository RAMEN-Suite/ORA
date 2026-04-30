import { Component, computed, inject, linkedSignal, signal, Signal, WritableSignal } from '@angular/core';
import { TableModule } from 'primeng/table';
import { PaginatedListComponent } from '../../components/paginated-list/paginated-list.component';
import { ListService } from '../../../services/list.service';
import { List, Listable, ListOptions } from '../../../models/List';
import { RAMEN } from '../../../models/RAMEN';
import { HttpResourceRef } from '@angular/common/http';
import { ConfigService } from '../../../services/config.service';
import { Config } from '../../../models/Config';
import { NavigationService } from '../../../services/navigation.service';
import { ActivatedRoute } from '@angular/router';
import { PreviousLinkedValue } from '../../../../types/global';
import Collection = RAMEN.Collection;

@Component({
  selector: 'screen-collections',
  imports: [TableModule, PaginatedListComponent],
  templateUrl: './collections.screen.html',
  styleUrl: './collections.screen.scss',
})
export class CollectionsScreen {
  private readonly navigationService: NavigationService = inject(NavigationService);
  private readonly listService: ListService = inject(ListService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);

  private readonly configService: ConfigService = inject(ConfigService);
  private readonly config: Signal<Config.CollectionsScreen> = computed(
    (): Config.CollectionsScreen => this.configService.screens().collections,
  );

  protected readonly activeType: Signal<string> = signal('Communication');
  protected readonly options: WritableSignal<ListOptions> = signal({ orderBy: 'label', asc: true, limit: 10, skip: 0 });

  protected readonly collectionList: Signal<List<Collection>> = linkedSignal({
    source: (): List<Collection> => this.$list.value(),
    computation: (source: List<Collection>, previous: PreviousLinkedValue<List<Collection>>): List<Collection> =>
      this.$list.isLoading() ? (previous?.value ?? source) : source,
  });

  public readonly $list: HttpResourceRef<List<Collection>> = this.listService.fetchList(
    Listable.COLLECTION,
    this.activeType,
    this.options,
  );

  public handleOptionsChange(options: Partial<ListOptions>): void {
    this.options.update((o: ListOptions): ListOptions => ({ ...o, ...options }));
  }
}
