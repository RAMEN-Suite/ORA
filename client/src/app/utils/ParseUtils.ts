export class ParseUtils {
  public static parseBoolean(value: unknown): boolean | undefined {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  }

  public static parseNumber(value: unknown): number | undefined {
    if (typeof value !== 'string' && typeof value !== 'number') return undefined;
    const num: number = Number(value);
    return Number.isFinite(num) ? num : undefined;
  }

  public static parseString(value: unknown): string | undefined {
    return typeof value === 'string' ? value : undefined;
  }

  public static parseArray(value: unknown): unknown[] {
    return Array.isArray(value) ? value : [value];
  }

  public static parseStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value.filter((entry: unknown): entry is string => {
      return typeof entry === 'string' && entry.trim().length > 0;
    });
  }
}
