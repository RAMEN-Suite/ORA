import { Component, computed, inject, linkedSignal, signal, Signal, viewChild, WritableSignal } from '@angular/core';
import { TableModule } from 'primeng/table';
import { PaginatedListComponent } from '../../shared/paginated-list/paginated-list.component';
import { ListService } from '../../../services/list.service';
import { List, Listable, QueryOptions } from '../../../models/List';
import { HttpResourceRef } from '@angular/common/http';
import { ConfigService } from '../../../services/config-service/config.service';
import { NavigationService } from '../../../services/navigation.service';
import { ActivatedRoute, Params } from '@angular/router';
import { PreviousLinkedValue } from '../../../../types/global';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PaginationUtils } from '../../../utils/PaginationUtils';
import { SelectComponent } from '../../shared/select/select.component';
import { FormsModule } from '@angular/forms';
import { IftaLabel } from 'primeng/iftalabel';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { Utils } from '../../../utils/Utils';
import { Tooltip } from 'primeng/tooltip';
import { ActiveFilter, FacetGroup, FacetOptions } from '../../../models/Facet';
import { FacetListComponent } from '../../shared/facet-list/facet-list.component';
import { FilterUtils } from '../../../utils/FilterUtils';
import { TranslocoDirective } from '@jsverse/transloco';
import { Collection } from '../../../models/Node';
import { ROUTES } from '../../../app.routes';
import { FilterOption, ListOption, Option, Property } from '../../../models/config/ListViews';
import { ListRegistry } from '../../../services/config-service/list.registry';

@Component({
  selector: 'screen-collections',
  imports: [
    TableModule,
    PaginatedListComponent,
    SelectComponent,
    FormsModule,
    IftaLabel,
    InputText,
    Button,
    Tooltip,
    FacetListComponent,
    TranslocoDirective,
  ],
  templateUrl: './collections.screen.html',
})
export class CollectionsScreen {
  private readonly facetListComponent: Signal<FacetListComponent | undefined> = viewChild(FacetListComponent);

  private readonly navigationService: NavigationService = inject(NavigationService);
  private readonly configService: ConfigService = inject(ConfigService);
  private readonly listService: ListService = inject(ListService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);

  private readonly view: ListRegistry = this.configService.config().list('collections');

  protected readonly items: ListOption[] = this.view.options();
  protected readonly activeItem: WritableSignal<ListOption> = signal<ListOption>(this.view.activeOption());
  protected readonly activeItemLabel: Signal<string> = computed((): string => this.activeItem().value);
  protected readonly activeProperties: Signal<Property[]> = computed((): Property[] => this.view.properties(this.activeItem()));

  protected readonly filters: Signal<FilterOption[]> = computed((): FilterOption[] => this.activeItem().filters ?? []);
  protected readonly activeFilters: WritableSignal<ActiveFilter[]> = signal<ActiveFilter[]>([]);

  protected readonly sort: Signal<Option[]> = computed((): Option[] => this.activeItem().sort?.options ?? []);
  protected readonly activeSort: WritableSignal<Option | undefined> = signal(this.view.activeGroupOption(this.activeItem().sort));

  protected readonly queryOptions: WritableSignal<QueryOptions> = signal({
    orderBy: this.activeSort()?.value ?? 'label',
    asc: this.activeItem().sort?.direction === 'asc',
    limit: 25,
    skip: 0,
  });
  public readonly $list: HttpResourceRef<List<Collection>> = this.listService.fetchList(
    Listable.COLLECTION,
    this.activeItemLabel,
    this.queryOptions,
  );

  protected readonly facetOptions: WritableSignal<FacetOptions> = signal({
    facets: this.view.filterPaths(this.activeItem()),
  });
  public readonly $facets: HttpResourceRef<FacetGroup[]> = this.listService.fetchFacets(
    Listable.COLLECTION,
    this.activeItemLabel,
    this.facetOptions,
  );

  protected readonly collections: Signal<List<Collection>> = linkedSignal({
    source: (): List<Collection> => this.$list.value(),
    computation: (source: List<Collection>, previous: PreviousLinkedValue<List<Collection>>): List<Collection> =>
      this.$list.isLoading() ? (previous?.value ?? source) : source,
  });

  protected readonly properties: Signal<Property[]> = linkedSignal({
    source: (): Property[] => this.activeProperties(),
    computation: (source: Property[], previous: PreviousLinkedValue<Property[]>): Property[] =>
      this.$list.isLoading() ? (previous?.value ?? source) : source,
  });

  protected readonly facets: Signal<FacetGroup[]> = linkedSignal({
    source: (): FacetGroup[] => this.$facets.value(),
    computation: (source: FacetGroup[], previous: PreviousLinkedValue<FacetGroup[]>): FacetGroup[] =>
      this.$facets.isLoading() ? (previous?.value ?? source) : source,
  });

  constructor() {
    this.route.queryParams.pipe(takeUntilDestroyed()).subscribe(this.applyQueryParams.bind(this));
  }

  protected handlePaginationChange(change: Partial<Pick<QueryOptions, 'limit' | 'skip'>>): void {
    const current: QueryOptions = this.queryOptions();
    const next: QueryOptions = { ...current, ...change };

    const limit: number = PaginationUtils.parseLimit(next.limit);
    const page: number = PaginationUtils.skipToPage(next.skip, limit);

    const params: Params = { page, limit };
    this.navigationService.updateQuery(this.route, params, { scroll: 'manual' });
  }

  protected handleActiveItemChange(option: ListOption | undefined): void {
    if (!option) return;

    const params: Params = { label: option.value, limit: this.queryOptions().limit, page: 1, orderBy: null };
    this.navigationService.updateQuery(this.route, params);
  }

  protected handleSearchChange(searchPhrase: string): void {
    const search: string = searchPhrase.trim();
    if (search.length < 3 && search !== '') return;

    const params: Params = { search: search || null, page: 1 };
    this.navigationService.updateQuery(this.route, params, { scroll: 'manual' });
  }

  protected handleFilterChange(filters: ActiveFilter[]): void {
    const serialized: string[] = filters.map(FilterUtils.serializeFilter);
    const params: Params = { filters: serialized, page: 1 };
    this.navigationService.updateQuery(this.route, params, { scroll: 'manual' });
  }

  protected handleSortChange(change: Partial<Pick<QueryOptions, 'asc' | 'orderBy'>>): void {
    const current: QueryOptions = this.queryOptions();
    const next: QueryOptions = { ...current, ...change };

    const orderBy: string = next.orderBy ?? 'label';
    const asc: string = String(next.asc);

    const params: Record<string, string | number> = { orderBy, asc, page: 1 };
    this.navigationService.updateQuery(this.route, params, { scroll: 'manual' });
  }

  protected handleClearFilter(): void {
    this.facetListComponent()?.collapseAccordions();
    this.navigationService.updateQuery(this.route, null, { queryParamsHandling: null });
  }

  private applyQueryParams(params: Params): void {
    const limit: number = PaginationUtils.parseLimit(params['limit']);
    const page: number = PaginationUtils.parsePage(params['page']);
    const skip: number = PaginationUtils.pageToSkip(page, limit);

    this.applyNodeParam(params);
    this.applyFilterParams(params);

    const search: string | undefined = Utils.parseString(params['search']);
    const { orderBy, asc } = this.applySortParams(params);

    const list: QueryOptions = { limit, skip, search, orderBy, asc, filters: this.activeFilters() };
    this.queryOptions.update((current: QueryOptions): QueryOptions => ({ ...current, ...list }));

    const facet: FacetOptions = { search, facets: this.view.filterPaths(this.activeItem()), filters: this.activeFilters() };
    this.facetOptions.update((current: FacetOptions): FacetOptions => ({ ...current, ...facet }));
  }

  private applyNodeParam(params: Params): void {
    const label: string | undefined = Utils.parseString(params['label']);
    if (label === undefined) return;

    const existing: ListOption | undefined = this.view.option(label);
    if (existing) this.activeItem.set(existing);
  }

  private applyFilterParams(params: Params): void {
    const filterArray: unknown[] = Utils.parseArray(params['filters']);
    const filters: ActiveFilter[] = Utils.parseStringArray(filterArray).map(FilterUtils.parseFilter);
    this.activeFilters.set(filters);
  }

  private applySortParams(params: Params): Pick<QueryOptions, 'orderBy' | 'asc'> {
    const rawOrderBy: string | undefined = Utils.parseString(params['orderBy']);
    const existing: Option | undefined = this.view.option(rawOrderBy ?? '', this.activeItem().sort?.options ?? []);
    const initial: Option | undefined = this.view.activeGroupOption(this.activeItem().sort);
    this.activeSort.set(existing ?? initial);

    return {
      orderBy: this.activeSort()?.value ?? 'label',
      asc: Utils.parseBoolean(params['asc']) ?? this.activeItem().sort?.direction === 'asc',
    };
  }

  protected readonly ROUTES: typeof ROUTES = ROUTES;
}
