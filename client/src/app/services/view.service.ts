import { HttpClient, httpResource, HttpResourceRef, HttpResourceRequest } from '@angular/common/http';
import { inject, Injectable, Signal } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Node } from '../models/RAMEN';

export interface ViewResponse {
  node: Node;
  values: Record<string, unknown>;
}

@Injectable({
  providedIn: 'root',
})
export class ViewService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = `${environment.apiBaseUrl}${environment.apiPaths.view}`;

  public fetchNode(uuid: string): Observable<Node> {
    return this.http
      .get<ViewResponse>(`${this.baseUrl}/${encodeURIComponent(uuid)}`)
      .pipe(map((response: ViewResponse): Node => response.node));
  }

  public fetchView(uuid: Signal<string | null | undefined>, paths: Signal<string[]>): HttpResourceRef<ViewResponse | undefined> {
    return httpResource<ViewResponse>(
      (): HttpResourceRequest | undefined => {
        const value: string | null | undefined = uuid();
        if (!value) return undefined;
        return { url: `${this.baseUrl}/${encodeURIComponent(value)}`, params: { paths: paths() } };
      },
      { defaultValue: undefined },
    );
  }
}
