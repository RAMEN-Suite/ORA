import { ActiveFilter } from '../models/Facet';
import { REGEXP } from '../constants/REGEXP';

export class FilterParser {
  private static readonly SEPARATOR: '~' = '~';
  private static readonly RANGE: '..' = '..';

  public static parse(value: string): ActiveFilter {
    const index: number = value.indexOf(this.SEPARATOR);
    if (index <= 0 || index === value.length - 1) throw new Error(`Invalid filter: ${value}`);

    const field: string = value.slice(0, index);
    const rawValue: string = value.slice(index + 1);
    if (!REGEXP.QUERY.test(field)) throw new Error(`Invalid filter field: ${field}`);

    if (!rawValue.includes(this.RANGE)) return { kind: 'equal', field, value: rawValue };

    const [min, max] = rawValue.split(this.RANGE);
    const parsedMin: number | undefined = min === '' ? undefined : Number(min);
    const parsedMax: number | undefined = max === '' ? undefined : Number(max);

    if (parsedMin === undefined && parsedMax === undefined) throw new Error(`Invalid range filter: ${value}`);
    return { kind: 'range', field, min: parsedMin, max: parsedMax };
  }

  public static parseMany(values: string[]): ActiveFilter[] {
    return values.map((value: string): ActiveFilter => this.parse(value));
  }
}
