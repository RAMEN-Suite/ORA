import { InlineAnnotation, StructuredAnnotation } from './ResolvedAnnotation';

export type ViewSegment = StructureSegment | TableSegment | ListSegment | AnnotationSegment;
export type AnnotationSegment = TextSegment | InlineRangeSegment | DetachedSegment | ZeroPointSegment | LineBreakSegment;

export interface TextSegment {
  kind: 'text';
  text: string;
}

export interface InlineRangeSegment {
  kind: 'inline-range';
  annotations: InlineAnnotation[];
  children: AnnotationSegment[];
}

export interface DetachedSegment {
  kind: 'detached';
  annotation: InlineAnnotation;
}

export interface ZeroPointSegment {
  kind: 'zero-point';
  annotation: InlineAnnotation;
}

export interface LineBreakSegment {
  kind: 'line-break';
  annotation: InlineAnnotation;
}

export interface StructureSegment {
  kind: 'structure';
  annotation: StructuredAnnotation;
  children: ViewSegment[];
}

export interface TableSegment {
  kind: 'table';
  annotation: StructuredAnnotation;
  rows: TableRowSegment[];
}

export interface TableRowSegment {
  kind: 'table-row';
  annotation: StructuredAnnotation;
  cells: TableCellSegment[];
}

export interface TableCellSegment {
  kind: 'table-cell';
  annotation: StructuredAnnotation;
  children: ViewSegment[];
}

export interface ListSegment {
  kind: 'list';
  annotation: StructuredAnnotation;
  items: ListItemSegment[];
}

export interface ListItemSegment {
  kind: 'list-item';
  annotation: StructuredAnnotation;
  children: ViewSegment[];
}
