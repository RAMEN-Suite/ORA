import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Entity } from '../models/ramen/Entity';
import { ListOptions } from '../models/utility/Options';
import { Nullable } from 'primeng/ts-helpers';
import { catchError, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = '/api/data';

  public entities: WritableSignal<Entity[]> = signal([]);

  public fetchEntities(node?: Nullable<string>, options?: ListOptions): void {
    let params: HttpParams = new HttpParams();

    if (node) params = params.set('node', node);
    if (options?.limit !== undefined) params = params.set('limit', options.limit);
    if (options?.skip !== undefined) params = params.set('skip', options.skip);
    if (options?.orderBy) params = params.set('orderBy', options.orderBy);
    if (options?.asc !== undefined) params = params.set('asc', options.asc);

    this.http
      .get<Entity[]>(`${this.baseUrl}/entities`, { params })
      .pipe(
        catchError((error: unknown): Observable<never[]> => {
          console.error('Failed fetching entities:', error);
          return of([]);
        }),
      )
      .subscribe((entities: Entity[] | never): void => this.entities.set(entities));
  }
}
