import { Binding } from './Config';

export interface Annotations {
  definitions: Record<string, AnnotationDefinition>;

  unknownAnnotation?: UnknownAnnotationStrategy;
  invalidRange?: InvalidRangeStrategy;
}

export type AnnotationDefinition = InlineDefinition | StructureDefinition | LayoutDefinition | ZeroPointDefinition;

export interface DefinitionBase {
  priority?: number;
  classes?: string[];
  tokens?: TokenMapping[];
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
  renderAs?: StructureRenderElement;
}

export interface LayoutDefinition extends DefinitionBase {
  layer: 'layout';
  behavior?: LayoutBehavior;
  layoutRole: LayoutRole;
  renderAs: LayoutRenderElement;
}

export interface ZeroPointDefinition extends DefinitionBase {
  layer: 'zero-point';
  behavior: ZeroPointBehavior;
  placement?: AnnotationPlacement;
  label?: AnnotationValue[];
}

export interface TokenMapping {
  property: string;
  mappings: Record<string, string[]>;
}

export interface AnnotationDialog {
  title?: string;
  description?: AnnotationValue[];
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

export type AnnotationLayer = AnnotationDefinition['layer'];

export type InlineBehavior = 'mark' | 'dialog' | 'hidden';
export type StructureBehavior = 'mark' | 'hidden';
export type LayoutBehavior = 'mark' | 'hidden';
export type ZeroPointBehavior = 'line-break' | 'marker' | 'hidden';

export type AnnotationPlacement = 'inline' | 'margin';

export type InlineRenderElement = 'span' | 'abbr' | 'cite' | 'code' | 'em' | 'mark' | 'strong' | 'sub' | 'sup';
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
  | 'h6';
export type LayoutRenderElement = 'ul' | 'ol' | 'li' | 'table' | 'thead' | 'tbody' | 'tr' | 'th' | 'td';
export type LayoutRole = 'list' | 'list-item' | 'table' | 'table-section' | 'table-row' | 'table-cell';

export type UnknownAnnotationStrategy = 'ignore' | 'plain' | 'warn';
export type InvalidRangeStrategy = 'ignore' | 'clamp' | 'warn';
