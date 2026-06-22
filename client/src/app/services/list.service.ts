import { Injectable, Signal } from '@angular/core';
import { HttpParams, httpResource, HttpResourceRef, HttpResourceRequest } from '@angular/common/http';
import { withCache } from '@ngneat/cashew';
import { List, Listable, QueryOptions } from '../models/List';
import { environment } from '../../envs/environment';
import { FacetGroup, FacetOptions } from '../models/Facet';
import { FilterUtils } from '../utils/FilterUtils';
import { ParseUtils } from '../utils/ParseUtils';
import { ListOption, SortDirection, SortField, SortOption, SortValue } from '../models/config/ListViews';

const DEFAULT_PAGINATION = {
  skip: 0,
  limit: 0,
  count: 0,
  total: 0,
  hasNext: false,
  hasPrevious: false,
};

@Injectable({
  providedIn: 'root',
})
export class ListService {
  private readonly baseUrl: string = `${environment.apiBaseUrl}${environment.apiPaths.view}`;

  public fetchList<T>(
    list: Listable,
    active: Signal<ListOption | undefined>,
    options?: Signal<QueryOptions>,
  ): HttpResourceRef<List<T>> {
    return httpResource(
      (): HttpResourceRequest => ({
        url: `${this.baseUrl}/${list}`,
        params: this.getHttpListParams(active(), options?.()),
        method: 'GET',
        context: withCache(),
      }),
      { defaultValue: { data: [], pagination: DEFAULT_PAGINATION } },
    );
  }

  public fetchFacets(
    list: Listable,
    active: Signal<ListOption | undefined>,
    options?: Signal<FacetOptions>,
  ): HttpResourceRef<FacetGroup[]> {
    return httpResource(
      (): HttpResourceRequest => ({
        url: `${this.baseUrl}/${list}/facets`,
        params: this.getHttpFacetParams(active(), options?.()),
        method: 'GET',
        context: withCache(),
      }),
      { defaultValue: [] },
    );
  }

  private getHttpFacetParams(active?: ListOption, options?: FacetOptions): HttpParams {
    let params: HttpParams = new HttpParams();
    const label: string | undefined = active?.value ?? undefined;

    if (label) params = params.set('label', label);
    if (options?.search !== undefined) params = params.set('search', ParseUtils.parseString(options.search) ?? '');
    for (const facet of options?.facets ?? []) params = params.append('facets', facet);
    for (const filter of options?.filters ?? []) params = params.append('filters', FilterUtils.serializeFilter(filter));

    return params;
  }

  private getHttpListParams(active?: ListOption, options?: QueryOptions): HttpParams {
    let params: HttpParams = new HttpParams();
    const label: string | undefined = active?.value ?? undefined;

    if (label) params = params.set('label', label);
    if (options?.limit !== undefined) params = params.set('limit', String(options.limit));
    if (options?.skip !== undefined) params = params.set('skip', String(options.skip));
    if (options?.search) params = params.set('search', options.search);

    for (const orderBy of this.serializeOrderBy(options, active)) params = params.append('orderBy', orderBy);
    for (const filter of options?.filters ?? []) params = params.append('filters', FilterUtils.serializeFilter(filter));

    return params;
  }

  private serializeOrderBy(options?: QueryOptions, active?: ListOption): string[] {
    const identifier: string | undefined = ParseUtils.parseString(options?.orderBy);
    const asc: boolean = options?.asc !== false;
    if (!identifier) return [];

    const sort: SortOption | undefined = active?.sort?.options.find((o: SortOption): boolean => o.identifier === identifier);
    if (!sort) return [asc ? identifier : `-${identifier}`];

    return this.getSortValue(sort.value, asc, active?.sort?.direction ?? 'asc');
  }

  private getSortValue(value: SortValue, asc: boolean, direction: SortDirection): string[] {
    if (typeof value === 'string') return [this.getSortField(value, asc, direction)];
    return value.map((field: SortField): string => this.getSortField(field.field, asc, field.direction ?? direction));
  }

  private getSortField(field: string, asc: boolean, direction: SortDirection): string {
    const effectiveDirection: SortDirection = asc ? direction : this.invertDirection(direction);
    return effectiveDirection === 'desc' ? `-${field}` : field;
  }

  private invertDirection(direction: SortDirection): SortDirection {
    return direction === 'asc' ? 'desc' : 'asc';
  }
}
