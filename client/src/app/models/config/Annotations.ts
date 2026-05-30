import { Binding } from './Config';

export interface Annotations {
  definitions: Record<string, AnnotationDefinition>;
  unknownAnnotation?: UnknownAnnotationStrategy;
  invalidRange?: InvalidRangeStrategy;
}

export type AnnotationDefinition = InlineDefinition | StructureDefinition;
export type AnnotationLayer = AnnotationDefinition['layer'];

export interface DefinitionBase {
  priority?: number;
  label?: AnnotationValue[];
  placement?: AnnotationPlacement;

  classes?: string[];
  classMappings?: AnnotationClassMapping[];
}

export interface InlineDefinition extends DefinitionBase {
  layer: 'inline';
  behavior?: InlineBehavior;
  renderAs?: InlineRenderElement;
  dialog?: AnnotationDialog;
}

export interface StructureDefinition extends DefinitionBase {
  layer: 'structure';
  behavior?: StructureBehavior;
  role?: StructureRole;
  renderAs?: StructureRenderElement;
}

export interface AnnotationClassMapping {
  property: string;
  mappings: Record<string, string[]>;
}

export interface AnnotationDialog {
  title?: string;
  description?: AnnotationValue[];

  text?: Binding;
  annotations?: Binding;
  image?: AnnotationValue;

  externalLink?: AnnotationValue;
  references?: AnnotationReference[];
}

export interface AnnotationValue extends Binding {
  display?: string;
  annotations?: Binding;
}

export interface AnnotationReference {
  label: AnnotationValue;
  uuid: Binding;
  icon?: string;
}

export type AnnotationPlacement = 'inline' | 'margin';

export type InlineBehavior = 'mark' | 'dialog' | 'detach' | 'line-break' | 'hidden';
export type InlineRenderElement = 'span' | 'abbr' | 'cite' | 'code' | 'em' | 'mark' | 'strong' | 'sub' | 'sup';

export type StructureBehavior = 'mark' | 'hidden';
export type StructureRole = 'block' | 'list' | 'list-item' | 'table' | 'table-section' | 'table-row' | 'table-cell';
export type StructureRenderElement =
  | 'div'
  | 'p'
  | 'section'
  | 'article'
  | 'header'
  | 'footer'
  | 'address'
  | 'blockquote'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'ul'
  | 'ol'
  | 'li'
  | 'table'
  | 'thead'
  | 'tbody'
  | 'tr'
  | 'th'
  | 'td';

export type UnknownAnnotationStrategy = 'ignore' | 'plain' | 'warn';
export type InvalidRangeStrategy = 'ignore' | 'clamp' | 'warn';
