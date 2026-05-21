import {
  AnnotationSegment,
  InlineAnnotation,
  InlineRangeSegment,
  ResolvedAnnotation,
  TextSegment,
  ZeroPointAnnotation,
  ZeroPointSegment,
} from '../models/annotations/TextAnnotation';

interface TextInterval {
  start: number;
  end: number;
}

export class AnnotationParser {
  private readonly ranges: InlineAnnotation[];
  private readonly zeroPoints: ZeroPointAnnotation[];
  private readonly intervals: TextInterval[];

  public constructor(
    private readonly text: string,
    private readonly annotations: ResolvedAnnotation[],
  ) {
    this.ranges = this.annotations.filter(this.isInlineRange);
    this.zeroPoints = this.annotations.filter(this.isZeroPoint);
    this.intervals = this.createIntervals();
  }

  public parse(): AnnotationSegment[] {
    const segments: AnnotationSegment[] = [];

    for (const interval of this.intervals) {
      segments.push(...this.createZeroPoint(interval.start));
      const segment: AnnotationSegment | undefined = this.createInterval(interval);
      if (segment) segments.push(segment);
    }

    segments.push(...this.createZeroPoint(this.text.length));
    return segments;
  }

  private createIntervals(): TextInterval[] {
    const boundaries: number[] = this.createBoundaries();
    const intervals: TextInterval[] = [];

    for (let index: number = 0; index < boundaries.length - 1; index++) {
      const start: number | undefined = boundaries[index];
      const end: number | undefined = boundaries[index + 1];

      if (start === undefined || end === undefined || start === end) continue;
      intervals.push({ start, end });
    }

    return intervals;
  }

  private createBoundaries(): number[] {
    const boundaries: Set<number> = new Set<number>([0, this.text.length]);

    for (const annotation of this.ranges) {
      boundaries.add(annotation.start);
      boundaries.add(annotation.end);
    }

    for (const annotation of this.zeroPoints) {
      boundaries.add(annotation.start);
    }

    return Array.from(boundaries).sort((a: number, b: number): number => a - b);
  }

  private createZeroPoint(index: number): ZeroPointSegment[] {
    return this.zeroPoints
      .filter((annotation: ZeroPointAnnotation): boolean => annotation.start === index)
      .filter((annotation: ZeroPointAnnotation): boolean => annotation.definition.behavior !== 'hidden')
      .sort((a: ZeroPointAnnotation, b: ZeroPointAnnotation): number => this.sortPriority(a, b))
      .map((annotation: ZeroPointAnnotation): ZeroPointSegment => ({ kind: 'zero-point', annotation }));
  }

  private createInterval(interval: TextInterval): AnnotationSegment | undefined {
    const text: string = this.text.slice(interval.start, interval.end);
    if (text === '') return undefined;

    const annotations: InlineAnnotation[] = this.activeAnnotations(interval);
    const textSegment: TextSegment = { kind: 'text', text };
    if (annotations.length === 0) return textSegment;

    return this.createInlineRange(textSegment, annotations);
  }

  private activeAnnotations(interval: TextInterval): InlineAnnotation[] {
    return this.ranges
      .filter((annotation: InlineAnnotation): boolean => annotation.definition.behavior !== 'hidden')
      .filter((annotation: InlineAnnotation): boolean => this.isContainingInterval(annotation, interval))
      .sort((a: InlineAnnotation, b: InlineAnnotation): number => this.sortPriority(a, b));
  }

  private createInlineRange(child: AnnotationSegment, annotations: InlineAnnotation[]): InlineRangeSegment {
    return { kind: 'inline-range', annotations: [...annotations].sort(this.sortPriority.bind(this)), children: [child] };
  }

  private isInlineRange(annotation: ResolvedAnnotation): annotation is InlineAnnotation {
    return !annotation.isZeroPoint && annotation.definition.layer === 'inline';
  }

  private isZeroPoint(annotation: ResolvedAnnotation): annotation is ZeroPointAnnotation {
    return annotation.isZeroPoint || annotation.definition.layer === 'zero-point';
  }

  private isContainingInterval(annotation: ResolvedAnnotation, interval: TextInterval): boolean {
    return annotation.start <= interval.start && annotation.end >= interval.end;
  }

  private sortPriority(a: ResolvedAnnotation, b: ResolvedAnnotation): number {
    return a.definition.priority - b.definition.priority;
  }
}
