import { CypherAccessHelper } from "./CypherAccessHelper";
import { AccessPath } from "./parser/AccessParser";
import { ActiveFilter } from "../models/Facet";

interface FilterContext {
  prefix: string;
  expression: string;
  query: string[];
  params: Record<string, unknown>;
  conditions: string[];
}

export class CypherFilterHelper {
  public static filter(
    path: AccessPath,
    query: string[],
    conditions: string[],
    params: Record<string, unknown>,
    prefix: string,
    filter: ActiveFilter,
  ): void {
    query.push(...CypherAccessHelper.matches(path, prefix, params, false));

    const expression: string = CypherAccessHelper.expression(path, prefix, params);
    const context: FilterContext = { query, conditions, prefix, params, expression };

    if (filter.kind === "equal") return this.equals(context, filter.value);
    return this.range(context, filter.min, filter.max);
  }

  private static equals(context: FilterContext, value: unknown): void {
    const param = `${context.prefix}Value`;

    context.conditions.push(`${context.expression} = $${param}`);
    context.params[param] = value;
  }

  private static range(context: FilterContext, min?: number, max?: number): void {
    if (min !== undefined) {
      const param = `${context.prefix}Min`;
      context.conditions.push(`${context.expression} >= $${param}`);
      context.params[param] = min;
    }

    if (max !== undefined) {
      const param = `${context.prefix}Max`;
      context.conditions.push(`${context.expression} <= $${param}`);
      context.params[param] = max;
    }
  }
}
