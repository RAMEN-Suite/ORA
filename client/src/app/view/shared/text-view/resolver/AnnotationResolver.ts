import { AnnotationDefinition, Annotations } from '../models/Annotations';
import { NormalizedAnnotation, ResolvedAnnotation } from '../models/TextAnnotation';

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

    const classes: string[] = this.resolveClasses(annotation, definition);
    return { ...annotation, definition, classes };
  }

  private resolveUnknownAnnotation(annotation: NormalizedAnnotation): ResolvedAnnotation | undefined {
    if (this.config.unknownAnnotation === 'ignore') return undefined;

    const definition: AnnotationDefinition = { layer: 'inline', behavior: 'mark', priority: 999, classes: [] };
    return { ...annotation, definition, classes: [] };
  }

  private resolveClasses(annotation: NormalizedAnnotation, definition: AnnotationDefinition): string[] {
    const definitionClasses: string[] = definition.classes ?? [];
    const propertyClasses: string[] = this.resolvePropertyClasses(annotation, definition);
    return Array.from(new Set<string>([...definitionClasses, ...propertyClasses]));
  }

  private resolvePropertyClasses(annotation: NormalizedAnnotation, definition: AnnotationDefinition): string[] {
    if (!definition.classProperty) return [];
    const value: unknown = annotation.source[definition.classProperty];
    if (typeof value !== 'string') return [];

    const tokens: string[] = value.split(/\s+/).filter(Boolean);
    const classes: string[] = [];

    for (const token of tokens) {
      const mapped: string[] | undefined = this.config.classMappings?.[token];
      if (mapped) classes.push(...mapped);
    }

    return classes;
  }
}
