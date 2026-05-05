import { QueryPath, QueryStep } from './QueryParser';

interface BuildContext {
  prefix: string;
  params: Record<string, unknown>;
}

export class CypherPathHelper {
  public static matches(path: QueryPath, prefix: string, params: Record<string, unknown>): string[] {
    const context: BuildContext = { prefix, params };

    return path.steps.map((step: QueryStep, index: number): string => {
      const previous: string = index === 0 ? 'r' : this.alias(context, index - 1);
      const alias: string = this.alias(context, index);
      return this.matchStep(step, previous, alias, index, context);
    });
  }

  public static expression(path: QueryPath, prefix: string): string {
    const alias: string = path.steps.length === 0 ? 'r' : `${prefix}${path.steps.length - 1}`;
    return `${alias}.${path.field}`;
  }

  private static matchStep(step: QueryStep, previous: string, alias: string, index: number, context: BuildContext): string {
    return step.name === 'annotation'
      ? this.matchAnnotation(step, previous, alias, index, context)
      : this.matchEntity(step, previous, alias, index, context);
  }

  private static matchAnnotation(step: QueryStep, previous: string, alias: string, index: number, context: BuildContext): string {
    if (!step.filter) return `OPTIONAL MATCH (${previous})-[:HAS_ANNOTATION]->(${alias}:Annotation)`;

    const param: string = this.param(context, index, 'AnnotationType');
    context.params[param] = step.filter;

    return `OPTIONAL MATCH (${previous})-[:HAS_ANNOTATION]->(${alias}:Annotation { type: $${param} })`;
  }

  private static matchEntity(step: QueryStep, previous: string, alias: string, index: number, context: BuildContext): string {
    if (!step.filter) return `OPTIONAL MATCH (${previous})-[:REFERS_TO]->(${alias}:Entity)`;

    const param: string = this.param(context, index, 'EntityLabel');
    context.params[param] = step.filter;

    return `OPTIONAL MATCH (${previous})-[:REFERS_TO]->(${alias}:Entity:$($${param}))`;
  }

  private static alias(context: BuildContext, index: number): string {
    return `${context.prefix}${index}`;
  }

  private static param(context: BuildContext, index: number, name: string): string {
    return `${context.prefix}${index}${name}`;
  }
}
