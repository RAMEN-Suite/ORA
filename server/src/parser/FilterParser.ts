import { REGEXP } from "../constants/REGEXP";
import { Filter } from "../models/Filter";

/**
 * Parses serialized query filters.
 *
 * Supported formats:
 * - equal: "<field>~<value>"
 * - range: "<field>~<min>..<max>"
 * - open range: "<field>~<min>.." or "<field>~..<max>"
 *
 * Examples:
 * - "label~Hamburg"
 * - "date~1600..1700"
 * - "date~1600.."
 * - "date~..1700"
 */

export class FilterParser {
  private static readonly SEPARATOR: "~" = "~" as const;
  private static readonly RANGE: ".." = ".." as const;

  public static parse(value: string): Filter {
    const [field, rawValue] = this.parseFilterParts(value);
    if (rawValue.includes(this.RANGE)) return this.parseRange(value, field, rawValue);
    return { kind: "equal", field, value: rawValue };
  }

  public static parseMany(values: string[]): Filter[] {
    return values.map((value: string): Filter => this.parse(value));
  }

  private static parseFilterParts(value: string): [field: string, rawValue: string] {
    const index: number = value.indexOf(this.SEPARATOR);

    if (index <= 0 || index === value.length - 1) {
      throw new Error(`Invalid filter: ${value}`);
    }

    const field: string = value.slice(0, index);
    const rawValue: string = value.slice(index + 1);

    if (!REGEXP.QUERY.test(field)) {
      throw new Error(`Invalid filter field: ${field}`);
    }

    return [field, rawValue];
  }

  private static parseRange(value: string, field: string, rawValue: string): Filter {
    const [rawMin, rawMax] = this.parseRangeParts(value, rawValue);
    const min: number | undefined = this.parseRangeBoundary(value, rawMin);
    const max: number | undefined = this.parseRangeBoundary(value, rawMax);
    return { kind: "range", field, min, max };
  }

  private static parseRangeParts(value: string, rawValue: string): [min: string | undefined, max: string | undefined] {
    const parts: string[] = rawValue.split(this.RANGE);
    if (parts.length !== 2) throw new Error(`Invalid range filter: ${value}`);

    const [min, max] = parts;
    if (min === "" && max === "") throw new Error(`Invalid range filter: ${value}`);

    return [min, max];
  }

  private static parseRangeBoundary(value: string, raw: string | undefined): number | undefined {
    if (raw === "" || raw === undefined) return undefined;
    const parsed: number = Number(raw);

    if (!Number.isFinite(parsed)) throw new Error(`Invalid range filter: ${value}`);
    return parsed;
  }
}
