import { ListIndex } from '../../models/ListIndex';
import { SearchableOption } from '../../view/shared/interfaces/searchable-list/searchable-list.component';
import { Utils } from '../../utils/Utils';

export class CharacterListIndex implements ListIndex {
  public readonly type: ListIndex['type'] = 'character';

  public options(labels: string[]): SearchableOption[] {
    const values: Set<string> = new Set<string>();

    for (const label of labels) {
      const value: string = Utils.firstCharacter(label);
      if (value) values.add(value);
    }

    return [...values]
      .sort((a: string, b: string): number => a.localeCompare(b))
      .map((value: string): SearchableOption => ({ label: value, value }));
  }

  public value(label: string): string {
    return Utils.firstCharacter(label);
  }

  public compare(a: string, b: string): number {
    return a.localeCompare(b);
  }
}
