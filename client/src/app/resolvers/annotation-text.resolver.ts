import {
  AnnotationDefinition,
  AnnotationLayer,
  Annotations,
  InlineDefinition,
  StructureDefinition,
  UnknownAnnotationStrategy,
} from '../models/config/Annotations';
import { NormalizedTextAnnotation } from '../models/annotations/TextAnnotation';
import {
  InlineAnnotation,
  ResolvedAnnotation,
  ResolvedDefinition,
  ResolvedInline,
  ResolvedStructure,
  StructuredAnnotation,
} from '../models/annotations/ResolvedAnnotation';

export class TextAnnotationResolver {
  public constructor(
    private readonly annotations: NormalizedTextAnnotation[],
    private readonly config: Annotations,
  ) {}

  public resolve(): ResolvedAnnotation[] {
    const annotations: ResolvedAnnotation[] = [];

    for (const annotation of this.annotations) {
      const resolved: ResolvedAnnotation | undefined = this.resolveAnnotation(annotation);
      if (resolved) annotations.push(resolved);
    }

    return annotations;
  }

  private resolveAnnotation(annotation: NormalizedTextAnnotation): ResolvedAnnotation | undefined {
    const definition: AnnotationDefinition | undefined = this.config.definitions[annotation.type];
    if (!definition) return this.resolveUnknown(annotation);

    if (definition.layer === 'inline') return this.resolveInline(annotation, definition);
    return this.resolveStructure(annotation, definition);
  }

  private resolveInline(annotation: NormalizedTextAnnotation, definition: InlineDefinition): InlineAnnotation {
    const resolved: ResolvedInline = {
      ...definition,
      behavior: definition.behavior ?? 'mark',
      priority: definition.priority ?? this.getDefaultPriority(definition.layer),
      renderAs: definition.renderAs ?? 'span',
      placement: definition.placement ?? 'inline',
    };

    return { ...annotation, definition: resolved, classes: this.getStyleClasses(annotation, resolved) };
  }

  private resolveStructure(annotation: NormalizedTextAnnotation, definition: StructureDefinition): StructuredAnnotation {
    const resolved: ResolvedStructure = {
      ...definition,
      behavior: definition.behavior ?? 'mark',
      priority: definition.priority ?? this.getDefaultPriority(definition.layer),
      renderAs: definition.renderAs ?? 'div',
      role: definition.role ?? 'block',
      placement: definition.placement ?? 'inline',
    };

    return { ...annotation, definition: resolved, classes: this.getStyleClasses(annotation, resolved) };
  }

  private resolveUnknown(annotation: NormalizedTextAnnotation): InlineAnnotation | undefined {
    if (this.getUnknownStrategy() === 'ignore') return undefined;

    const definition: ResolvedInline = {
      layer: 'inline',
      behavior: 'mark',
      priority: 999,
      renderAs: 'span',
      placement: 'inline',
      classes: [],
    };

    return { ...annotation, definition, classes: [] };
  }

  private getStyleClasses(annotation: NormalizedTextAnnotation, definition: ResolvedDefinition): string[] {
    const classes: string[] = [...(definition.classes ?? [])];

    for (const mapping of definition.classMappings ?? []) {
      const value: unknown = annotation.source[mapping.property];
      if (typeof value !== 'string') continue;

      const tokens: string[] = value.split(/\s+/).filter(Boolean);
      classes.push(...tokens.flatMap((token: string): string[] => mapping.mappings[token] ?? []));
    }

    return [...new Set(classes)];
  }

  private getDefaultPriority(layer: AnnotationLayer): number {
    switch (layer) {
      case 'structure':
        return 10;
      case 'inline':
        return 50;
    }
  }

  private getUnknownStrategy(): UnknownAnnotationStrategy {
    return this.config.unknownAnnotation ?? 'warn';
  }
}
