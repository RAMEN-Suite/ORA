import { QueryPath, QueryStep } from './QueryParser';
import { ActiveFilter } from '../models/Facet';

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

  public static expression(path: QueryPath, prefix: string, params: Record<string, unknown>): string {
    const alias: string = path.steps.length === 0 ? 'r' : `${prefix}${path.steps.length - 1}`;
    const param: string = `${prefix}Field`;

    params[param] = path.field;
    return `${alias}[$${param}]`;
  }

  public static filter(
    query: string[],
    params: Record<string, unknown>,
    path: QueryPath,
    prefix: string,
    filter: ActiveFilter,
  ): void {
    if (filter.kind === 'equal') this.whereEquals(query, params, path, prefix, filter.value);
    if (filter.kind === 'range') this.whereRange(query, params, path, prefix, filter.min, filter.max);
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

  private static whereEquals(
    query: string[],
    params: Record<string, unknown>,
    path: QueryPath,
    prefix: string,
    value: unknown,
  ): void {
    query.push(...this.matches(path, prefix, params));

    const expression: string = this.expression(path, prefix, params);
    const param = `${prefix}Value`;
    query.push(`WHERE ${expression} = $${param}`);

    params[param] = value;
  }

  private static whereRange(
    query: string[],
    params: Record<string, unknown>,
    path: QueryPath,
    prefix: string,
    min?: number,
    max?: number,
  ): void {
    query.push(...this.matches(path, prefix, params));

    const expression: string = this.expression(path, prefix, params);
    const conditions: string[] = [];

    if (min !== undefined) {
      const param = `${prefix}Min`;
      conditions.push(`${expression} >= $${param}`);
      params[param] = min;
    }

    if (max !== undefined) {
      const param = `${prefix}Max`;
      conditions.push(`${expression} <= $${param}`);
      params[param] = max;
    }

    query.push(`WHERE ${conditions.join(' AND ')}`);
  }

  private static alias(context: BuildContext, index: number): string {
    return `${context.prefix}${index}`;
  }

  private static param(context: BuildContext, index: number, name: string): string {
    return `${context.prefix}${index}${name}`;
  }
}
