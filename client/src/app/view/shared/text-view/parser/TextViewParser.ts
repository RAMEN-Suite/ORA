import { AnnotationSegment, ResolvedAnnotation, ResolvedStructureAnnotation } from '../models/TextAnnotation';
import { AnnotationParser } from './AnnotationParser';
import { StructureSegment, TextViewSegment } from '../models/TextViewSegments';

interface TextRange {
  start: number;
  end: number;
}

interface StructureNode {
  annotation: ResolvedStructureAnnotation;
  children: StructureNode[];
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
    const range: TextRange = { start: 0, end: this.text.length };
    const nodes: StructureNode[] = this.rootNodes();
    return this.parseRange(range, nodes);
  }

  private parseRange(range: TextRange, nodes: StructureNode[]): TextViewSegment[] {
    const segments: TextViewSegment[] = [];
    let cursor: number = range.start;

    for (const node of nodes) {
      const structure: ResolvedStructureAnnotation = node.annotation;

      if (structure.start < cursor) continue;
      if (cursor < structure.start) segments.push(...this.parseInlineRange({ start: cursor, end: structure.start }));

      segments.push(this.createStructureSegment(node));
      cursor = structure.end;
    }

    if (cursor < range.end) segments.push(...this.parseInlineRange({ start: cursor, end: range.end }));
    return segments;
  }

  private createStructureSegment(node: StructureNode): StructureSegment {
    const annotation: ResolvedStructureAnnotation = node.annotation;
    const children: TextViewSegment[] = this.parseRange({ start: annotation.start, end: annotation.end }, node.children);
    return { kind: 'structure', annotation, children };
  }

  private rootNodes(): StructureNode[] {
    const roots: StructureNode[] = [];

    for (const structure of this.structures) {
      const node: StructureNode = { annotation: structure, children: [] };
      const parent: StructureNode | undefined = this.findParent(roots, structure);

      if (parent) {
        parent.children.push(node);
        parent.children.sort(this.sortNodes.bind(this));
        continue;
      }

      if (this.isAnyOverlapping(roots, structure)) continue;

      roots.push(node);
      roots.sort(this.sortNodes.bind(this));
    }

    return roots;
  }

  private findParent(nodes: StructureNode[], annotation: ResolvedStructureAnnotation): StructureNode | undefined {
    for (const node of nodes) {
      if (!this.isContaining(node.annotation, annotation)) continue;
      return this.findParent(node.children, annotation) ?? node;
    }

    return undefined;
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

  private sortNodes(a: StructureNode, b: StructureNode): number {
    return this.sortAnnotations(a.annotation, b.annotation);
  }

  private isStructure(annotation: ResolvedAnnotation): annotation is ResolvedStructureAnnotation {
    return annotation.definition.layer === 'structure';
  }

  private isVisible(annotation: ResolvedAnnotation): boolean {
    return annotation.definition.behavior !== 'hidden';
  }

  private isContaining(parent: TextRange, child: TextRange): boolean {
    return parent.start <= child.start && parent.end >= child.end;
  }

  private isAnyOverlapping(nodes: StructureNode[], annotation: ResolvedStructureAnnotation): boolean {
    return nodes.some((node: StructureNode): boolean => this.isOverlapping(node.annotation, annotation));
  }

  private isOverlapping(a: TextRange, b: TextRange): boolean {
    return a.start < b.end && b.start < a.end;
  }
}
