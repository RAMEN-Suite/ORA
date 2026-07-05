import { AccessPath, AccessStep } from '../../parser/AccessParser';

export class AccessPattern {
  public constructor(
    private readonly path: AccessPath,
    private readonly alias: string,
    private readonly prefix: string,
    private readonly parameters: Record<string, unknown>,
    private readonly isOptional: boolean = true,
  ) {}

  public match(): string[] {
    return this.path.steps.map((step: AccessStep, index: number): string => this.matchStep(step, index));
  }

  public expression(): string {
    const alias: string = this.path.steps.length === 0 ? this.alias : this.getIndexedAlias(this.path.steps.length - 1);
    if (this.path.field === '*') return `${alias} {.*, _labels: labels(${alias})}`;

    const param: string = `${this.prefix}Field`;
    this.parameters[param] = this.path.field;

    return `${alias}[$${param}]`;
  }

  private matchStep(step: AccessStep, index: number): string {
    const previous: string = index === 0 ? this.alias : this.getIndexedAlias(index - 1);
    const alias: string = this.getIndexedAlias(index);
    const clause: string = this.isOptional ? 'OPTIONAL MATCH' : 'MATCH';

    if (step.name === 'annotation') return this.matchAnnotation(step, clause, previous, alias, index);
    if (step.name === 'refers') return this.matchRefers(step, clause, previous, alias, index);
    if (step.name === 'parents') return this.matchParents(step, clause, previous, alias, index);
    if (step.name === 'children') return this.matchChildren(step, clause, previous, alias, index);

    return this.assertNever(step.name);
  }

  private matchAnnotation(step: AccessStep, clause: string, previous: string, alias: string, index: number): string {
    const node: string = step.filter
      ? `(${alias}:Annotation { type: $${this.setParam(index, 'AnnotationType', step.filter)} })`
      : `(${alias}:Annotation)`;

    return `${clause} (${previous})-[:HAS_ANNOTATION]->${node}`;
  }

  private matchRefers(step: AccessStep, clause: string, previous: string, alias: string, index: number): string {
    const node: string = step.filter ? `(${alias}:$($${this.setParam(index, 'RefersLabel', step.filter)}))` : `(${alias})`;

    return `${clause} (${previous})-[:REFERS_TO]->${node}`;
  }

  private matchParents(step: AccessStep, clause: string, previous: string, alias: string, index: number): string {
    const node: string = step.filter ? `(${alias}:$($${this.setParam(index, 'ParentLabel', step.filter)}))` : `(${alias})`;

    return `${clause} (${previous})-[:PART_OF]->${node}`;
  }

  private matchChildren(step: AccessStep, clause: string, previous: string, alias: string, index: number): string {
    const node: string = step.filter ? `(${alias}:$($${this.setParam(index, 'ChildLabel', step.filter)}))` : `(${alias})`;

    return `${clause} (${previous})<-[:PART_OF]-${node}`;
  }

  private getIndexedAlias(index: number): string {
    return `${this.prefix}${index}`;
  }

  private setParam(index: number, name: string, value: unknown): string {
    const param: string = `${this.prefix}${index}${name}`;
    this.parameters[param] = value;
    return param;
  }

  private assertNever(value: never): never {
    throw new Error(`Unsupported access step: ${value}`);
  }
}
