import { Utils } from '../utils/Utils';
import { Binding, Value } from '../models/Config';

export class BlockValueResolver {
  public static resolve<T>(value: Value<T> | undefined, values: Record<string, unknown>): unknown {
    if (value === undefined || value === null) return undefined;
    if (this.isBinding(value)) return values[value.path] ?? value.fallback;
    return value;
  }

  public static stringify(value: unknown): string {
    if (Array.isArray(value)) return value.map(String).join(', ');
    if (value === undefined || value === null) return '';
    return Utils.parseString(value) ?? '';
  }

  public static resolveString(value: Value<string> | undefined, values: Record<string, unknown>): string {
    return this.stringify(this.resolve(value, values));
  }

  private static isBinding<T>(value: Value<T>): value is Binding<T> {
    return typeof value === 'object' && value !== null && 'path' in value && typeof value.path === 'string';
  }
}
