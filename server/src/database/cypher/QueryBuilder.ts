import neo4j from "neo4j-driver";
import { QueryAccessBuilder } from "./QueryAccessBuilder";
import { AccessParser, AccessPath } from "../../parser/AccessParser";
import { Resource } from "../../models/RAMEN";
import { Filter } from "../../models/Filter";

export interface BuiltQuery {
  cypher: string;
  params: Record<string, unknown>;
}

export class QueryBuilder {
  private readonly query: string[] = [];
  private readonly params: Record<string, unknown> = {};
  private readonly conditions: string[] = [];

  public constructor(resource: Resource, label?: string) {
    this.match(resource, label);
  }

  public parameters(): Record<string, unknown> {
    return this.params;
  }

  public search(field: string | undefined, search: string | undefined): this {
    if (!search) return this;

    const prefix = "search";
    const path: AccessPath = AccessParser.parse(field ?? "label");
    this.query.push(...QueryAccessBuilder.matches(path, prefix, this.params));

    const property: string = QueryAccessBuilder.expression(path, prefix, this.params);
    this.conditions.push(`apoc.text.clean(${property}) CONTAINS apoc.text.clean($search)`);
    this.params.search = search;

    return this;
  }

  public filters(filters: Filter[]): this {
    for (const [index, filter] of filters.entries()) {
      const prefix: string = `filter${index}`;
      const path: AccessPath = AccessParser.parse(filter.field);

      this.query.push(...QueryAccessBuilder.matches(path, prefix, this.params, false));
      const expression: string = QueryAccessBuilder.expression(path, prefix, this.params);

      if (filter.kind === "equal") {
        this.equal(prefix, expression, filter.value);
        continue;
      }

      this.range(prefix, expression, filter.min, filter.max);
    }

    return this;
  }

  public where(): this {
    if (this.conditions.length > 0) this.query.push(`WHERE ${this.conditions.join(" AND ")}`);
    return this;
  }

  public sort(field: string | undefined, asc: boolean | undefined): this {
    if (!field) return this;

    const prefix = "sort";
    const path: AccessPath = AccessParser.parse(field);
    const direction: string = asc === false ? "DESC" : "ASC";

    this.query.push(...QueryAccessBuilder.matches(path, prefix, this.params));
    this.query.push(`ORDER BY ${QueryAccessBuilder.expression(path, prefix, this.params)} ${direction}`);

    return this;
  }

  public skip(skip: number | undefined): this {
    if (!skip || skip <= 0) return this;

    this.query.push("SKIP $skip");
    this.params.skip = neo4j.int(skip);

    return this;
  }

  public limit(limit: number | undefined): this {
    if (!limit || limit <= 0) return this;

    this.query.push("LIMIT $limit");
    this.params.limit = neo4j.int(limit);

    return this;
  }

  public append(...statements: string[]): this {
    this.query.push(...statements);
    return this;
  }

  public build(): BuiltQuery {
    return { cypher: this.query.join(" "), params: this.params };
  }

  private match(resource: Resource, label?: string): void {
    this.params.resource = resource;

    if (!label) {
      this.query.push("MATCH (r:$($resource))");
      return;
    }

    this.params.label = label;
    this.query.push("MATCH (r:$($resource):$($label))");
  }

  private equal(prefix: string, expression: string, value: unknown): void {
    const param: string = `${prefix}Value`;
    this.conditions.push(`${expression} = $${param}`);
    this.params[param] = value;
  }

  private range(prefix: string, expression: string, min?: number, max?: number): void {
    if (min !== undefined) {
      const param: string = `${prefix}Min`;
      this.conditions.push(`${expression} >= $${param}`);
      this.params[param] = min;
    }

    if (max !== undefined) {
      const param: string = `${prefix}Max`;
      this.conditions.push(`${expression} <= $${param}`);
      this.params[param] = max;
    }
  }
}
