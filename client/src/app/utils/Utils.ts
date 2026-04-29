import removeAccents from 'remove-accents';

interface NormalizeOptions {
  toLower?: boolean;
  toUpper?: boolean;
}

export class Utils {
  public static normalize(value: string, options: NormalizeOptions): string {
    const normalizedValue: string = removeAccents(value.trim());
    if (options.toLower) return normalizedValue.toLocaleLowerCase();
    if (options.toUpper) return normalizedValue.toLocaleUpperCase();
    return normalizedValue;
  }
}
