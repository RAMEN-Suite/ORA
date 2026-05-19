export interface Annotations {
  definitions: Record<string, AnnotationDefinition>;
  renditionClasses?: Record<string, string[]>;

  unknownAnnotation?: UnknownAnnotationStrategy;
  invalidRange?: InvalidRangeStrategy;
}

export interface AnnotationDefinition {
  layer: AnnotationLayer;
  behavior: AnnotationBehavior;
  priority: number;

  classes?: string[];
  classProperty?: string;
  tooltipProperty?: string;
  hrefProperty?: string;

  target?: TargetDefinition;
}

export interface TargetDefinition {
  resource?: string;
  keyProperty?: string;
  route?: string;
  fetchOnOpen?: boolean;
}

export type AnnotationLayer = 'inline' | 'interaction' | 'zero-point' | 'structure';

export type AnnotationBehavior =
  | 'mark'
  | 'tooltip'
  | 'popover'
  | 'fetch-popover'
  | 'external-link'
  | 'line-break'
  | 'page-break'
  | 'gap'
  | 'hidden';

export type UnknownAnnotationStrategy = 'ignore' | 'plain' | 'warn';
export type InvalidRangeStrategy = 'ignore' | 'clamp' | 'warn';
