import { AnnotationSegment, ResolvedAnnotation, ResolvedStructureAnnotation } from '../models/TextAnnotation';
import { AnnotationParser } from './AnnotationParser';
import { StructureSegment, TextViewSegment } from '../models/TextViewSegments';

interface TextRange {
  start: number;
  end: number;
}

export class TextViewParser {
  private readonly structures: ResolvedStructureAnnotation[];

  public constructor(
    private readonly text: string,
    private readonly annotations: ResolvedAnnotation[],
  ) {
    const structured: ResolvedStructureAnnotation[] = this.annotations.filter(this.isStructure.bind(this));
    const visible: ResolvedStructureAnnotation[] = structured.filter(this.isVisible.bind(this));
    this.structures = visible.sort(this.sortAnnotations.bind(this));
  }

  public parse(): TextViewSegment[] {
    if (this.structures.length === 0) return this.parseInlineRange({ start: 0, end: this.text.length });

    const segments: TextViewSegment[] = [];
    let cursor: number = 0;

    for (const structure of this.structures) {
      if (structure.start < cursor) continue;
      if (cursor < structure.start) segments.push(...this.parseInlineRange({ start: cursor, end: structure.start }));

      segments.push(this.createStructureSegment(structure));
      cursor = structure.end;
    }

    if (cursor < this.text.length) segments.push(...this.parseInlineRange({ start: cursor, end: this.text.length }));
    return segments;
  }

  private createStructureSegment(annotation: ResolvedStructureAnnotation): StructureSegment {
    const children: AnnotationSegment[] = this.parseInlineRange({ start: annotation.start, end: annotation.end });
    return { kind: 'structure', annotation, children };
  }

  private parseInlineRange(range: TextRange): AnnotationSegment[] {
    const text: string = this.text.slice(range.start, range.end);

    const filtered: ResolvedAnnotation[] = this.annotations.filter((annotation: ResolvedAnnotation): boolean => {
      if (annotation.definition.layer === 'structure') return false;
      if (annotation.definition.layer === 'layout') return false;
      return annotation.start >= range.start && annotation.end <= range.end;
    });

    const mapped: ResolvedAnnotation[] = filtered.map((annotation: ResolvedAnnotation): ResolvedAnnotation => {
      return { ...annotation, start: annotation.start - range.start, end: annotation.end - range.start };
    });

    return new AnnotationParser(text, mapped).parse();
  }

  private sortAnnotations(a: ResolvedStructureAnnotation, b: ResolvedStructureAnnotation): number {
    if (a.start !== b.start) return a.start - b.start;
    return b.end - a.end;
  }

  private isStructure(annotation: ResolvedAnnotation): annotation is ResolvedStructureAnnotation {
    return annotation.definition.layer === 'structure';
  }

  private isVisible(annotation: ResolvedAnnotation): boolean {
    return annotation.definition.behavior !== 'hidden';
  }
}
