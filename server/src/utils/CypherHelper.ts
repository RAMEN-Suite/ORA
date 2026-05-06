import { ActiveFilter } from '../models/Facet';
import { QueryPath, QueryStep } from './QueryParser';

interface BuildContext {
  prefix: string;
  params: Record<string, unknown>;
  optional: boolean;
}

export class CypherPathHelper {
  public static matches(path: QueryPath, prefix: string, params: Record<string, unknown>, optional = true): string[] {
    const context: BuildContext = { prefix, params, optional };

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
    conditions: string[],
    path: QueryPath,
    prefix: string,
    filter: ActiveFilter,
  ): void {
    query.push(...this.matches(path, prefix, params, false));
    if (filter.kind === 'equal') return this.equals(params, conditions, path, prefix, filter.value);
    if (filter.kind === 'range') return this.range(params, conditions, path, prefix, filter.min, filter.max);
  }

  private static matchStep(step: QueryStep, previous: string, alias: string, index: number, context: BuildContext): string {
    return step.name === 'annotation'
      ? this.matchAnnotation(step, previous, alias, index, context)
      : this.matchEntity(step, previous, alias, index, context);
  }

  private static matchAnnotation(step: QueryStep, previous: string, alias: string, index: number, context: BuildContext): string {
    const clause: string = this.clause(context);
    if (!step.filter) return `${clause} (${previous})-[:HAS_ANNOTATION]->(${alias}:Annotation)`;

    const param: string = this.param(context, index, 'AnnotationType');
    context.params[param] = step.filter;

    return `${clause} (${previous})-[:HAS_ANNOTATION]->(${alias}:Annotation { type: $${param} })`;
  }

  private static matchEntity(step: QueryStep, previous: string, alias: string, index: number, context: BuildContext): string {
    const clause: string = this.clause(context);
    if (!step.filter) return `${clause} (${previous})-[:REFERS_TO]->(${alias}:Entity)`;

    const param: string = this.param(context, index, 'EntityLabel');
    context.params[param] = step.filter;

    return `${clause} (${previous})-[:REFERS_TO]->(${alias}:Entity:$($${param}))`;
  }

  private static equals(
    params: Record<string, unknown>,
    conditions: string[],
    path: QueryPath,
    prefix: string,
    value: unknown,
  ): void {
    const expression: string = this.expression(path, prefix, params);
    const param: string = `${prefix}Value`;

    conditions.push(`${expression} = $${param}`);
    params[param] = value;
  }

  private static range(
    params: Record<string, unknown>,
    conditions: string[],
    path: QueryPath,
    prefix: string,
    min?: number,
    max?: number,
  ): void {
    const expression: string = this.expression(path, prefix, params);

    if (min !== undefined) {
      const param: string = `${prefix}Min`;
      conditions.push(`${expression} >= $${param}`);
      params[param] = min;
    }

    if (max !== undefined) {
      const param: string = `${prefix}Max`;
      conditions.push(`${expression} <= $${param}`);
      params[param] = max;
    }
  }

  private static clause(context: BuildContext): string {
    return context.optional ? 'OPTIONAL MATCH' : 'MATCH';
  }

  private static alias(context: BuildContext, index: number): string {
    return `${context.prefix}${index}`;
  }

  private static param(context: BuildContext, index: number, name: string): string {
    return `${context.prefix}${index}${name}`;
  }
}
