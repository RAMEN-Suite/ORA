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
import {AppConfig} from '../../../models/AppConfig';
import {StringUtils} from '../../../utils/StringUtils';
import { Tooltip } from 'primeng/tooltip';
import Collection = RAMEN.Collection;
import Property = Config.Property;
import NodeOption = Config.NodeOption;
import MultiNode = Config.MultiNode;
import Option = Config.Option;

@Component({
  selector: 'screen-collections',
  imports: [TableModule, PaginatedListComponent, SelectComponent, FormsModule, IftaLabel, InputText, Select, Button, Tooltip],
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
  protected readonly activeNodeLabel: Signal<string> = computed((): string => this.activeNode().value);
  protected readonly rawProperties: Signal<Property[]> = computed((): Property[] =>
    this.config().properties(this.screen(), this.activeNode()),
  );

  protected readonly sortOptions: Signal<Option[]> = computed((): Option[] => this.activeNode().sort?.options ?? []);
  protected readonly activeSort: WritableSignal<Option | undefined> = signal(this.config().initialOption(this.activeNode().sort));

  protected readonly options: WritableSignal<ListOptions> = signal({
    orderBy: this.activeSort()?.value ?? 'label',
    asc: this.activeNode().sort?.direction === 'asc',
    limit: 25,
    skip: 0,
  });
  public readonly $list: HttpResourceRef<List<Collection>> = this.listService.fetchList(
    Listable.COLLECTION,
    this.activeNodeLabel,
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
    const current: ListOptions = this.options();
    const next: ListOptions = { ...current, ...change };

    const limit: number = PaginationUtils.parseLimit(next.limit);
    const page: number = PaginationUtils.skipToPage(next.skip, limit);

    const params: Params = { page, limit };
    this.navigationService.updateQuery(this.route, params);
  }

  protected handleNodeChange(option: NodeOption | undefined): void {
    if (!option) return;

    const params: Params = { label: option.value, limit: this.options().limit, page: 1, orderBy: null };
    this.navigationService.updateQuery(this.route, params);
  }

  protected handleSearchChange(searchPhrase: string): void {
    const search: string = searchPhrase.trim();
    if (search.length < 3 && search !== '') return;

    const params: Params = { search: search || null, page: 1 };
    this.navigationService.updateQuery(this.route, params);
  }

  protected handleSortChange(change: Partial<Pick<ListOptions, 'asc' | 'orderBy'>>): void {
    const current: ListOptions = this.options();
    const next: ListOptions = { ...current, ...change };

    const orderBy: string = next.orderBy || 'label';
    const asc: string = String(next.asc);

    const params: Record<string, string | number> = { orderBy, asc, page: 1 };
    this.navigationService.updateQuery(this.route, params);
  }

  private applyQueryParams(params: Params): void {
    const limit: number = PaginationUtils.parseLimit(params['limit']);
    const page: number = PaginationUtils.parsePage(params['page']);
    const skip: number = PaginationUtils.pageToSkip(page, limit);

    const search: string | undefined = StringUtils.parseString(params['search']);
    const label: string | undefined = StringUtils.parseString(params['label']);

    if (label !== null && label !== undefined) {
      const existing: NodeOption | undefined = this.config().node(this.screen(), label);
      if (existing) this.activeNode.set(existing);
    }

    const rawOrderBy: string | undefined = StringUtils.parseString(params['orderBy']);
    const existing: Option | undefined = this.config().option(this.activeNode().sort?.options ?? [], rawOrderBy ?? '');
    const initial: Option | undefined = this.config().initialOption(this.activeNode().sort);
    this.activeSort.set(existing ?? initial);

    const orderBy: string = this.activeSort()?.value ?? 'label';
    const asc: boolean | undefined = StringUtils.parseBoolean(params['asc']) ?? this.activeNode().sort?.direction === 'asc';

    this.options.update((current: ListOptions): ListOptions => ({ ...current, limit, skip, search, orderBy, asc }));
  }

  protected readonly ROUTES: typeof ROUTES = ROUTES;
}
