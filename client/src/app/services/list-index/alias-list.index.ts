import { TranslocoService } from '@jsverse/transloco';
import { ListIndexItem } from '../../models/config/IndexOptions';
import { AliasMatch, AliasOption, ListIndex, UNKNOWN_INDEX_VALUE } from '../../models/ListIndex';
import { SearchableOption } from '../../view/shared/interface/searchable-list/searchable-list.component';

interface AliasEntry {
  alias: string;
  option: AliasOption;
}

export class AliasListIndex implements ListIndex {
  public readonly type: ListIndex['type'] = 'alias-list';

  private readonly entries: AliasEntry[];
  private readonly cache: Map<string, AliasMatch | undefined> = new Map<string, AliasMatch>();

  public constructor(
    items: ListIndexItem[],
    private readonly unknownLabel: string,
    private readonly translocoService: TranslocoService,
  ) {
    this.entries = this.createAliasEntries(items);
  }

  public options(labels: string[]): SearchableOption[] {
    const optionsByValue: Map<string, AliasOption> = new Map<string, AliasOption>();
    let hasUnknown: boolean = false;

    for (const label of labels) {
      const match: AliasMatch | undefined = this.match(label);

      if (!match) {
        hasUnknown = true;
        continue;
      }

      optionsByValue.set(match.option.value, match.option);
    }

    const options: AliasOption[] = Array.from(optionsByValue.values());
    options.sort((a: AliasOption, b: AliasOption): number => a.order - b.order);

    const searchableOptions: SearchableOption[] = this.toSearchableOptions(options);
    if (hasUnknown) searchableOptions.push(this.createUnknownOption());
    return searchableOptions;
  }

  public value(label: string): string {
    const match: AliasMatch | undefined = this.match(label);
    return match?.option.value ?? UNKNOWN_INDEX_VALUE;
  }

  public compare(a: string, b: string): number {
    const left: AliasMatch | undefined = this.match(a);
    const right: AliasMatch | undefined = this.match(b);
    if (!left || !right) return left ? -1 : right ? 1 : a.localeCompare(b);
    return left.option.order - right.option.order || a.localeCompare(b);
  }

  protected match(label: string): AliasMatch | undefined {
    if (this.cache.has(label)) return this.cache.get(label);

    const match: AliasMatch | undefined = this.findMatch(label);
    this.cache.set(label, match);

    return match;
  }

  private createAliasEntries(items: ListIndexItem[]): AliasEntry[] {
    const entries: AliasEntry[] = [];

    for (const [order, item] of items.entries()) {
      const option: AliasOption = {
        label: item.key,
        value: item.key,
        order,
        aliases: item.aliases,
        search: item.aliases,
      };

      entries.push({ alias: this.normalize(item.key), option });

      for (const alias of item.aliases) {
        entries.push({ alias: this.normalize(alias), option });
      }
    }

    entries.sort((a: AliasEntry, b: AliasEntry): number => b.alias.length - a.alias.length);
    return entries;
  }

  private findMatch(label: string): AliasMatch | undefined {
    const trimmed: string = label.trimStart();
    const normalized: string = this.normalize(trimmed);

    for (const entry of this.entries) {
      if (!normalized.startsWith(entry.alias)) continue;
      return { option: entry.option, rest: trimmed.slice(entry.alias.length).trim() };
    }

    return undefined;
  }

  private toSearchableOptions(options: AliasOption[]): SearchableOption[] {
    const searchableOptions: SearchableOption[] = [];

    for (const option of options) {
      searchableOptions.push({
        label: this.translocoService.translate(option.label),
        value: option.value,
        search: option.search,
      });
    }

    return searchableOptions;
  }

  private createUnknownOption(): SearchableOption {
    return { label: this.translocoService.translate(this.unknownLabel), value: UNKNOWN_INDEX_VALUE };
  }

  private normalize(value: string): string {
    return value.trim().toLowerCase();
  }
}
