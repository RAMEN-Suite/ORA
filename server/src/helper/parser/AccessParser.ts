type StepName = 'annotation' | 'entity';

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

export class AccessParser {
  private static readonly SEGMENT_EXP: RegExp = /^(?<name>[A-Za-z_]\w*)(?:\[(?<filter>[^\]]+)])?$/;

  public static parse(value: string): AccessPath {
    const segments: Segment[] = value.split('.').map((segment: string): Segment => this.parseSegment(segment));

    const accessor: Segment | undefined = segments.pop();
    if (!accessor || accessor.filter) throw new Error(`Invalid query path: ${value}`);

    const steps: AccessStep[] = segments.map((segment: Segment): AccessStep => {
      if (this.isAccessStep(segment)) return segment;
      throw Error(`Invalid query step: ${segment}`);
    });

    return { steps, field: accessor.name };
  }

  private static parseSegment(value: string): Segment {
    const match: RegExpMatchArray | null = value.match(this.SEGMENT_EXP);
    const name: string | undefined = match?.groups?.['name'];
    const filter: string | undefined = match?.groups?.['filter'];

    if (!name) throw new Error(`Invalid segment: ${value}`);
    return { name, filter };
  }

  private static isAccessStep(segment: Segment): segment is AccessStep {
    return segment.name === 'annotation' || segment.name === 'entity';
  }
}
