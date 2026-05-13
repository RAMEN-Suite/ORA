import { AccessPath, AccessStep } from './parser/AccessParser';

interface BuildContext {
  prefix: string;
  params: Record<string, unknown>;
}

interface MatchContext {
  previous: string;
  alias: string;
  index: number;
  optional: boolean;
  build: BuildContext;
}

export class CypherAccessHelper {
  public static matches(path: AccessPath, prefix: string, params: Record<string, unknown>, optional = true): string[] {
    const build: BuildContext = { prefix, params };

    return path.steps.map((step: AccessStep, index: number): string => {
      const previous: string = index === 0 ? 'r' : `${prefix}${index - 1}`;
      const alias: string = `${prefix}${index}`;
      const context: MatchContext = { previous, alias, index, build, optional };

      return this.matchStep(step, context);
    });
  }

  public static expression(path: AccessPath, prefix: string, params: Record<string, unknown>): string {
    const alias: string = path.steps.length === 0 ? 'r' : `${prefix}${path.steps.length - 1}`;
    const param: string = `${prefix}Field`;

    params[param] = path.field;
    return `${alias}[$${param}]`;
  }

  private static matchStep(step: AccessStep, context: MatchContext): string {
    if (step.name === 'annotation') return this.matchAnnotation(step, context);
    if (step.name === 'entity') return this.matchEntity(step, context);
    if (step.name === 'collection') return this.matchCollection(step, context);
    if (step.name === 'content') return this.matchContent(step, context);
    if (step.name === 'refers') return this.matchRefers(step, context);
    return this.assertNever(step.name);
  }

  private static matchAnnotation(step: AccessStep, context: MatchContext): string {
    const { build, alias, index, previous } = context;
    const clause: string = context.optional ? 'OPTIONAL MATCH' : 'MATCH';

    const node: string = step.filter
      ? `(${alias}:Annotation { type: $${this.setParam(build, index, 'AnnotationType', step.filter)} })`
      : `(${alias}:Annotation)`;

    return `${clause} (${previous})-[:HAS_ANNOTATION]->${node}`;
  }

  private static matchEntity(step: AccessStep, context: MatchContext): string {
    const { build, alias, index, previous } = context;
    const clause: string = context.optional ? 'OPTIONAL MATCH' : 'MATCH';

    const node: string = step.filter
      ? `(${alias}:Entity:$($${this.setParam(build, index, 'EntityLabel', step.filter)}))`
      : `(${alias}:Entity)`;

    return `${clause} (${previous})-[:REFERS_TO]->${node}`;
  }

  private static matchCollection(step: AccessStep, context: MatchContext): string {
    const { build, alias, index, previous } = context;
    const clause: string = context.optional ? 'OPTIONAL MATCH' : 'MATCH';

    const node: string = step.filter
      ? `(${alias}:Collection:$($${this.setParam(build, index, 'CollectionLabel', step.filter)}))`
      : `(${alias}:Collection)`;

    return `${clause} (${previous})-[:PART_OF]->${node}`;
  }

  private static matchContent(step: AccessStep, context: MatchContext): string {
    const { build, alias, index, previous } = context;
    const clause: string = context.optional ? 'OPTIONAL MATCH' : 'MATCH';

    const node: string = step.filter
      ? `(${alias}:Content:$($${this.setParam(build, index, 'ContentLabel', step.filter)}))`
      : `(${alias}:Content)`;

    return `${clause} (${previous})<-[:PART_OF]-${node}`;
  }

  private static matchRefers(step: AccessStep, context: MatchContext): string {
    const { build, alias, index, previous } = context;
    const clause: string = context.optional ? 'OPTIONAL MATCH' : 'MATCH';

    const node: string = step.filter ? `(${alias}:$($${this.setParam(build, index, 'RefersLabel', step.filter)}))` : `(${alias})`;

    return `${clause} (${previous})-[:REFERS_TO]->${node}`;
  }

  private static setParam(context: BuildContext, index: number, name: string, value: unknown): string {
    const param: string = `${context.prefix}${index}${name}`;
    context.params[param] = value;
    return param;
  }

  private static assertNever(value: never): never {
    throw new Error(`Unsupported access step: ${value}`);
  }
}
