import { HttpClient, httpResource, HttpResourceRef, HttpResourceRequest } from '@angular/common/http';
import { inject, Injectable, Signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { withCache } from '@ngneat/cashew';

@Injectable({
  providedIn: 'root',
})
export class ContentService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = `${environment.apiBaseUrl}${environment.apiPaths.content}`;

  public fetchMarkdownOnce(path: string): Observable<string> {
    return this.http.get(this.markdownUrl(path), { responseType: 'text', context: withCache() });
  }

  public fetchMarkdown(path: Signal<string | null | undefined>): HttpResourceRef<string | undefined> {
    return httpResource.text(
      (): HttpResourceRequest | undefined => {
        const value: string | null | undefined = path();
        if (!value) return undefined;

        return {
          url: this.markdownUrl(value),
          context: withCache(),
          method: 'GET',
        };
      },
      { defaultValue: undefined },
    );
  }

  public markdownUrl(path: string): string {
    return `${this.baseUrl}/markdown/${this.normalizePath(path)}`;
  }

  public assetUrl(path: string): string {
    return `${this.baseUrl}/assets/${this.normalizePath(path)}`;
  }

  private normalizePath(path: string): string {
    return path.replace(/^\/+/, '');
  }
}
