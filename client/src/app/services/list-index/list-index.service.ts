import { inject, Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { ListIndexConfig, ListIndexItem } from '../../models/config/IndexOptions';
import { ListIndex } from '../../models/ListIndex';
import { Registry } from '../../utils/Registry';
import { ConfigService } from '../config.service';
import { CharacterListIndex } from './character-list.index';
import { AliasListIndex } from './alias-list.index';
import { BibleListIndex } from './bible-list.index';

@Injectable({ providedIn: 'root' })
export class ListIndexService {
  private readonly translocoService: TranslocoService = inject(TranslocoService);
  private readonly configService: ConfigService = inject(ConfigService);

  private readonly config: Registry = this.configService.config();
  private readonly fallbackIndex: ListIndex = new CharacterListIndex();

  public getIndex(name: string | undefined): ListIndex {
    if (!name || name === 'character') return this.fallbackIndex;

    const index: ListIndexConfig | undefined = this.config.getIndex(name);
    if (!index) return this.fallbackIndex;

    const items: ListIndexItem[] = index.items ?? [];
    const unknownLabel: string = index.unknownLabel ?? 'app.shared.index.unknown';

    switch (index.type) {
      case 'alias-list':
        return new AliasListIndex(items, unknownLabel, this.translocoService);
      case 'bible':
        return new BibleListIndex(items, unknownLabel, this.translocoService);
      case 'character':
      default:
        return this.fallbackIndex;
    }
  }
}
