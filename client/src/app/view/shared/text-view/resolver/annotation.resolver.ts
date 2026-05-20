import {
  AnnotationBehavior,
  AnnotationDefinition,
  AnnotationLayer,
  Annotations,
  AnnotationTokenMapping,
  UnknownAnnotationStrategy,
} from '../models/Annotations';
import { NormalizedAnnotation, ResolvedAnnotation, ResolvedDefinition } from '../models/TextAnnotation';

export class AnnotationResolver {
  public constructor(
    private readonly annotations: NormalizedAnnotation[],
    private readonly config: Annotations,
  ) {}

  public resolve(): ResolvedAnnotation[] {
    const resolved: ResolvedAnnotation[] = [];

    for (const annotation of this.annotations) {
      const result: ResolvedAnnotation | undefined = this.resolveAnnotation(annotation);
      if (result) resolved.push(result);
    }

    return resolved;
  }

  private resolveAnnotation(annotation: NormalizedAnnotation): ResolvedAnnotation | undefined {
    const definition: AnnotationDefinition | undefined = this.config.definitions[annotation.type];
    if (!definition) return this.resolveUnknownAnnotation(annotation);

    const resolvedDefinition: ResolvedDefinition = this.resolveDefinition(definition);
    const classes: string[] = this.resolveClasses(annotation, resolvedDefinition);

    return { ...annotation, definition: resolvedDefinition, classes };
  }

  private resolveUnknownAnnotation(annotation: NormalizedAnnotation): ResolvedAnnotation | undefined {
    if (this.unknownStrategy() === 'ignore') return undefined;
    const definition: ResolvedDefinition = { layer: 'inline', behavior: 'mark', priority: 999, classes: [] };
    return { ...annotation, definition, classes: [] };
  }

  private resolveDefinition(definition: AnnotationDefinition): ResolvedDefinition {
    return {
      ...definition,
      behavior: definition.behavior ?? this.defaultBehavior(definition.layer),
      priority: definition.priority ?? this.defaultPriority(definition.layer),
    };
  }

  private defaultBehavior(layer: AnnotationLayer): AnnotationBehavior {
    switch (layer) {
      case 'inline':
      case 'structure':
        return 'mark';
      case 'zero-point':
        return 'hidden';
    }
  }

  private defaultPriority(layer: AnnotationLayer): number {
    switch (layer) {
      case 'zero-point':
        return 0;
      case 'structure':
        return 10;
      case 'inline':
        return 50;
    }
  }

  private resolveClasses(annotation: NormalizedAnnotation, definition: ResolvedDefinition): string[] {
    const definitionClasses: string[] = definition.classes ?? [];
    const tokenClasses: string[] = this.resolveTokenClasses(annotation, definition);
    return Array.from(new Set<string>([...definitionClasses, ...tokenClasses]));
  }

  private resolveTokenClasses(annotation: NormalizedAnnotation, definition: ResolvedDefinition): string[] {
    return (definition.tokens ?? []).flatMap((tokens: AnnotationTokenMapping): string[] => {
      const value: unknown = annotation.source[tokens.property];
      if (typeof value !== 'string') return [];

      const filtered: string[] = value.split(/\s+/).filter(Boolean);
      return filtered.flatMap((token: string): string[] => tokens.mappings[token] ?? []);
    });
  }

  private unknownStrategy(): UnknownAnnotationStrategy {
    return this.config.unknownAnnotation ?? 'warn';
  }
}
