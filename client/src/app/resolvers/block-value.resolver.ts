import { Utils } from '../utils/Utils';
import { Node } from '../models/Node';
import { Binding } from '../models/config/Config';

export class BlockValueResolver {
  public static resolveString(value: Binding | undefined, values: Record<string, unknown>): string {
    return this.stringify(this.resolve(value, values));
  }

  public static resolveNode(value: Binding | undefined, values: Record<string, unknown>): Node | undefined {
    const resolved: unknown = this.resolve(value, values);
    return this.isNode(resolved) ? resolved : undefined;
  }

  public static resolveNodes(value: Binding | undefined, values: Record<string, unknown>): Node[] {
    const resolved: unknown = this.resolve(value, values);
    if (Array.isArray(resolved)) return resolved.filter((item: unknown): item is Node => this.isNode(item));
    return this.isNode(resolved) ? [resolved] : [];
  }

  private static resolve(value: Binding | undefined, values: Record<string, unknown>): unknown {
    if (value === undefined) return undefined;
    if (this.isBinding(value)) return values[value.path];
    return value;
  }

  private static stringify(value: unknown): string {
    if (Array.isArray(value)) return value.map(String).join('; ');
    if (value === undefined || value === null) return '';
    return Utils.parseString(value) ?? '';
  }

  private static isNode(value: unknown): value is Node {
    if (typeof value !== 'object' || value === null) return false;
    if (!('_labels' in value)) return false;

    const candidate: { _labels?: unknown } = value;
    return Array.isArray(candidate._labels);
  }

  private static isBinding(value: Binding): value is Binding {
    return typeof value === 'object' && 'path' in value && typeof value.path === 'string';
  }
}
