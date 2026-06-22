import { TextInterval } from '../../models/annotations/TextAnnotation';
import { AnnotationSegment } from '../../models/annotations/ViewSegments';
import { InlineAnnotation, ResolvedAnnotation } from '../../models/annotations/ResolvedAnnotation';

export class InlineParser {
  private readonly ranges: InlineAnnotation[] = [];
  private readonly zeroPoints: InlineAnnotation[] = [];

  public constructor(
    private readonly text: string,
    annotations: ResolvedAnnotation[],
  ) {
    for (const annotation of annotations) {
      if (!this.isInline(annotation)) continue;
      if (annotation.isZeroPoint) this.zeroPoints.push(annotation);
      else this.ranges.push(annotation);
    }

    this.ranges.sort(this.compare);
    this.zeroPoints.sort(this.compare);
  }

  public parse(): AnnotationSegment[] {
    const segments: AnnotationSegment[] = [];
    const renderedDetached: Set<string> = new Set<string>();
    const intervals: TextInterval[] = this.getIntervals();

    for (const interval of intervals) {
      segments.push(...this.getZeroPointSegments(interval.start));

      const segment: AnnotationSegment | undefined = this.getIntervalSegment(interval, renderedDetached);
      if (segment) segments.push(segment);
    }

    segments.push(...this.getZeroPointSegments(this.text.length));
    return segments;
  }

  private getIntervals(): TextInterval[] {
    const boundaries: number[] = this.getBoundaries();
    const intervals: TextInterval[] = [];

    for (let index: number = 0; index < boundaries.length - 1; index++) {
      const start: number | undefined = boundaries[index];
      const end: number | undefined = boundaries[index + 1];

      if (start !== undefined && end !== undefined && start !== end) intervals.push({ start, end });
    }

    return intervals;
  }

  private getIntervalSegment(interval: TextInterval, renderedDetached: Set<string>): AnnotationSegment | undefined {
    if (this.hasHiddenRange(interval)) return undefined;

    const detached: InlineAnnotation | undefined = this.getDetachedAnnotation(interval);
    if (detached) {
      if (renderedDetached.has(detached.uuid)) return undefined;
      renderedDetached.add(detached.uuid);
      return { kind: 'detached', annotation: detached };
    }

    const text: string = this.text.slice(interval.start, interval.end);
    if (!text) return undefined;

    const annotations: InlineAnnotation[] = this.getInlineAnnotations(interval);
    if (annotations.length === 0) return { kind: 'text', text };

    return { kind: 'inline-range', annotations, children: [{ kind: 'text', text }] };
  }

  private getDetachedAnnotation(interval: TextInterval): InlineAnnotation | undefined {
    return this.ranges.find((a: InlineAnnotation): boolean => a.definition.behavior === 'detach' && a.start === interval.start);
  }

  private getInlineAnnotations(interval: TextInterval): InlineAnnotation[] {
    const annotations: InlineAnnotation[] = [];

    for (const annotation of this.ranges) {
      if (annotation.definition.behavior === 'hidden') continue;
      if (annotation.definition.behavior === 'detach') continue;
      if (annotation.definition.behavior === 'line-break') continue;
      if (this.contains(annotation, interval)) annotations.push(annotation);
    }

    return annotations;
  }

  private getZeroPointSegments(index: number): AnnotationSegment[] {
    const segments: AnnotationSegment[] = [];

    for (const annotation of this.zeroPoints) {
      if (annotation.start !== index) continue;

      switch (annotation.definition.behavior) {
        case 'line-break':
          segments.push({ kind: 'line-break', annotation });
          break;

        case 'detach':
          segments.push({ kind: 'zero-point', annotation });
          break;
      }
    }

    return segments;
  }

  private getBoundaries(): number[] {
    const boundaries: Set<number> = new Set<number>([0, this.text.length]);

    for (const annotation of this.ranges) {
      boundaries.add(annotation.start);
      boundaries.add(annotation.end);
    }

    for (const annotation of this.zeroPoints) {
      boundaries.add(annotation.start);
    }

    return [...boundaries].sort((a: number, b: number): number => a - b);
  }

  private contains(parent: TextInterval, child: TextInterval): boolean {
    return parent.start <= child.start && parent.end >= child.end;
  }

  private compare(a: InlineAnnotation, b: InlineAnnotation): number {
    return a.definition.priority - b.definition.priority;
  }

  private hasHiddenRange(interval: TextInterval): boolean {
    return this.ranges.some((a: InlineAnnotation): boolean => a.definition.behavior === 'hidden' && this.contains(a, interval));
  }

  private isInline(annotation: ResolvedAnnotation): annotation is InlineAnnotation {
    return annotation.definition.layer === 'inline';
  }
}
