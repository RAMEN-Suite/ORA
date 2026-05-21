import { Injectable } from '@angular/core';
import { Binding } from '../models/config/Config';
import { BlockValueResolver } from './block-value.resolver';
import { Utils } from '../utils/Utils';
import { AnnotationPopover, AnnotationReference, AnnotationValue } from '../models/annotations/Annotations';
import { TextAnnotation } from '../models/annotations/TextAnnotation';
import { AnnotationUtils } from '../utils/AnnotationUtils';

export interface AnnotationReferenceView {
  label: string;
  uuid: string;
  icon?: string;
}

export interface DescriptionView {
  text: string;
  annotations: TextAnnotation[];
}

@Injectable({
  providedIn: 'root',
})
export class AnnotationPopoverResolver {
  public resolveDescriptions(popover: AnnotationPopover | undefined, values: Record<string, unknown>): DescriptionView[] {
    return (popover?.description ?? [])
      .map((value: AnnotationValue): DescriptionView | undefined => this.resolveDescription(value, values))
      .filter((value: DescriptionView | undefined): value is DescriptionView => value !== undefined);
  }

  public resolveReferences(popover: AnnotationPopover | undefined, values: Record<string, unknown>): AnnotationReferenceView[] {
    return (popover?.references ?? []).flatMap((reference: AnnotationReference): AnnotationReferenceView[] => {
      return this.resolveReference(reference, values);
    });
  }

  public resolveExternalLink(popover: AnnotationPopover | undefined, values: Record<string, unknown>): string {
    return BlockValueResolver.resolveString(popover?.externalLink, values);
  }

  private resolveDescription(value: AnnotationValue, values: Record<string, unknown>): DescriptionView | undefined {
    const text: string = this.resolveValues(value, values).join(' ');
    if (!text.trim()) return undefined;

    return {
      text,
      annotations: this.resolveDescriptionAnnotations(value, values),
    };
  }

  private resolveDescriptionAnnotations(value: AnnotationValue, values: Record<string, unknown>): TextAnnotation[] {
    if (!value.annotations) return [];

    const raw: unknown = values[value.annotations.path];

    if (Array.isArray(raw)) return AnnotationUtils.toTextAnnotations(raw);
    if (raw && typeof raw === 'object') return AnnotationUtils.toTextAnnotations([raw]);

    return [];
  }

  private resolveReference(reference: AnnotationReference, values: Record<string, unknown>): AnnotationReferenceView[] {
    const labels: string[] = this.resolveValues(reference.label, values);
    const uuids: string[] = this.resolveValues(reference.uuid, values);
    const length: number = Math.max(labels.length, uuids.length);

    const result: AnnotationReferenceView[] = [];

    for (let index = 0; index < length; index++) {
      const label: string = labels[index] ?? '';
      const uuid: string = uuids[index] ?? '';

      if (!label.trim() || !uuid.trim()) continue;
      result.push({ label, uuid, icon: reference.icon });
    }

    return result;
  }

  private resolveValues(binding: Binding | undefined, values: Record<string, unknown>): string[] {
    if (!binding) return [];

    const raw: unknown = values[binding.path];

    if (Array.isArray(raw)) {
      return raw.map((item: unknown): string => Utils.stringify(item) ?? '').filter(Boolean);
    }

    const value: string = BlockValueResolver.resolveString(binding, values);
    return value ? [value] : [];
  }
}
