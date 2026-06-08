import {
  NormalizedTextAnnotation,
  TextAnnotation,
  TextNormalizationIssue,
  TextNormalizationResult,
} from '../../models/annotations/TextAnnotation';
import { Annotations, InvalidRangeStrategy, UnknownAnnotationStrategy } from '../../models/config/Annotations';
import { IssueType } from '../../models/annotations/Normalization';

export class TextNormalizer {
  private readonly issues: TextNormalizationIssue[] = [];

  public constructor(
    private readonly text: string,
    private readonly annotations: TextAnnotation[],
    private readonly config: Annotations,
  ) {}

  public normalize(): TextNormalizationResult {
    const annotations: NormalizedTextAnnotation[] = [];

    for (const annotation of this.annotations) {
      const normalized: NormalizedTextAnnotation | undefined = this.getNormalizedAnnotation(annotation);
      if (normalized !== undefined) annotations.push(normalized);
    }

    return { annotations, issues: this.issues };
  }

  private getNormalizedAnnotation(annotation: TextAnnotation): NormalizedTextAnnotation | undefined {
    if (!this.config.definitions[annotation.type]) {
      this.addIssue('unknown-type', `Unknown annotation type: ${annotation.type}`, annotation);
      if (this.getUnknownStrategy() === 'ignore') return undefined;
    }

    const { startIndex, endIndex } = annotation;
    if (typeof startIndex !== 'number') {
      this.addIssue('missing-range', 'Annotation has no valid startIndex.', annotation);
      return undefined;
    }

    const isZeroPoint: boolean = annotation.isZeroPoint === true || endIndex === undefined;
    if (!isZeroPoint && typeof endIndex !== 'number') {
      this.addIssue('missing-range', 'Annotation has no valid endIndex.', annotation);
      return undefined;
    }

    const start: number = startIndex;
    const end: number = isZeroPoint ? start : endIndex ? endIndex + 1 : 0;
    if (this.isValid(start, end, isZeroPoint)) return this.getAnnotation(annotation, start, end, isZeroPoint);

    this.addIssue('invalid-range', `Invalid annotation range: ${startIndex}-${endIndex}`, annotation);
    if (this.getInvalidRangeStrategy() !== 'clamp') return undefined;

    return this.clampAnnotation(annotation, startIndex, endIndex, isZeroPoint);
  }

  private getAnnotation(annotation: TextAnnotation, start: number, end: number, isZeroPoint: boolean): NormalizedTextAnnotation {
    return { uuid: annotation.uuid, type: annotation.type, start, end, isZeroPoint, source: annotation };
  }

  private getUnknownStrategy(): UnknownAnnotationStrategy {
    return this.config.unknownAnnotation ?? 'warn';
  }

  private getInvalidRangeStrategy(): InvalidRangeStrategy {
    return this.config.invalidRange ?? 'warn';
  }

  private addIssue(type: IssueType, message: string, annotation: TextAnnotation): void {
    this.issues.push({ type, message, annotation });
  }

  private clampAnnotation(
    annotation: TextAnnotation,
    startIndex: number,
    endIndex: number | undefined,
    isZeroPoint: boolean,
  ): NormalizedTextAnnotation | undefined {
    const start: number = this.clampIndex(startIndex);
    if (isZeroPoint) return this.getAnnotation(annotation, start, start, true);
    if (typeof endIndex !== 'number') return undefined;

    const end: number = this.clampIndex(endIndex + 1);
    if (start >= end) return undefined;

    return this.getAnnotation(annotation, start, end, false);
  }

  private clampIndex(value: number): number {
    return Math.min(Math.max(value, 0), this.text.length);
  }

  private isValid(start: number, end: number, isZeroPoint: boolean): boolean {
    if (start < 0 || end < 0) return false;
    if (start > this.text.length || end > this.text.length) return false;
    return isZeroPoint ? start === end : start < end;
  }
}
