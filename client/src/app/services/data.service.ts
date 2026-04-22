import { Injectable, Signal } from '@angular/core';
import { HttpParams, httpResource, HttpResourceRef, HttpResourceRequest } from '@angular/common/http';
import { Nullable } from 'primeng/ts-helpers';
import { ListOptions } from '../models/utility/Options';
import { Entity } from '../models/ramen/Entity';
import { Collection } from '../models/ramen/Collection';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private readonly baseUrl: string = '/api/data';

  public fetchEntities(type: Signal<string>, options?: Signal<ListOptions>): HttpResourceRef<Entity[]> {
    return httpResource(
      (): HttpResourceRequest => ({
        url: `${this.baseUrl}/entities`,
        params: this.getHttpListParams(type(), options?.()),
        method: 'GET',
      }),
      { defaultValue: [] },
    );
  }

  public fetchCollections(type: Signal<string>, options?: Signal<ListOptions>): HttpResourceRef<Collection[]> {
    return httpResource(
      (): HttpResourceRequest => ({
        url: `${this.baseUrl}/collections`,
        params: this.getHttpListParams(type(), options?.()),
        method: 'GET',
      }),
      { defaultValue: [] },
    );
  }

  private getHttpListParams(type?: Nullable<string>, options?: ListOptions): HttpParams {
    let params: HttpParams = new HttpParams();

    if (type) params = params.set('type', type);
    if (options?.limit !== undefined) params = params.set('limit', options.limit);
    if (options?.skip !== undefined) params = params.set('skip', options.skip);
    if (options?.orderBy) params = params.set('orderBy', options.orderBy);
    if (options?.asc !== undefined) params = params.set('asc', options.asc);

    return params;
  }
}
