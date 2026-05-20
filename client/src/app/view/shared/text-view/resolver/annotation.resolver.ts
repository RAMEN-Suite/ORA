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
} from '../models/Annotations';
import {
  NormalizedAnnotation,
  ResolvedAnnotation,
  ResolvedInlineAnnotation,
  ResolvedInlineDefinition,
  ResolvedLayoutAnnotation,
  ResolvedLayoutDefinition,
  ResolvedStructureAnnotation,
  ResolvedStructureDefinition,
  ResolvedZeroPointAnnotation,
  ResolvedZeroPointDefinition,
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
    }
  }

  private resolveInline(annotation: NormalizedAnnotation, definition: InlineDefinition): ResolvedInlineAnnotation {
    const resolvedDefinition: ResolvedInlineDefinition = {
      ...definition,
      behavior: definition.behavior ?? 'mark',
      priority: definition.priority ?? this.defaultPriority(definition.layer),
      renderAs: definition.renderAs ?? 'span',
    };

    return { ...annotation, definition: resolvedDefinition, classes: this.resolveClasses(annotation, resolvedDefinition) };
  }

  private resolveStructure(annotation: NormalizedAnnotation, definition: StructureDefinition): ResolvedStructureAnnotation {
    const resolvedDefinition: ResolvedStructureDefinition = {
      ...definition,
      behavior: definition.behavior ?? 'mark',
      priority: definition.priority ?? this.defaultPriority(definition.layer),
      renderAs: definition.renderAs ?? 'div',
    };

    return { ...annotation, definition: resolvedDefinition, classes: this.resolveClasses(annotation, resolvedDefinition) };
  }

  private resolveLayout(annotation: NormalizedAnnotation, definition: LayoutDefinition): ResolvedLayoutAnnotation {
    const resolvedDefinition: ResolvedLayoutDefinition = {
      ...definition,
      behavior: definition.behavior ?? 'mark',
      priority: definition.priority ?? this.defaultPriority(definition.layer),
    };

    return { ...annotation, definition: resolvedDefinition, classes: this.resolveClasses(annotation, resolvedDefinition) };
  }

  private resolveZeroPoint(annotation: NormalizedAnnotation, definition: ZeroPointDefinition): ResolvedZeroPointAnnotation {
    const resolvedDefinition: ResolvedZeroPointDefinition = {
      ...definition,
      priority: definition.priority ?? this.defaultPriority(definition.layer),
    };

    return { ...annotation, definition: resolvedDefinition, classes: this.resolveClasses(annotation, resolvedDefinition) };
  }

  private resolveUnknownAnnotation(annotation: NormalizedAnnotation): ResolvedAnnotation | undefined {
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

  private resolveClasses(
    annotation: NormalizedAnnotation,
    definition: ResolvedInlineDefinition | ResolvedStructureDefinition | ResolvedLayoutDefinition | ResolvedZeroPointDefinition,
  ): string[] {
    const resolvedTokens: string[] = this.resolveTokenClasses(annotation, definition.tokens ?? []);
    return [...new Set<string>([...(definition.classes ?? []), ...resolvedTokens])];
  }

  private resolveTokenClasses(annotation: NormalizedAnnotation, tokenMappings: TokenMapping[]): string[] {
    return tokenMappings.flatMap((tokenMapping: TokenMapping): string[] => {
      const value: unknown = annotation.source[tokenMapping.property];
      if (typeof value !== 'string') return [];

      const filtered: string[] = value.split(/\s+/).filter(Boolean);
      return filtered.flatMap((token: string): string[] => tokenMapping.mappings[token] ?? []);
    });
  }

  private unknownStrategy(): UnknownAnnotationStrategy {
    return this.config.unknownAnnotation ?? 'warn';
  }
}
