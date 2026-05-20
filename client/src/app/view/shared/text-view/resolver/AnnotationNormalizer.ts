import { Annotations } from '../models/Annotations';
import { NormalizedAnnotation, TextAnnotation } from '../models/TextAnnotation';

export interface NormalizationResult {
  annotations: NormalizedAnnotation[];
  issues: NormalizationIssue[];
}

export interface NormalizationIssue {
  type: IssueType;
  message: string;
  annotation: TextAnnotation;
}

interface AnnotationRange {
  startIndex: number;
  endIndex: number;
}

export type IssueType = 'missing-range' | 'invalid-range' | 'unknown-type';

export class AnnotationNormalizer {
  private readonly issues: NormalizationIssue[] = [];

  public constructor(
    private readonly text: string,
    private readonly annotations: TextAnnotation[],
    private readonly config: Annotations,
  ) {}

  public normalize(): NormalizationResult {
    const annotations: NormalizedAnnotation[] = [];

    for (const annotation of this.annotations) {
      const normalized: NormalizedAnnotation | undefined = this.normalizeAnnotation(annotation);
      if (normalized) annotations.push(normalized);
    }

    return { annotations, issues: this.issues };
  }

  private normalizeAnnotation(annotation: TextAnnotation): NormalizedAnnotation | undefined {
    if (!this.hasDefinition(annotation)) this.handleUnknownType(annotation);
    const range: AnnotationRange | undefined = this.getAnnotationRange(annotation);

    if (!range) {
      this.addIssue('missing-range', 'Annotation has no valid startIndex or endIndex.', annotation);
      return undefined;
    }

    const isZeroPoint: boolean = this.isZeroPoint(annotation, range);
    const start: number = range.startIndex;
    const end: number = this.normalizeEndIndex(range, isZeroPoint);

    if (!this.isValidRange(start, end, isZeroPoint)) return this.handleInvalidRange(annotation, range, isZeroPoint);
    return this.createAnnotation(annotation, start, end, isZeroPoint);
  }

  private normalizeEndIndex(range: AnnotationRange, isZeroPoint: boolean): number {
    if (isZeroPoint) return range.startIndex;
    return range.endIndex + 1;
  }

  private getAnnotationRange(annotation: TextAnnotation): AnnotationRange | undefined {
    const { startIndex, endIndex } = annotation;
    if (typeof startIndex !== 'number') return undefined;
    if (typeof endIndex !== 'number') return undefined;
    return { startIndex, endIndex };
  }

  private hasDefinition(annotation: TextAnnotation): boolean {
    return this.config.definitions[annotation.type] !== undefined;
  }

  private isZeroPoint(annotation: TextAnnotation, range: AnnotationRange): boolean {
    return annotation.isZeroPoint === true || range.startIndex === range.endIndex;
  }

  private isValidRange(start: number, end: number, isZeroPoint: boolean): boolean {
    if (start < 0) return false;
    if (end < 0) return false;
    if (start > this.text.length) return false;
    if (end > this.text.length) return false;
    if (isZeroPoint) return start === end;
    return start < end;
  }

  private handleUnknownType(annotation: TextAnnotation): void {
    if (this.config.unknownAnnotation === 'ignore') return;
    this.addIssue('unknown-type', `Unknown annotation type: ${annotation.type}`, annotation);
  }

  private handleInvalidRange(
    annotation: TextAnnotation,
    range: AnnotationRange,
    isZeroPoint: boolean,
  ): NormalizedAnnotation | undefined {
    const startIndex: string = String(range.startIndex);
    const endIndex: string = String(range.endIndex);
    this.addIssue('invalid-range', `Invalid annotation range: ${startIndex}-${endIndex}`, annotation);
    if (this.config.invalidRange !== 'clamp') return undefined;

    const start: number = Math.min(Math.max(range.startIndex, 0), this.text.length);
    if (isZeroPoint) return this.createAnnotation(annotation, start, start, true);

    const end: number = Math.min(Math.max(range.endIndex + 1, 0), this.text.length);
    if (start >= end) return undefined;

    return this.createAnnotation(annotation, start, end, false);
  }

  private createAnnotation(annotation: TextAnnotation, start: number, end: number, isZeroPoint: boolean): NormalizedAnnotation {
    return { uuid: annotation.uuid, type: annotation.type, start, end, isZeroPoint, source: annotation };
  }

  private addIssue(type: IssueType, message: string, annotation: TextAnnotation): void {
    this.issues.push({ type, message, annotation });
  }
}
