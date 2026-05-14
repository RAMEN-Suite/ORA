export type StepName = "annotation" | "entity" | "collection" | "content" | "refers";

export interface AccessStep {
  name: StepName;
  filter?: string;
}

export interface AccessPath {
  steps: AccessStep[];
  field: string;
}

interface Segment {
  name: string;
  filter?: string;
}

/**
 * Parses RAMEN access paths.
 *
 * Supported format:
 * - direct field: "<field>"
 * - nested access: "<step>[<filter>].<step>[<filter>].<field>"
 *
 * Supported steps:
 * - annotation[type]
 * - entity[label]
 * - collection[label]
 * - content[label]
 * - refers[label]
 *
 * Examples:
 * - "label"
 * - "annotation[sender].entity[Person].label"
 * - "content[Text].text"
 * - "annotation[summary].refers[Text].text"
 */

export class AccessParser {
  private static readonly SEGMENT_EXP: RegExp = /^(?<name>[A-Za-z_]\w*)(?:\[(?<filter>[^\]]+)])?$/;
  private static readonly STEP_NAMES: ReadonlySet<string> = new Set(["annotation", "entity", "collection", "content", "refers"]);

  public static parse(value: string): AccessPath {
    if (!value.trim()) throw new Error("Invalid query path: empty value");
    const segments: Segment[] = value.split(".").map((segment: string): Segment => this.parseSegment(segment));

    const accessor: Segment | undefined = segments.pop();
    if (!accessor || accessor.filter) throw new Error(`Invalid query path: ${value}`);

    const steps: AccessStep[] = segments.map((segment: Segment): AccessStep => {
      if (this.isAccessStep(segment)) return segment;
      throw new Error(`Invalid query step: ${segment.name}`);
    });

    return { steps, field: accessor.name };
  }

  private static parseSegment(value: string): Segment {
    const match: RegExpMatchArray | null = value.match(this.SEGMENT_EXP);
    const name: string | undefined = match?.groups?.name;
    const filter: string | undefined = match?.groups?.filter;

    if (!name) throw new Error(`Invalid segment: ${value}`);
    return { name, filter };
  }

  private static isAccessStep(segment: Segment): segment is AccessStep {
    return this.STEP_NAMES.has(segment.name);
  }
}
