import { TextAnnotation } from '../models/TextAnnotation';

export class AnnotationUtils {
  public static isTextAnnotation(value: unknown): value is TextAnnotation {
    if (typeof value !== 'object' || value === null) return false;
    const candidate: Record<string, unknown> = value as Record<string, unknown>;

    return (
      typeof candidate['uuid'] === 'string' &&
      typeof candidate['type'] === 'string' &&
      typeof candidate['startIndex'] === 'number' &&
      typeof candidate['endIndex'] === 'number'
    );
  }

  public static toTextAnnotations(values: unknown[]): TextAnnotation[] {
    return values.filter((value: unknown): value is TextAnnotation => this.isTextAnnotation(value));
  }
}
