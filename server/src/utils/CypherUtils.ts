import { Integer } from "neo4j-driver";

export class CypherUtils {
  public static parseNumber(value: unknown): number {
    if (typeof value === "number") return value;
    if (this.isInteger(value)) return value.toNumber();
    return 0;
  }

  private static isInteger(value: unknown): value is Integer {
    return typeof value === "object" && value !== null && "toNumber" in value && typeof value.toNumber === "function";
  }
}
