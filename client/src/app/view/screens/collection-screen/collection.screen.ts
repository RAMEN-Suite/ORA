import { Component, computed, inject, Signal } from '@angular/core';
import { ConfigService } from '../../../services/config.service';
import { Registry } from '../../../models/Registry';

@Component({
  selector: 'screen-collection',
  imports: [],
  templateUrl: './collection.screen.html',
})
export class CollectionScreen {
  private readonly configService: ConfigService = inject(ConfigService);

  private readonly config: Registry = this.configService.config();

  protected readonly values: Record<string, unknown> = {};
  protected readonly labels: Signal<string[]> = computed((): string[] => ['Collection', 'Letter']);
}
