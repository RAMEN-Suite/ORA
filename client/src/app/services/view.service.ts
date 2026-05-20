import { HttpClient, httpResource, HttpResourceRef, HttpResourceRequest } from '@angular/common/http';
import { inject, Injectable, Signal } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Node } from '../models/Node';
import { withCache } from '@ngneat/cashew';

export interface ViewResponse<TNode extends Node = Node> {
  node: TNode;
  values: Record<string, unknown>;
}

@Injectable({
  providedIn: 'root',
})
export class ViewService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = `${environment.apiBaseUrl}${environment.apiPaths.view}`;

  public fetchNode<TNode extends Node>(uuid: string): Observable<TNode> {
    return this.http
      .get<ViewResponse<TNode>>(`${this.baseUrl}/${encodeURIComponent(uuid)}`, { context: withCache() })
      .pipe(map((response: ViewResponse<TNode>): TNode => response.node));
  }

  public fetchViewOnce<TNode extends Node>(uuid: string, paths: string[]): Observable<ViewResponse<TNode>> {
    return this.http.get<ViewResponse<TNode>>(`${this.baseUrl}/${encodeURIComponent(uuid)}`, {
      params: { paths },
      context: withCache(),
    });
  }

  public fetchView<TNode extends Node>(
    uuid: Signal<string | null | undefined>,
    paths: Signal<string[]>,
  ): HttpResourceRef<ViewResponse<TNode> | undefined> {
    return httpResource<ViewResponse<TNode>>(
      (): HttpResourceRequest | undefined => {
        const value: string | null | undefined = uuid();
        if (!value) return undefined;

        return {
          url: `${this.baseUrl}/${encodeURIComponent(value)}`,
          params: { paths: paths() },
          context: withCache(),
          method: 'GET',
        };
      },
      { defaultValue: undefined },
    );
  }
}
