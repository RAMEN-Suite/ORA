import { Binding } from '../../../../models/config/Config';
import { BlockValueResolver } from '../../../../resolvers/block-value.resolver';
import { Utils } from '../../../../utils/Utils';
import { AnnotationReference } from '../models/Annotations';

export interface AnnotationReferenceView {
  label: string;
  uuid: string;
  icon?: string;
}

export class AnnotationReferenceResolver {
  public static resolve(reference: AnnotationReference, values: Record<string, unknown>): AnnotationReferenceView[] {
    const labels: string[] = this.resolveBindingValues(reference.label, values);
    const uuids: string[] = this.resolveBindingValues(reference.uuid, values);
    const length: number = Math.max(labels.length, uuids.length);

    const result: AnnotationReferenceView[] = [];

    for (let index: number = 0; index < length; index++) {
      const label: string = labels[index] ?? '';
      const uuid: string = uuids[index] ?? '';

      if (!label.trim() || !uuid.trim()) continue;
      result.push({ label, uuid, icon: reference.icon });
    }

    return result;
  }

  private static resolveBindingValues(binding: Binding, values: Record<string, unknown>): string[] {
    const value: unknown = values[binding.path];

    if (Array.isArray(value)) {
      return value.map((item: unknown): string => Utils.stringify(item) ?? '').filter(Boolean);
    }

    const resolved: string = BlockValueResolver.resolveString(binding, values);
    return resolved ? [resolved] : [];
  }
}
