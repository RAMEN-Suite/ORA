import { AnnotationSegment, ResolvedLayoutAnnotation, ResolvedStructureAnnotation } from './TextAnnotation';

export type TextViewSegment = StructureSegment | TableSegment | ListSegment | AnnotationSegment;

export interface StructureSegment {
  kind: 'structure';
  annotation: ResolvedStructureAnnotation;
  children: TextViewSegment[];
}

export interface TableSegment {
  kind: 'table';
  annotation: ResolvedLayoutAnnotation;
  rows: TableRowSegment[];
}

export interface TableRowSegment {
  kind: 'table-row';
  annotation: ResolvedLayoutAnnotation;
  cells: TableCellSegment[];
}

export interface TableCellSegment {
  kind: 'table-cell';
  annotation: ResolvedLayoutAnnotation;
  children: TextViewSegment[];
}

export interface ListSegment {
  kind: 'list';
  annotation: ResolvedLayoutAnnotation;
  items: ListItemSegment[];
}

export interface ListItemSegment {
  kind: 'list-item';
  annotation: ResolvedLayoutAnnotation;
  children: TextViewSegment[];
}
