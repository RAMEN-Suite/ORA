import { AnnotationSegment, ResolvedStructureAnnotation } from './TextAnnotation';

export type TextViewSegment = StructureSegment | AnnotationSegment;

export interface StructureSegment {
  kind: 'structure';
  annotation: ResolvedStructureAnnotation;
  children: AnnotationSegment[];
}
