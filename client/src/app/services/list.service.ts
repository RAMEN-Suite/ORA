import { Injectable, Signal } from '@angular/core';
import { HttpParams, httpResource, HttpResourceRef, HttpResourceRequest } from '@angular/common/http';
import { withCache } from '@ngneat/cashew';
import { List, Listable, ListOptions } from '../models/List';
import { environment } from '../../environments/environment';
import { FacetGroup, FacetOptions } from '../models/Facet';
import { FilterUtils } from '../utils/FilterUtils';

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
  private readonly baseUrl: string = `${environment.apiBaseUrl}${environment.apiPaths.data}`;

  public fetchList<T>(list: Listable, label: Signal<string>, options?: Signal<ListOptions>): HttpResourceRef<List<T>> {
    return httpResource(
      (): HttpResourceRequest => ({
        url: `${this.baseUrl}/${list}`,
        params: this.getHttpListParams(label(), options?.()),
        method: 'GET',
        context: withCache(),
      }),
      { defaultValue: { data: [], pagination: DEFAULT_PAGINATION } },
    );
  }

  public fetchFacets<T>(list: Listable, label: Signal<string>, options?: Signal<FacetOptions>): HttpResourceRef<FacetGroup[]> {
    return httpResource(
      (): HttpResourceRequest => ({
        url: `${this.baseUrl}/${list}/facets`,
        params: this.getHttpFacetParams(label(), options?.()),
        method: 'GET',
        context: withCache(),
      }),
      { defaultValue: [] },
    );
  }

  private getHttpFacetParams(label?: string, options?: FacetOptions): HttpParams {
    let params: HttpParams = new HttpParams();

    if (label) params = params.set('label', label);
    if (options?.search !== undefined) params = params.set('search', String(options.search));
    for (const facet of options?.facets ?? []) params = params.append('facets', facet);
    for (const filter of options?.filters ?? []) params = params.append('filters', FilterUtils.serializeFilter(filter));

    return params;
  }

  private getHttpListParams(label?: string, options?: ListOptions): HttpParams {
    let params: HttpParams = new HttpParams();

    if (label) params = params.set('label', label);
    if (options?.limit !== undefined) params = params.set('limit', String(options.limit));
    if (options?.skip !== undefined) params = params.set('skip', String(options.skip));
    if (options?.orderBy) params = params.set('orderBy', options.orderBy);
    if (options?.asc !== undefined) params = params.set('asc', String(options.asc));
    if (options?.search) params = params.set('search', options.search);
    for (const filter of options?.filters ?? []) params = params.append('filters', FilterUtils.serializeFilter(filter));

    return params;
  }
}
