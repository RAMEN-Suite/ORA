import { Utils } from '../utils/Utils';
import { Node } from '../models/Node';
import { Binding } from '../models/config/Config';

export class BlockValueResolver {
  public static resolveString(value: Binding | undefined, values: Record<string, unknown>): string {
    return Utils.stringify(this.resolveRaw(value, values)) ?? '';
  }

  public static resolveStrings(value: Binding | undefined, values: Record<string, unknown>): string[] {
    const resolved: unknown = this.resolveRaw(value, values);

    if (Array.isArray(resolved)) {
      return resolved.map((item: unknown): string => Utils.stringify(item) ?? '').filter(Boolean);
    }

    const stringValue: string = Utils.stringify(resolved) ?? '';
    return stringValue ? [stringValue] : [];
  }

  public static resolveNode(value: Binding | undefined, values: Record<string, unknown>): Node | undefined {
    const resolved: unknown = this.resolveRaw(value, values);
    return this.isNode(resolved) ? resolved : undefined;
  }

  public static resolveNodes(value: Binding | undefined, values: Record<string, unknown>): Node[] {
    const resolved: unknown = this.resolveRaw(value, values);
    if (Array.isArray(resolved)) return resolved.filter((item: unknown): item is Node => this.isNode(item));
    return this.isNode(resolved) ? [resolved] : [];
  }

  public static resolveRaw(value: Binding | undefined, values: Record<string, unknown>): unknown {
    if (value === undefined) return undefined;
    return values[value.path];
  }

  private static isNode(value: unknown): value is Node {
    if (typeof value !== 'object' || value === null) return false;
    if (!('_labels' in value)) return false;

    const candidate: { _labels?: unknown } = value;
    return Array.isArray(candidate._labels);
  }
}
