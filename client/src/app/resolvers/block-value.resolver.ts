import { Utils } from '../utils/Utils';
import { Access, AccessValue } from '../models/config/Access';
import { Node } from '../models/Node';

export class BlockValueResolver {
  public static resolveString(value: AccessValue<string> | undefined, values: Record<string, unknown>): string {
    return this.stringify(this.resolve(value, values));
  }

  public static resolveNode(value: AccessValue<Node> | undefined, values: Record<string, unknown>): Node | undefined {
    const resolved: unknown = this.resolve(value, values);
    return this.isNode(resolved) ? resolved : undefined;
  }

  public static resolveNodes(value: AccessValue<Node | Node[]> | undefined, values: Record<string, unknown>): Node[] {
    const resolved: unknown = this.resolve(value, values);
    if (Array.isArray(resolved)) return resolved.filter((item: unknown): item is Node => this.isNode(item));
    return this.isNode(resolved) ? [resolved] : [];
  }

  private static resolve<T>(value: AccessValue<T> | undefined, values: Record<string, unknown>): unknown {
    if (value === undefined || value === null) return undefined;
    if (this.isAccess(value)) return values[value.path];
    return value;
  }

  private static stringify(value: unknown): string {
    if (Array.isArray(value)) return value.map(String).join('; ');
    if (value === undefined || value === null) return '';
    return Utils.parseString(value) ?? '';
  }

  private static isNode(value: unknown): value is Node {
    if (typeof value !== 'object' || value === null) return false;
    if (!('uuid' in value) || !('_labels' in value)) return false;

    const candidate: { uuid?: unknown; _labels?: unknown } = value;
    return typeof candidate.uuid === 'string' && Array.isArray(candidate._labels);
  }

  private static isAccess<T>(value: AccessValue<T>): value is Access {
    return typeof value === 'object' && value !== null && 'path' in value && typeof value.path === 'string';
  }
}
