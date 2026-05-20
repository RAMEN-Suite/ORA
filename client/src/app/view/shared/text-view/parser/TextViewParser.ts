import {
  AnnotationSegment,
  ResolvedAnnotation,
  ResolvedLayoutAnnotation,
  ResolvedStructureAnnotation,
} from '../models/TextAnnotation';
import { AnnotationParser } from './AnnotationParser';
import {
  ListItemSegment,
  ListSegment,
  StructureSegment,
  TableCellSegment,
  TableRowSegment,
  TableSegment,
  TextViewSegment,
} from '../models/TextViewSegments';

interface TextRange {
  start: number;
  end: number;
}

interface StructureNode {
  annotation: ResolvedStructureAnnotation;
  children: StructureNode[];
}

type TextViewNode = StructureNode | ResolvedLayoutAnnotation;

export class TextViewParser {
  private readonly structures: ResolvedStructureAnnotation[];
  private readonly layouts: ResolvedLayoutAnnotation[];

  public constructor(
    private readonly text: string,
    private readonly annotations: ResolvedAnnotation[],
  ) {
    const structured: ResolvedStructureAnnotation[] = this.annotations.filter(this.isStructure.bind(this));
    const visibleStructures: ResolvedStructureAnnotation[] = structured.filter(this.isVisible.bind(this));

    const layout: ResolvedLayoutAnnotation[] = this.annotations.filter(this.isLayout.bind(this));
    const visibleLayouts: ResolvedLayoutAnnotation[] = layout.filter(this.isVisible.bind(this));

    this.structures = visibleStructures.sort(this.sortAnnotations.bind(this));
    this.layouts = visibleLayouts.sort(this.sortAnnotations.bind(this));
  }

  public parse(): TextViewSegment[] {
    const range: TextRange = { start: 0, end: this.text.length };
    const nodes: StructureNode[] = this.rootNodes();
    return this.parseRange(range, nodes);
  }

  private parseRange(range: TextRange, structureNodes: StructureNode[]): TextViewSegment[] {
    const nodes: TextViewNode[] = this.nodesInRange(range, structureNodes);
    const segments: TextViewSegment[] = [];
    let cursor: number = range.start;

    for (const node of nodes) {
      const nodeRange: TextRange = this.nodeRange(node);
      if (nodeRange.start < cursor) continue;
      if (cursor < nodeRange.start) segments.push(...this.parseInlineRange({ start: cursor, end: nodeRange.start }));

      const segment: TextViewSegment | undefined = this.createSegment(node);
      if (segment) segments.push(segment);
      cursor = nodeRange.end;
    }

    if (cursor < range.end) segments.push(...this.parseInlineRange({ start: cursor, end: range.end }));
    return segments;
  }

  private createSegment(node: TextViewNode): TextViewSegment | undefined {
    if (this.isStructureNode(node)) return this.createStructureSegment(node);

    switch (node.definition.layoutRole) {
      case 'table':
        return this.createTableSegment(node);
      case 'list':
        return this.createListSegment(node);
      default:
        return undefined;
    }
  }

  private createStructureSegment(node: StructureNode): StructureSegment {
    const annotation: ResolvedStructureAnnotation = node.annotation;
    const children: TextViewSegment[] = this.parseRange({ start: annotation.start, end: annotation.end }, node.children);
    return { kind: 'structure', annotation, children };
  }

  private createTableSegment(annotation: ResolvedLayoutAnnotation): TableSegment {
    const rows: TableRowSegment[] = this.tableRows(annotation).map((row: ResolvedLayoutAnnotation): TableRowSegment => {
      const cells: TableCellSegment[] = this.tableCells(row).map((cell: ResolvedLayoutAnnotation): TableCellSegment => {
        const children: TextViewSegment[] = this.parseRange(
          { start: cell.start, end: cell.end },
          this.structureNodesWithin(cell),
        );

        return { kind: 'table-cell', annotation: cell, children };
      });

      return { kind: 'table-row', annotation: row, cells };
    });

    return { kind: 'table', annotation, rows };
  }

  private createListSegment(annotation: ResolvedLayoutAnnotation): ListSegment {
    const items: ListItemSegment[] = this.listItems(annotation).map((item: ResolvedLayoutAnnotation): ListItemSegment => {
      const children: TextViewSegment[] = this.parseRange({ start: item.start, end: item.end }, this.structureNodesWithin(item));
      return { kind: 'list-item', annotation: item, children };
    });

    return { kind: 'list', annotation, items };
  }

  private nodesInRange(range: TextRange, structureNodes: StructureNode[]): TextViewNode[] {
    const nodes: TextViewNode[] = [
      ...this.layoutRootsWithin(range),
      ...structureNodes.filter((node: StructureNode): boolean => this.isContaining(range, node.annotation)),
    ];

    return nodes.sort(this.sortNodesAndLayouts.bind(this));
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

  private layoutRootsWithin(range: TextRange): ResolvedLayoutAnnotation[] {
    return this.layouts
      .filter((layout: ResolvedLayoutAnnotation): boolean => this.isLayoutRoot(layout))
      .filter((layout: ResolvedLayoutAnnotation): boolean => this.isContaining(range, layout));
  }

  private tableRows(table: ResolvedLayoutAnnotation): ResolvedLayoutAnnotation[] {
    return this.layouts
      .filter((layout: ResolvedLayoutAnnotation): boolean => layout.definition.layoutRole === 'table-row')
      .filter((row: ResolvedLayoutAnnotation): boolean => this.isContaining(table, row))
      .sort(this.sortAnnotations.bind(this));
  }

  private tableCells(row: ResolvedLayoutAnnotation): ResolvedLayoutAnnotation[] {
    return this.layouts
      .filter((layout: ResolvedLayoutAnnotation): boolean => layout.definition.layoutRole === 'table-cell')
      .filter((cell: ResolvedLayoutAnnotation): boolean => this.isContaining(row, cell))
      .sort(this.sortAnnotations.bind(this));
  }

  private listItems(list: ResolvedLayoutAnnotation): ResolvedLayoutAnnotation[] {
    return this.layouts
      .filter((layout: ResolvedLayoutAnnotation): boolean => layout.definition.layoutRole === 'list-item')
      .filter((item: ResolvedLayoutAnnotation): boolean => this.isContaining(list, item))
      .sort(this.sortAnnotations.bind(this));
  }

  private structureNodesWithin(range: TextRange): StructureNode[] {
    return this.rootNodes().filter((node: StructureNode): boolean => this.isContaining(range, node.annotation));
  }

  private nodeRange(node: TextViewNode): TextRange {
    return this.isStructureNode(node) ? node.annotation : node;
  }

  private sortAnnotations(
    a: ResolvedStructureAnnotation | ResolvedLayoutAnnotation,
    b: ResolvedStructureAnnotation | ResolvedLayoutAnnotation,
  ): number {
    if (a.start !== b.start) return a.start - b.start;
    return b.end - a.end;
  }

  private sortNodes(a: StructureNode, b: StructureNode): number {
    return this.sortAnnotations(a.annotation, b.annotation);
  }

  private sortNodesAndLayouts(a: TextViewNode, b: TextViewNode): number {
    return this.sortAnnotations(
      this.nodeRange(a) as ResolvedStructureAnnotation | ResolvedLayoutAnnotation,
      this.nodeRange(b) as ResolvedStructureAnnotation | ResolvedLayoutAnnotation,
    );
  }

  private isStructure(annotation: ResolvedAnnotation): annotation is ResolvedStructureAnnotation {
    return annotation.definition.layer === 'structure';
  }

  private isLayout(annotation: ResolvedAnnotation): annotation is ResolvedLayoutAnnotation {
    return annotation.definition.layer === 'layout';
  }

  private isVisible(annotation: ResolvedAnnotation): boolean {
    return annotation.definition.behavior !== 'hidden';
  }

  private isStructureNode(node: TextViewNode): node is StructureNode {
    return 'annotation' in node;
  }

  private isLayoutRoot(annotation: ResolvedLayoutAnnotation): boolean {
    return annotation.definition.layoutRole === 'table' || annotation.definition.layoutRole === 'list';
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
