import { Binding } from '../models/config/Config';
import { BlockValueResolver } from './block-value.resolver';
import { Utils } from '../utils/Utils';

export class AnnotationBindingResolver {
  public static resolveValues(binding: Binding | undefined, values: Record<string, unknown>): string[] {
    const value: unknown = binding ? values[binding.path] : undefined;
    if (Array.isArray(value)) return value.map((item: unknown): string => Utils.stringify(item) ?? '').filter(Boolean);

    const resolved: string = BlockValueResolver.resolveString(binding, values);
    return resolved ? [resolved] : [];
  }
}
