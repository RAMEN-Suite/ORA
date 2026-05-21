import { Annotation } from './Node';
import { InlineDefinition, LayoutDefinition, StructureDefinition, ZeroPointDefinition } from './config/Annotations';

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

export type ResolvedDefinition =
  | ResolvedInlineDefinition
  | ResolvedStructureDefinition
  | ResolvedLayoutDefinition
  | ResolvedZeroPointDefinition;

export type ResolvedInlineDefinition = Omit<InlineDefinition, 'behavior' | 'priority' | 'renderAs'> & {
  behavior: NonNullable<InlineDefinition['behavior']>;
  priority: number;
  renderAs: NonNullable<InlineDefinition['renderAs']>;
};

export type ResolvedStructureDefinition = Omit<StructureDefinition, 'behavior' | 'priority' | 'renderAs'> & {
  behavior: NonNullable<StructureDefinition['behavior']>;
  priority: number;
  renderAs: NonNullable<StructureDefinition['renderAs']>;
};

export type ResolvedLayoutDefinition = Omit<LayoutDefinition, 'behavior' | 'priority'> & {
  behavior: NonNullable<LayoutDefinition['behavior']>;
  priority: number;
};

export type ResolvedZeroPointDefinition = Omit<ZeroPointDefinition, 'priority'> & {
  priority: number;
};

export type ResolvedAnnotation = InlineAnnotation | StructuredAnnotation | LayoutAnnotation | ZeroPointAnnotation;

export interface InlineAnnotation extends NormalizedAnnotation {
  definition: ResolvedInlineDefinition;
  classes: string[];
}

export interface StructuredAnnotation extends NormalizedAnnotation {
  definition: ResolvedStructureDefinition;
  classes: string[];
}

export interface LayoutAnnotation extends NormalizedAnnotation {
  definition: ResolvedLayoutDefinition;
  classes: string[];
}

export interface ZeroPointAnnotation extends NormalizedAnnotation {
  definition: ResolvedZeroPointDefinition;
  classes: string[];
}

export type AnnotationSegment = TextSegment | InlineRangeSegment | ZeroPointSegment;

export interface TextSegment {
  kind: 'text';
  text: string;
}

export interface InlineRangeSegment {
  kind: 'inline-range';
  annotations: InlineAnnotation[];
  children: AnnotationSegment[];
}

export interface ZeroPointSegment {
  kind: 'zero-point';
  annotation: ZeroPointAnnotation;
}
