import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { environment } from '../../environments/environment';
import { Config } from '../models/Config';
import { HttpClient, HttpContext } from '@angular/common/http';
import { withCache } from '@ngneat/cashew';
import { firstValueFrom } from 'rxjs';
import { Registry } from '../models/Registry';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly url: string = `${environment.apiBaseUrl}${environment.apiPaths.config}`;

  private readonly configState: WritableSignal<Config | null> = signal(null);
  private readonly errorState: WritableSignal<unknown> = signal(null);

  public readonly hasConfig: Signal<boolean> = computed((): boolean => this.configState() !== null);
  public readonly error: Signal<unknown> = this.errorState.asReadonly();

  public readonly config: Signal<Registry> = computed((): Registry => {
    const config: Config | null = this.configState();
    if (!config) throw new Error('Application cannot start without configuration.');
    return new Registry(config);
  });

  public async init(): Promise<void> {
    try {
      const context: HttpContext = withCache({ storage: 'localStorage', ttl: 1 });
      const config: Config = await firstValueFrom(this.http.get<Config>(this.url, { context }));
      this.configState.set(config);
    } catch (error: unknown) {
      this.errorState.set(error);
    }
  }
}
