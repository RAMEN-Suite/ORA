import {
  AnnotationSegment,
  InlineAnnotationSegment,
  InteractionAnnotationSegment,
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

      if (start === undefined || end === undefined) continue;
      if (start === end) continue;
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
    const annotations: ResolvedAnnotation[] = this.zeroPointsAt(index);
    return annotations.map((annotation: ResolvedAnnotation): ZeroPointAnnotationSegment => {
      return { kind: 'zero-point', annotation };
    });
  }

  private zeroPointsAt(index: number): ResolvedAnnotation[] {
    return this.zeroPoints
      .filter((annotation: ResolvedAnnotation): boolean => annotation.start === index)
      .sort((a: ResolvedAnnotation, b: ResolvedAnnotation): number => this.sortByPriority(a, b));
  }

  private createInterval(interval: TextInterval): AnnotationSegment | undefined {
    const text: string = this.text.slice(interval.start, interval.end);
    if (text === '') return undefined;

    const active: ResolvedAnnotation[] = this.activeAnnotations(interval);
    return this.createSegment(text, active);
  }

  private activeAnnotations(interval: TextInterval): ResolvedAnnotation[] {
    return this.ranges
      .filter((annotation: ResolvedAnnotation): boolean => this.containsInterval(annotation, interval))
      .sort((a: ResolvedAnnotation, b: ResolvedAnnotation): number => this.sortByPriority(a, b));
  }

  private containsInterval(annotation: ResolvedAnnotation, interval: TextInterval): boolean {
    return annotation.start <= interval.start && annotation.end >= interval.end;
  }

  private createSegment(text: string, annotations: ResolvedAnnotation[]): AnnotationSegment {
    const textSegment: TextSegment = { kind: 'text', text };

    const inline: ResolvedAnnotation[] = this.annotationsByLayer(annotations, 'inline');
    const interaction: ResolvedAnnotation[] = this.annotationsByLayer(annotations, 'interaction');
    const content: AnnotationSegment = this.wrapInline(textSegment, inline);

    if (interaction.length === 0) return content;
    return this.wrapInteraction(content, interaction);
  }

  private annotationsByLayer(annotations: ResolvedAnnotation[], layer: string): ResolvedAnnotation[] {
    return annotations.filter((annotation: ResolvedAnnotation): boolean => annotation.definition.layer === layer);
  }

  private wrapInline(segment: AnnotationSegment, annotations: ResolvedAnnotation[]): AnnotationSegment {
    let result: AnnotationSegment = segment;
    const sorted: ResolvedAnnotation[] = this.sortByPriorityDescending(annotations);

    for (const annotation of sorted) result = this.createInline(annotation, result);
    return result;
  }

  private wrapInteraction(segment: AnnotationSegment, annotations: ResolvedAnnotation[]): InteractionAnnotationSegment {
    return { kind: 'interaction', annotations: this.sortByPriorityAscending(annotations), children: [segment] };
  }

  private createInline(annotation: ResolvedAnnotation, child: AnnotationSegment): InlineAnnotationSegment {
    return { kind: 'inline', annotation, children: [child] };
  }

  private sortByPriorityAscending(annotations: ResolvedAnnotation[]): ResolvedAnnotation[] {
    return [...annotations].sort((a: ResolvedAnnotation, b: ResolvedAnnotation): number => this.sortByPriority(a, b));
  }

  private sortByPriorityDescending(annotations: ResolvedAnnotation[]): ResolvedAnnotation[] {
    return [...annotations].sort((a: ResolvedAnnotation, b: ResolvedAnnotation): number => this.sortByPriority(b, a));
  }

  private sortByPriority(a: ResolvedAnnotation, b: ResolvedAnnotation): number {
    return a.definition.priority - b.definition.priority;
  }
}
