import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { environment } from '../../environments/environment';
import { Config } from '../models/Config';
import { HttpClient, HttpContext } from '@angular/common/http';
import { withCache } from '@ngneat/cashew';
import { firstValueFrom } from 'rxjs';
import { AppConfig } from '../models/AppConfig';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly url: string = `${environment.apiBaseUrl}${environment.apiPaths.config}`;

  private readonly configState: WritableSignal<Config.Root | null> = signal(null);
  private readonly errorState: WritableSignal<unknown | null> = signal(null);

  public readonly hasError: Signal<boolean> = computed((): boolean => this.errorState() !== null);
  public readonly hasConfig: Signal<boolean> = computed((): boolean => this.configState() !== null);
  public readonly error: Signal<unknown> = this.errorState.asReadonly();

  public readonly config: Signal<AppConfig> = computed((): AppConfig => {
    const config: Config.Root | null = this.configState();
    if (!config) throw new Error('Application cannot start without configuration.');
    return new AppConfig(config);
  });

  public async init(): Promise<void> {
    try {
      const context: HttpContext = withCache({ storage: 'localStorage', ttl: 1 });
      const config: Config.Root = await firstValueFrom(this.http.get<Config.Root>(this.url, { context }));
      this.configState.set(config);
    } catch (error: unknown) {
      this.errorState.set(error);
    }
  }
}
