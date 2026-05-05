export class Utils {
  public static async sleep(seconds: number): Promise<void> {
    await new Promise((resolve: (value: unknown) => void) => setTimeout(resolve, seconds * 1000));
  }

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
}
