import { AnnotationSegment, LayoutAnnotation, StructuredAnnotation } from './TextAnnotation';

export type TextViewSegment = StructureSegment | TableSegment | ListSegment | AnnotationSegment;

export interface StructureSegment {
  kind: 'structure';
  annotation: StructuredAnnotation;
  children: TextViewSegment[];
}

export interface TableSegment {
  kind: 'table';
  annotation: LayoutAnnotation;
  rows: TableRowSegment[];
}

export interface TableRowSegment {
  kind: 'table-row';
  annotation: LayoutAnnotation;
  cells: TableCellSegment[];
}

export interface TableCellSegment {
  kind: 'table-cell';
  annotation: LayoutAnnotation;
  children: TextViewSegment[];
}

export interface ListSegment {
  kind: 'list';
  annotation: LayoutAnnotation;
  items: ListItemSegment[];
}

export interface ListItemSegment {
  kind: 'list-item';
  annotation: LayoutAnnotation;
  children: TextViewSegment[];
}
