import {
  AnnotationSegment,
  AnnotationSpanSegment,
  ResolvedAnnotation,
  TextSegment,
  ZeroPointAnnotationSegment,
} from '../models/TextAnnotation';

interface TextInterval {
  start: number;
  end: number;
}

export class AnnotationParser {
  private readonly ranges: ResolvedAnnotation[];
  private readonly zeroPoints: ResolvedAnnotation[];
  private readonly intervals: TextInterval[];

  public constructor(
    private readonly text: string,
    private readonly annotations: ResolvedAnnotation[],
  ) {
    this.ranges = this.annotations.filter((annotation: ResolvedAnnotation): boolean => !annotation.isZeroPoint);
    this.zeroPoints = this.annotations.filter((annotation: ResolvedAnnotation): boolean => annotation.isZeroPoint);
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

  private createZeroPoint(index: number): ZeroPointAnnotationSegment[] {
    return this.zeroPoints
      .filter((annotation: ResolvedAnnotation): boolean => annotation.start === index)
      .sort((a: ResolvedAnnotation, b: ResolvedAnnotation): number => this.sortPriority(a, b))
      .map((annotation: ResolvedAnnotation): ZeroPointAnnotationSegment => ({ kind: 'zero-point', annotation }));
  }

  private createInterval(interval: TextInterval): AnnotationSegment | undefined {
    const text: string = this.text.slice(interval.start, interval.end);
    if (text === '') return undefined;

    const annotations: ResolvedAnnotation[] = this.activeAnnotations(interval);
    const textSegment: TextSegment = { kind: 'text', text };

    if (annotations.length === 0) return textSegment;
    return this.createSpan(textSegment, annotations);
  }

  private activeAnnotations(interval: TextInterval): ResolvedAnnotation[] {
    return this.ranges
      .filter((annotation: ResolvedAnnotation): boolean => annotation.definition.layer === 'inline')
      .filter((annotation: ResolvedAnnotation): boolean => this.isIntervalContaining(annotation, interval))
      .sort(this.sortPriority);
  }

  private createSpan(child: AnnotationSegment, annotations: ResolvedAnnotation[]): AnnotationSpanSegment {
    return { kind: 'span', annotations: [...annotations].sort(this.sortPriority), children: [child] };
  }

  private isIntervalContaining(annotation: ResolvedAnnotation, interval: TextInterval): boolean {
    return annotation.start <= interval.start && annotation.end >= interval.end;
  }

  private sortPriority(a: ResolvedAnnotation, b: ResolvedAnnotation): number {
    return a.definition.priority - b.definition.priority;
  }
}
