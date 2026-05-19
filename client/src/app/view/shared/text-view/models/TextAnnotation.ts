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

export interface ResolvedAnnotation extends NormalizedAnnotation {
  definition: AnnotationDefinition;
  classes: string[];
}

export type AnnotationSegment = TextSegment | InlineAnnotationSegment | InteractionAnnotationSegment | ZeroPointAnnotationSegment;

export interface TextSegment {
  kind: 'text';
  text: string;
}

export interface InlineAnnotationSegment {
  kind: 'inline';
  annotation: ResolvedAnnotation;
  children: AnnotationSegment[];
}

export interface InteractionAnnotationSegment {
  kind: 'interaction';
  annotations: ResolvedAnnotation[];
  children: AnnotationSegment[];
}

export interface ZeroPointAnnotationSegment {
  kind: 'zero-point';
  annotation: ResolvedAnnotation;
}
