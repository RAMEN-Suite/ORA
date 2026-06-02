import { HttpClient, httpResource, HttpResourceRef, HttpResourceRequest } from '@angular/common/http';
import { inject, Injectable, Signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../envs/environment';
import { withCache } from '@ngneat/cashew';

const EXTERNAL_URL: RegExp = /^https?:\/\//i;
const SPECIAL_URL: RegExp = /^(data|blob):/i;

@Injectable({
  providedIn: 'root',
})
export class ContentService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = `${environment.apiBaseUrl}${environment.apiPaths.content}`;

  public fetchMarkdownOnce(path: string): Observable<string> {
    return this.http.get(this.resolveMarkdownUrl(path), { responseType: 'text', context: withCache() });
  }

  public fetchMarkdown(path: Signal<string | null | undefined>): HttpResourceRef<string | undefined> {
    return httpResource.text(
      (): HttpResourceRequest | undefined => {
        const value: string | null | undefined = path();
        if (!value) return undefined;

        return {
          url: this.resolveMarkdownUrl(value),
          context: withCache(),
          method: 'GET',
        };
      },
      { defaultValue: undefined },
    );
  }

  public resolveMarkdownUrl(path: string): string {
    return `${this.baseUrl}/markdown/${this.normalizePath(path)}`;
  }

  public resolveAssetUrl(path: string): string {
    if (EXTERNAL_URL.test(path)) return path;
    if (SPECIAL_URL.test(path)) return path;
    if (path.startsWith(`${this.baseUrl}/assets/`)) return path;
    if (path.startsWith('/api/content/assets/')) return path;

    return `${this.baseUrl}/assets/${this.normalizeAssetPath(path)}`;
  }

  private normalizeAssetPath(path: string): string {
    return path
      .replace(/^\/+/, '')
      .replace(/^(\.\.\/)+assets\//, '')
      .replace(/^(\.\/)+assets\//, '')
      .replace(/^assets\//, '')
      .replace(/^(\.\/)+/, '');
  }

  private normalizePath(path: string): string {
    return path.replace(/^\/+/, '');
  }
}
