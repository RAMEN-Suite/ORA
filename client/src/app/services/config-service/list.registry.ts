import { FilterOption, ListOption, ListView, Option, OptionGroup, Property } from '../../models/config/ListViews';
import { Utils } from '../../utils/Utils';

export class ListRegistry {
  constructor(private readonly list: ListView) {}

  public options(): ListOption[] {
    return this.list.options;
  }

  public option(value: string, options: Option[] = this.options()): Option | undefined {
    return options.find((option: Option): boolean => option.value === value);
  }

  public properties(option: ListOption): Property[] {
    const global: Property[] = this.list.properties ?? [];
    const local: Property[] = option.properties ?? [];
    return Utils.mergeBy([...global, ...local], (property: Property): string => property.name);
  }

  public activeOption(): Option {
    const option: Option | undefined = this.list.options.find((option: Option): boolean => option.value === this.list.initial);
    if (!option) throw new Error(`Missing initial option for ListView: ${this.list.initial}`);
    return option;
  }

  public activeGroupOption(group: OptionGroup | undefined): Option | undefined {
    if (!group) return undefined;
    return group.options.find((option: Option): boolean => option.value === group.initial) ?? group.options[0];
  }

  public filterPaths(node: ListOption): string[] {
    const filters: FilterOption[] = node.filters ?? [];
    return filters.map((filter: FilterOption): string => filter.value);
  }
}
