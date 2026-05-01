import removeAccents from 'remove-accents';

interface NormalizeOptions {
  toLower?: boolean;
  toUpper?: boolean;
}

export class StringUtils {
  public static normalize(value: string, options: NormalizeOptions): string {
    const normalizedValue: string = removeAccents(value.trim());
    if (options.toLower) return normalizedValue.toLocaleLowerCase();
    if (options.toUpper) return normalizedValue.toLocaleUpperCase();
    return normalizedValue;
  }

  public static firstCharacter(value: string): string {
    const normalized: string = this.normalize(value, { toUpper: true });
    const firstCharacter: string = normalized.charAt(0);
    return /^\p{L}$/u.test(firstCharacter) ? firstCharacter : '#';
  }
}
