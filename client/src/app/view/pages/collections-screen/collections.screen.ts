import {Component, computed, inject, linkedSignal, signal, Signal, WritableSignal} from '@angular/core';
import {TableModule} from 'primeng/table';
import {PaginatedListComponent} from '../../components/paginated-list/paginated-list.component';
import {ListService} from '../../../services/list.service';
import {List, Listable, ListOptions} from '../../../models/List';
import {RAMEN} from '../../../models/RAMEN';
import {HttpResourceRef} from '@angular/common/http';
import {ConfigService} from '../../../services/config.service';
import {Config} from '../../../models/Config';
import {NavigationService} from '../../../services/navigation.service';
import {ActivatedRoute, Params} from '@angular/router';
import {PreviousLinkedValue} from '../../../../types/global';
import {ROUTES} from '../../../app.routes';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {PaginationUtils} from '../../../utils/PaginationUtils';
import {SelectComponent} from '../../components/select/select.component';
import {FormsModule} from '@angular/forms';
import {IftaLabel} from 'primeng/iftalabel';
import {InputText} from 'primeng/inputtext';
import {Select} from 'primeng/select';
import {Button} from 'primeng/button';
import { AppConfig } from '../../../models/AppConfig';
import Collection = RAMEN.Collection;
import Property = Config.Property;
import NodeOption = Config.NodeOption;
import MultiNode = Config.MultiNode;

@Component({
  selector: 'screen-collections',
  imports: [TableModule, PaginatedListComponent, SelectComponent, FormsModule, IftaLabel, InputText, Select, Button],
  templateUrl: './collections.screen.html',
  styleUrl: './collections.screen.scss',
})
export class CollectionsScreen {
  private readonly navigationService: NavigationService = inject(NavigationService);
  private readonly configService: ConfigService = inject(ConfigService);
  private readonly listService: ListService = inject(ListService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);

  private readonly config: Signal<AppConfig> = computed((): AppConfig => this.configService.config());
  private readonly screen: Signal<MultiNode> = computed((): MultiNode => this.config().screen('collections'));

  protected readonly nodes: Signal<NodeOption[]> = computed((): NodeOption[] => this.screen().nodes);
  protected readonly activeNode: WritableSignal<NodeOption> = signal<NodeOption>(this.config().initialNode(this.screen()));
  protected readonly activeType: Signal<string> = computed((): string => this.activeNode().value);
  protected readonly rawProperties: Signal<Property[]> = computed((): Property[] =>
    this.config().properties(this.screen(), this.activeNode()),
  );

  protected readonly options: WritableSignal<ListOptions> = signal({ orderBy: 'label', asc: true, limit: 25, skip: 0 });
  public readonly $list: HttpResourceRef<List<Collection>> = this.listService.fetchList(
    Listable.COLLECTION,
    this.activeType,
    this.options,
  );

  protected readonly collections: Signal<List<Collection>> = linkedSignal({
    source: (): List<Collection> => this.$list.value(),
    computation: (source: List<Collection>, previous: PreviousLinkedValue<List<Collection>>): List<Collection> =>
      this.$list.isLoading() ? (previous?.value ?? source) : source,
  });

  protected readonly properties: Signal<Property[]> = linkedSignal({
    source: (): Property[] => this.rawProperties(),
    computation: (source: Property[], previous: PreviousLinkedValue<Property[]>): Property[] =>
      this.$list.isLoading() ? (previous?.value ?? source) : source,
  });

  constructor() {
    this.route.queryParams.pipe(takeUntilDestroyed()).subscribe(this.applyQueryParams.bind(this));
  }

  protected handlePaginationChange(change: Partial<Pick<ListOptions, 'limit' | 'skip'>>): void {
    this.options.update((current: ListOptions): ListOptions => {
      const next: ListOptions = { ...current, ...change };

      const limit: number = PaginationUtils.parseLimit(next.limit);
      const page: number = PaginationUtils.skipToPage(next.skip, limit);
      const skip: number = PaginationUtils.pageToSkip(page, limit);

      const params: Record<string, number> = { page, limit };
      this.navigationService.updateQuery(this.route, params);
      return { ...next, limit, skip };
    });
  }

  protected handleNodeChange(option: NodeOption | undefined): void {
    if (!option) return;
    this.activeNode.set(option);
    this.options.update((current: ListOptions): ListOptions => ({ ...current, skip: 0 }));
    this.navigationService.updateQuery(this.route, { type: option.value, limit: this.options().limit, page: 1 });
  }

  protected handleSearchChange(searchPhrase: string): void {
    const search: string = searchPhrase.trim();
    if (search.length < 3 && search !== '') return;

    this.options.update((current: ListOptions): ListOptions => {
      const next: ListOptions = { ...current, search: search || undefined, skip: 0 };
      this.navigationService.updateQuery(this.route, { search: search || null, page: 1 });
      return next;
    });
  }

  protected handleSortingChange(change: Partial<Pick<ListOptions, 'asc' | 'orderBy'>>): void {
    this.options.update((current: ListOptions): ListOptions => {
      const next: ListOptions = { ...current, ...change, skip: 0 };
      const orderBy: string = next.orderBy || 'label';
      const asc: string = String(next.asc);

      const params: Record<string, string | number> = { orderBy, asc, page: 1 };
      this.navigationService.updateQuery(this.route, params);
      return next;
    });
  }

  private applyQueryParams(params: Params): void {
    const limit: number = PaginationUtils.parseLimit(params['limit']);
    const page: number = PaginationUtils.parsePage(params['page']);
    const skip: number = PaginationUtils.pageToSkip(page, limit);

    const search: string | undefined = params['search'];
    const type: string | undefined = params['type'];

    if (type !== null && type !== undefined) {
      const existing: NodeOption | undefined = this.config().node(this.screen(), type);
      if (existing) this.activeNode.set(existing);
    }

    this.options.update((current: ListOptions): ListOptions => ({ ...current, limit, skip, search }));
  }

  protected readonly ROUTES: typeof ROUTES = ROUTES;
}
