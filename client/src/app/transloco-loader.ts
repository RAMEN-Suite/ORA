import { inject, Injectable } from '@angular/core';
import { Translation, TranslocoLoader } from '@jsverse/transloco';
import { HttpClient } from '@angular/common/http';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
import { environment } from '../environments/environment';
import { deepmerge } from 'deepmerge-ts';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  private readonly http: HttpClient = inject(HttpClient);

  public getTranslation(lang: string): Observable<Translation> {
    return forkJoin({
      app: this.loadAppTranslations(lang),
      custom: this.loadCustomTranslations(lang),
    }).pipe(map(({ app, custom }: Translation): Translation => deepmerge(app, custom) as Translation));
  }

  private loadAppTranslations(lang: string): Observable<Translation> {
    return this.load(`/i18n/${lang}.json`);
  }

  private loadCustomTranslations(lang: string): Observable<Translation> {
    const url = `${environment.apiBaseUrl}${environment.apiPaths.i18n}/${lang}.json`;
    return this.load(url);
  }

  private load(url: string): Observable<Translation> {
    return this.http.get<Translation>(url).pipe(catchError((): Observable<Translation> => of({})));
  }
}
