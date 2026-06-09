import { BlockValueResolver } from './block-value.resolver';
import { AnnotationDialog, AnnotationReference, AnnotationValue } from '../models/config/Annotations';
import { TextAnnotation } from '../models/annotations/TextAnnotation';
import { AnnotationUtils } from '../utils/AnnotationUtils';

export interface DialogReference {
  label: string;
  uuid: string;
  icon?: string;
}

export interface DialogDescription {
  text: string;
  annotations: TextAnnotation[];
}

export class AnnotationDialogResolver {
  public static resolveDescriptions(dialog: AnnotationDialog | undefined, values: Record<string, unknown>): DialogDescription[] {
    const descriptions: AnnotationValue[] = dialog?.description ?? [];

    return descriptions
      .map((value: AnnotationValue): DialogDescription | undefined => this.resolveDescription(value, values))
      .filter((value: DialogDescription | undefined): value is DialogDescription => value !== undefined);
  }

  public static resolveReferences(dialog: AnnotationDialog | undefined, values: Record<string, unknown>): DialogReference[] {
    const references: AnnotationReference[] = dialog?.references ?? [];
    return references.flatMap((reference: AnnotationReference): DialogReference[] => this.resolveReference(reference, values));
  }

  public static resolveExternalLink(dialog: AnnotationDialog | undefined, values: Record<string, unknown>): string[] {
    return BlockValueResolver.resolveStrings(dialog?.externalLink, values);
  }

  private static resolveDescription(value: AnnotationValue, values: Record<string, unknown>): DialogDescription | undefined {
    const text: string = BlockValueResolver.resolveStrings(value, values).join(', ');
    if (!text.trim()) return undefined;
    return { text, annotations: this.resolveDescriptionAnnotations(value, values) };
  }

  private static resolveDescriptionAnnotations(value: AnnotationValue, values: Record<string, unknown>): TextAnnotation[] {
    if (!value.annotations) return [];
    const raw: unknown = BlockValueResolver.resolveRaw(value.annotations, values);

    if (Array.isArray(raw)) return AnnotationUtils.toTextAnnotations(raw);
    if (raw && typeof raw === 'object') return AnnotationUtils.toTextAnnotations([raw]);

    return [];
  }

  private static resolveReference(reference: AnnotationReference, values: Record<string, unknown>): DialogReference[] {
    const labels: string[] = BlockValueResolver.resolveStrings(reference.label, values);
    const uuids: string[] = BlockValueResolver.resolveStrings(reference.uuid, values);
    const length: number = Math.max(labels.length, uuids.length);

    const result: DialogReference[] = [];

    for (let index = 0; index < length; index++) {
      const label: string = labels[index] ?? '';
      const uuid: string = uuids[index] ?? '';

      if (!label.trim() || !uuid.trim()) continue;
      result.push({ label, uuid, icon: reference.icon });
    }

    return result;
  }
}
