import { Annotation } from '../../../../models/Node';
import { AnnotationDefinition } from './Annotations';

export interface TextAnnotation extends Annotation {
  startIndex?: number;
  endIndex?: number;
  isZeroPoint?: boolean;

  text?: string;

  [key: string]: unknown;
}

export interface NormalizedAnnotation {
  uuid: string;
  type: string;

  start: number;
  end: number;
  isZeroPoint: boolean;

  source: TextAnnotation;
}

export type ResolvedAnnotationDefinition = AnnotationDefinition & {
  behavior: NonNullable<AnnotationDefinition['behavior']>;
  priority: number;
};

export interface ResolvedAnnotation extends NormalizedAnnotation {
  definition: ResolvedAnnotationDefinition;
  classes: string[];
}

export type AnnotationSegment = TextSegment | AnnotationSpanSegment | ZeroPointAnnotationSegment;

export interface TextSegment {
  kind: 'text';
  text: string;
}

export interface AnnotationSpanSegment {
  kind: 'span';
  annotations: ResolvedAnnotation[];
  children: AnnotationSegment[];
}

export interface ZeroPointAnnotationSegment {
  kind: 'zero-point';
  annotation: ResolvedAnnotation;
}
