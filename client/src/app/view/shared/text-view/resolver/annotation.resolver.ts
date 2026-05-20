import {
  AnnotationBehavior,
  AnnotationDefinition,
  AnnotationLayer,
  Annotations,
  UnknownAnnotationStrategy,
} from '../models/Annotations';
import { NormalizedAnnotation, ResolvedAnnotation, ResolvedAnnotationDefinition } from '../models/TextAnnotation';

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

    const resolvedDefinition: ResolvedAnnotationDefinition = this.resolveDefinition(definition);
    const classes: string[] = this.resolveClasses(annotation, resolvedDefinition);

    return { ...annotation, definition: resolvedDefinition, classes };
  }

  private resolveUnknownAnnotation(annotation: NormalizedAnnotation): ResolvedAnnotation | undefined {
    if (this.unknownStrategy() === 'ignore') return undefined;
    const definition: ResolvedAnnotationDefinition = { layer: 'inline', behavior: 'mark', priority: 999, classes: [] };
    return { ...annotation, definition, classes: [] };
  }

  private resolveDefinition(definition: AnnotationDefinition): ResolvedAnnotationDefinition {
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

  private resolveClasses(annotation: NormalizedAnnotation, definition: ResolvedAnnotationDefinition): string[] {
    const definitionClasses: string[] = definition.classes ?? [];
    const propertyClasses: string[] = this.resolvePropertyClasses(annotation, definition);
    return Array.from(new Set<string>([...definitionClasses, ...propertyClasses]));
  }

  private resolvePropertyClasses(annotation: NormalizedAnnotation, definition: ResolvedAnnotationDefinition): string[] {
    if (!definition.classProperty) return [];

    const value: unknown = annotation.source[definition.classProperty];
    if (typeof value !== 'string') return [];

    const classes: string[] = [];
    for (const token of value.split(/\s+/).filter(Boolean)) {
      const mapped: string[] | undefined = this.config.classMappings?.[token];
      if (mapped) classes.push(...mapped);
    }

    return classes;
  }

  private unknownStrategy(): UnknownAnnotationStrategy {
    return this.config.unknownAnnotation ?? 'warn';
  }
}
