import { TranslocoService } from '@jsverse/transloco';
import { ListIndexItem } from '../../models/config/IndexOptions';
import { AliasMatch, ListIndex } from '../../models/ListIndex';
import { AliasListIndex } from './alias-list.index';

interface BibleMatch extends AliasMatch {
  chapter: number;
  verse: number;
}

export class BibleListIndex extends AliasListIndex {
  public override readonly type: ListIndex['type'] = 'bible';

  public constructor(items: ListIndexItem[], unknownLabel: string, translocoService: TranslocoService) {
    super(items, unknownLabel, translocoService);
  }

  public override compare(a: string, b: string): number {
    const left: BibleMatch | undefined = this.parse(a);
    const right: BibleMatch | undefined = this.parse(b);
    if (!left || !right) return left ? -1 : right ? 1 : a.localeCompare(b);
    return left.option.order - right.option.order || left.chapter - right.chapter || left.verse - right.verse;
  }

  private parse(label: string): BibleMatch | undefined {
    const match: AliasMatch | undefined = this.match(label);
    if (!match) return undefined;

    const [chapter, verse] = this.reference(match.rest);
    return { ...match, chapter, verse };
  }

  private reference(value: string): [number, number] {
    const full: RegExpExecArray | null = /(\d+)\s*[,.]\s*(\d+)/.exec(value);
    if (full) return [Number(full[1]), Number(full[2])];

    const chapter: RegExpExecArray | null = /^\s*(\d+)/.exec(value);
    if (chapter) return [Number(chapter[1]), 0];

    const verse: RegExpExecArray | null = /^[,\s]+(\d+)/.exec(value);
    if (verse) return [1, Number(verse[1])];

    return [0, 0];
  }
}
