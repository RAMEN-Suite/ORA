import { SortField } from "../models/List";
import { Utils } from "../utils/Utils";

export class SortParser {
  public static parseMany(values: string[]): SortField[] {
    return values.map(SortParser.parse).filter((value: SortField | undefined): value is SortField => value !== undefined);
  }

  public static parse(value: string): SortField | undefined {
    const trimmed: string = value.trim();
    if (!trimmed) return undefined;

    const asc: boolean = !trimmed.startsWith("-");
    const field: string | undefined = Utils.parseString(asc ? trimmed : trimmed.slice(1));
    if (!field) return undefined;

    return { field, asc };
  }
}
