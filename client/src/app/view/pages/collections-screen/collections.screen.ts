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
import { ActivatedRoute, Params } from '@angular/router';
import { PreviousLinkedValue } from '../../../../types/global';
import { ROUTES } from '../../../app.routes';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PaginationUtils } from '../../../utils/PaginationUtils';
import { SelectComponent } from '../../components/select/select.component';
import { Categories, Properties } from '../../../utils/ConfigUtils';
import { FormsModule } from '@angular/forms';
import { IftaLabel } from 'primeng/iftalabel';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Button } from 'primeng/button';
import Collection = RAMEN.Collection;
import Property = Config.Property;
import Category = Config.Category;

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

  private readonly config: Signal<Config.CollectionsScreen> = computed(
    (): Config.CollectionsScreen => this.configService.screens().collections,
  );

  protected readonly initialType: Signal<string> = computed((): string => this.config().initialType);
  protected readonly categories: Signal<Category[]> = computed((): Category[] => this.config().categories);
  protected readonly properties: Signal<Property[]> = computed((): Property[] =>
    Properties.scoped(this.config().properties, this.activeType()),
  );

  protected readonly activeCategory: WritableSignal<Category> = signal(Categories.initial(this.categories(), this.initialType()));
  protected readonly activeType: Signal<string> = computed((): string => this.activeCategory().value);
  protected readonly options: WritableSignal<ListOptions> = signal({ orderBy: 'label', asc: true, limit: 25, skip: 0 });
  public readonly $list: HttpResourceRef<List<Collection>> = this.listService.fetchList(
    Listable.COLLECTION,
    this.activeType,
    this.options,
  );

  protected readonly collectionList: Signal<List<Collection>> = linkedSignal({
    source: (): List<Collection> => this.$list.value(),
    computation: (source: List<Collection>, previous: PreviousLinkedValue<List<Collection>>): List<Collection> =>
      this.$list.isLoading() ? (previous?.value ?? source) : source,
  });

  protected readonly propertyList: Signal<Property[]> = linkedSignal({
    source: (): Property[] => this.properties(),
    computation: (source: Property[], previous: PreviousLinkedValue<Property[]>): Property[] =>
      this.$list.isLoading() ? (previous?.value ?? source) : source,
  });

  constructor() {
    this.route.queryParams.pipe(takeUntilDestroyed()).subscribe((params: Params): void => {
      const limit: number = PaginationUtils.parseLimit(params['limit']);
      const page: number = PaginationUtils.parsePage(params['page']);
      const skip: number = PaginationUtils.pageToSkip(page, limit);

      const search: string | undefined = params['search'];
      const type: string | undefined = params['type'];

      if (type !== null && type !== undefined) {
        const existing: Category | undefined = Categories.find(this.categories(), type);
        if (existing) this.activeCategory.set(existing);
      }

      this.options.update((current: ListOptions): ListOptions => ({ ...current, limit, skip, search }));
    });
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

  protected handleCategoryChange(category: Category | undefined): void {
    if (!category) return;
    this.activeCategory.set(category);
    this.options.update((current: ListOptions): ListOptions => ({ ...current, skip: 0 }));
    this.navigationService.updateQuery(this.route, { type: category.value, limit: this.options().limit, page: 1 });
  }

  protected handleSearchChange(searchPhrase: string): void {
    const search: string = searchPhrase.trim();
    if (search.length < 3 && search !== '') return;

    this.options.update((current: ListOptions): ListOptions => {
      const next: ListOptions = { ...current, search: search || undefined, skip: 0, field: 'label' };
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

  protected readonly ROUTES: typeof ROUTES = ROUTES;
}
