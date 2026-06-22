import {
  AnnotationPlacement,
  InlineBehavior,
  InlineDefinition,
  InlineRenderElement,
  StructureBehavior,
  StructureDefinition,
  StructureRenderElement,
  StructureRole,
} from '../config/Annotations';
import { NormalizedTextAnnotation } from './TextAnnotation';

export type ResolvedAnnotation = InlineAnnotation | StructuredAnnotation;

interface ResolvedAnnotationBase extends NormalizedTextAnnotation {
  classes: string[];
}

export interface InlineAnnotation extends ResolvedAnnotationBase {
  definition: ResolvedInline;
}

export interface StructuredAnnotation extends ResolvedAnnotationBase {
  definition: ResolvedStructure;
}

export type ResolvedDefinition = ResolvedInline | ResolvedStructure;

export interface ResolvedInline extends Omit<InlineDefinition, 'behavior' | 'priority' | 'renderAs' | 'placement'> {
  behavior: InlineBehavior;
  priority: number;
  renderAs: InlineRenderElement;
  placement: AnnotationPlacement;
}

export interface ResolvedStructure extends Omit<
  StructureDefinition,
  'behavior' | 'priority' | 'renderAs' | 'role' | 'placement'
> {
  behavior: StructureBehavior;
  priority: number;
  renderAs: StructureRenderElement;
  role: StructureRole;
  placement: AnnotationPlacement;
}
