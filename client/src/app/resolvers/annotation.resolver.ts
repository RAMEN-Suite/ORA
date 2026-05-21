import {
  AnnotationDefinition,
  AnnotationLayer,
  Annotations,
  InlineDefinition,
  LayoutDefinition,
  StructureDefinition,
  TokenMapping,
  UnknownAnnotationStrategy,
  ZeroPointDefinition,
} from '../models/config/Annotations';
import {
  InlineAnnotation,
  LayoutAnnotation,
  NormalizedAnnotation,
  ResolvedAnnotation,
  ResolvedDefinition,
  ResolvedInlineDefinition,
  ResolvedLayoutDefinition,
  ResolvedStructureDefinition,
  ResolvedZeroPointDefinition,
  StructuredAnnotation,
  ZeroPointAnnotation,
} from '../models/TextAnnotation';

export class AnnotationResolver {
  public constructor(
    private readonly annotations: NormalizedAnnotation[],
    private readonly config: Annotations,
  ) {}

  public resolve(): ResolvedAnnotation[] {
    return this.annotations
      .map((annotation: NormalizedAnnotation): ResolvedAnnotation | undefined => this.resolveAnnotation(annotation))
      .filter((annotation: ResolvedAnnotation | undefined): annotation is ResolvedAnnotation => annotation !== undefined);
  }

  private resolveAnnotation(annotation: NormalizedAnnotation): ResolvedAnnotation | undefined {
    const definition: AnnotationDefinition | undefined = this.config.definitions[annotation.type];
    if (!definition) return this.resolveUnknownAnnotation(annotation);

    switch (definition.layer) {
      case 'inline':
        return this.resolveInline(annotation, definition);
      case 'structure':
        return this.resolveStructure(annotation, definition);
      case 'layout':
        return this.resolveLayout(annotation, definition);
      case 'zero-point':
        return this.resolveZeroPoint(annotation, definition);
      default:
        throw Error('Missing Annotation Definition Layer');
    }
  }

  private resolveInline(annotation: NormalizedAnnotation, definition: InlineDefinition): InlineAnnotation {
    const resolvedDefinition: ResolvedInlineDefinition = {
      ...definition,
      behavior: definition.behavior ?? 'mark',
      priority: definition.priority ?? this.defaultPriority(definition.layer),
      renderAs: definition.renderAs ?? 'span',
    };

    return this.withStyleClasses(annotation, resolvedDefinition);
  }

  private resolveStructure(annotation: NormalizedAnnotation, definition: StructureDefinition): StructuredAnnotation {
    const resolvedDefinition: ResolvedStructureDefinition = {
      ...definition,
      behavior: definition.behavior ?? 'mark',
      priority: definition.priority ?? this.defaultPriority(definition.layer),
      renderAs: definition.renderAs ?? 'div',
    };

    return this.withStyleClasses(annotation, resolvedDefinition);
  }

  private resolveLayout(annotation: NormalizedAnnotation, definition: LayoutDefinition): LayoutAnnotation {
    const resolvedDefinition: ResolvedLayoutDefinition = {
      ...definition,
      behavior: definition.behavior ?? 'mark',
      priority: definition.priority ?? this.defaultPriority(definition.layer),
    };

    return this.withStyleClasses(annotation, resolvedDefinition);
  }

  private resolveZeroPoint(annotation: NormalizedAnnotation, definition: ZeroPointDefinition): ZeroPointAnnotation {
    const resolvedDefinition: ResolvedZeroPointDefinition = {
      ...definition,
      priority: definition.priority ?? this.defaultPriority(definition.layer),
    };

    return this.withStyleClasses(annotation, resolvedDefinition);
  }

  private resolveUnknownAnnotation(annotation: NormalizedAnnotation): InlineAnnotation | undefined {
    if (this.unknownStrategy() === 'ignore') return undefined;

    const definition: ResolvedInlineDefinition = {
      layer: 'inline',
      behavior: 'mark',
      priority: 999,
      renderAs: 'span',
      classes: [],
    };

    return { ...annotation, definition, classes: [] };
  }

  private withStyleClasses<T extends ResolvedDefinition>(
    annotation: NormalizedAnnotation,
    definition: T,
  ): NormalizedAnnotation & { definition: T; classes: string[] } {
    return { ...annotation, definition, classes: this.resolveStyleClasses(annotation, definition) };
  }

  private resolveStyleClasses(annotation: NormalizedAnnotation, definition: ResolvedDefinition): string[] {
    const tokenClasses: string[] = this.resolveTokenClasses(annotation, definition.tokens ?? []);
    return [...new Set([...(definition.classes ?? []), ...tokenClasses])];
  }

  private resolveTokenClasses(annotation: NormalizedAnnotation, tokenMappings: TokenMapping[]): string[] {
    return tokenMappings.flatMap((mapping: TokenMapping): string[] => {
      const value: unknown = annotation.source[mapping.property];
      if (typeof value !== 'string') return [];

      const split: string[] = value.split(/\s+/).filter(Boolean);
      return split.flatMap((token: string): string[] => mapping.mappings[token] ?? []);
    });
  }

  private defaultPriority(layer: AnnotationLayer): number {
    switch (layer) {
      case 'zero-point':
        return 0;
      case 'layout':
        return 5;
      case 'structure':
        return 10;
      case 'inline':
        return 50;
    }
  }

  private unknownStrategy(): UnknownAnnotationStrategy {
    return this.config.unknownAnnotation ?? 'warn';
  }
}
