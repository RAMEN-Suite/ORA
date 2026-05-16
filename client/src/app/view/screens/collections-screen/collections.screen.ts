import { Component, computed, inject, linkedSignal, signal, Signal, viewChild, WritableSignal } from '@angular/core';
import { TableModule } from 'primeng/table';
import { PaginatedListComponent } from '../../shared/paginated-list/paginated-list.component';
import { ListService } from '../../../services/list.service';
import { List, Listable, ListOptions } from '../../../models/List';
import { HttpResourceRef } from '@angular/common/http';
import { ConfigService } from '../../../services/config.service';
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
import { Registry } from '../../../models/Registry';
import { Utils } from '../../../utils/Utils';
import { Tooltip } from 'primeng/tooltip';
import { ActiveFilter, FacetGroup, FacetOptions } from '../../../models/Facet';
import { FacetListComponent } from '../../shared/facet-list/facet-list.component';
import { FilterUtils } from '../../../utils/FilterUtils';
import { TranslocoDirective } from '@jsverse/transloco';
import { Choice, FilterChoice, ListItem, ListView, Property } from '../../../models/Config';
import { Collection } from '../../../models/RAMEN';
import { ROUTES } from '../../../app.routes';

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
  private readonly navigationService: NavigationService = inject(NavigationService);
  private readonly configService: ConfigService = inject(ConfigService);
  private readonly listService: ListService = inject(ListService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);

  private readonly facetListComponent: Signal<FacetListComponent | undefined> = viewChild(FacetListComponent);

  private readonly config: Registry = this.configService.config();
  private readonly view: ListView = this.config.screen('collections');

  protected readonly items: ListItem[] = this.view.items;
  protected readonly activeItem: WritableSignal<ListItem> = signal<ListItem>(this.config.initialNode(this.view));
  protected readonly activeItemLabel: Signal<string> = computed((): string => this.activeItem().value);
  protected readonly activeProperties: Signal<Property[]> = computed((): Property[] =>
    this.config.properties(this.view, this.activeItem()),
  );

  protected readonly filters: Signal<FilterChoice[]> = computed((): FilterChoice[] => this.config.filters(this.activeItem()));
  protected readonly activeFilters: WritableSignal<ActiveFilter[]> = signal<ActiveFilter[]>([]);

  protected readonly sort: Signal<Choice[]> = computed((): Choice[] => this.activeItem().sort?.options ?? []);
  protected readonly activeSort: WritableSignal<Choice | undefined> = signal(this.config.initialOption(this.activeItem().sort));

  protected readonly facetOptions: WritableSignal<FacetOptions> = signal({ facets: this.config.filterPaths(this.activeItem()) });
  protected readonly listOptions: WritableSignal<ListOptions> = signal({
    orderBy: this.activeSort()?.value ?? 'label',
    asc: this.activeItem().sort?.direction === 'asc',
    limit: 25,
    skip: 0,
  });

  public readonly $list: HttpResourceRef<List<Collection>> = this.listService.fetchList(
    Listable.COLLECTION,
    this.activeItemLabel,
    this.listOptions,
  );
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

  protected handlePaginationChange(change: Partial<Pick<ListOptions, 'limit' | 'skip'>>): void {
    const current: ListOptions = this.listOptions();
    const next: ListOptions = { ...current, ...change };

    const limit: number = PaginationUtils.parseLimit(next.limit);
    const page: number = PaginationUtils.skipToPage(next.skip, limit);

    const params: Params = { page, limit };
    this.navigationService.updateQuery(this.route, params, { scroll: 'manual' });
  }

  protected handleActiveItemChange(option: ListItem | undefined): void {
    if (!option) return;

    const params: Params = { label: option.value, limit: this.listOptions().limit, page: 1, orderBy: null };
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

  protected handleSortChange(change: Partial<Pick<ListOptions, 'asc' | 'orderBy'>>): void {
    const current: ListOptions = this.listOptions();
    const next: ListOptions = { ...current, ...change };

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

    const list: ListOptions = { limit, skip, search, orderBy, asc, filters: this.activeFilters() };
    this.listOptions.update((current: ListOptions): ListOptions => ({ ...current, ...list }));

    const facet: FacetOptions = { search, facets: this.config.filterPaths(this.activeItem()), filters: this.activeFilters() };
    this.facetOptions.update((current: FacetOptions): FacetOptions => ({ ...current, ...facet }));
  }

  private applyNodeParam(params: Params): void {
    const label: string | undefined = Utils.parseString(params['label']);
    if (label === undefined) return;

    const existing: ListItem | undefined = this.config.node(this.view, label);
    if (existing) this.activeItem.set(existing);
  }

  private applyFilterParams(params: Params): void {
    const filterArray: unknown[] = Utils.parseArray(params['filters']);
    const filters: ActiveFilter[] = Utils.parseStringArray(filterArray).map(FilterUtils.parseFilter);
    this.activeFilters.set(filters);
  }

  private applySortParams(params: Params): Pick<ListOptions, 'orderBy' | 'asc'> {
    const rawOrderBy: string | undefined = Utils.parseString(params['orderBy']);
    const existing: Choice | undefined = this.config.option(this.activeItem().sort?.options ?? [], rawOrderBy ?? '');
    const initial: Choice | undefined = this.config.initialOption(this.activeItem().sort);
    this.activeSort.set(existing ?? initial);

    return {
      orderBy: this.activeSort()?.value ?? 'label',
      asc: Utils.parseBoolean(params['asc']) ?? this.activeItem().sort?.direction === 'asc',
    };
  }

  protected readonly ROUTES: typeof ROUTES = ROUTES;
}
