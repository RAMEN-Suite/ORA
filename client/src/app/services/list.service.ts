import { Injectable, Signal } from '@angular/core';
import { HttpParams, httpResource, HttpResourceRef, HttpResourceRequest } from '@angular/common/http';
import { Nullable } from 'primeng/ts-helpers';
import { withCache } from '@ngneat/cashew';
import { List, Listable, ListOptions } from '../models/List';
import { environment } from '../../environments/environment';

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

  public fetchList<T>(list: Listable, type: Signal<string>, options?: Signal<ListOptions>): HttpResourceRef<List<T>> {
    return httpResource(
      (): HttpResourceRequest => ({
        url: `${this.baseUrl}/${list}`,
        params: this.getHttpListParams(type(), options?.()),
        method: 'GET',
        context: withCache(),
      }),
      { defaultValue: { data: [], pagination: DEFAULT_PAGINATION } },
    );
  }

  private getHttpListParams(type?: Nullable<string>, options?: ListOptions): HttpParams {
    let params: HttpParams = new HttpParams();

    if (type) params = params.set('type', type);
    if (options?.limit !== undefined) params = params.set('limit', String(options.limit));
    if (options?.skip !== undefined) params = params.set('skip', String(options.skip));
    if (options?.orderBy) params = params.set('orderBy', options.orderBy);
    if (options?.asc !== undefined) params = params.set('asc', String(options.asc));
    if (options?.search) params = params.set('search', options.search);
    if (options?.field) params = params.set('field', options.field);

    return params;
  }
}
