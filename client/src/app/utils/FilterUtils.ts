import { ActiveFilter } from '../models/Facet';

export class FilterUtils {
  public static parseFilter(this: void, value: string): ActiveFilter {
    const index: number = value.indexOf('~');
    const field: string = value.slice(0, index);
    const rawValue: string = value.slice(index + 1);

    if (rawValue.includes('..')) {
      const [min, max] = rawValue.split('..');
      return { kind: 'range', field, min: min === '' ? undefined : Number(min), max: max === '' ? undefined : Number(max) };
    }

    return { kind: 'equal', field, value: rawValue };
  }

  public static serializeFilter(this: void, filter: ActiveFilter): string {
    if (filter.kind === 'equal') return `${filter.field}~${filter.value}`;
    const min: string = filter.min === undefined ? '' : String(filter.min);
    const max: string = filter.max === undefined ? '' : String(filter.max);
    return `${filter.field}~${min}..${max}`;
  }
}
