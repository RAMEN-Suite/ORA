import { Binding } from '../../../../models/config/Config';

export interface Annotations {
  definitions: Record<string, AnnotationDefinition>;

  unknownAnnotation?: UnknownAnnotationStrategy;
  invalidRange?: InvalidRangeStrategy;
}

export interface AnnotationDefinition {
  layer: AnnotationLayer;
  behavior?: AnnotationBehavior;
  priority?: number;

  classes?: string[];
  tokens?: AnnotationTokenMapping[];
  placement?: AnnotationPlacement;

  popover?: AnnotationPopover;
}

export interface AnnotationTokenMapping {
  property: string;
  mappings: Record<string, string[]>;
}

export interface AnnotationPopover {
  title?: string;
  description?: AnnotationValue[];
  externalLink?: AnnotationValue;
  references?: AnnotationReference[];
}

export interface AnnotationValue extends Binding {
  display?: string;
  translationKey?: string;
}

export interface AnnotationReference {
  label: AnnotationValue;
  uuid: Binding;
  icon?: string;
}

export type AnnotationLayer = 'inline' | 'structure' | 'zero-point';
export type AnnotationBehavior = 'mark' | 'popover' | 'line-break' | 'page-break' | 'gap' | 'hidden';
export type AnnotationPlacement = 'inline' | 'margin';

export type UnknownAnnotationStrategy = 'ignore' | 'plain' | 'warn';
export type InvalidRangeStrategy = 'ignore' | 'clamp' | 'warn';
