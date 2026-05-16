interface Parsed {
  option: BibleOption;
  chapter: number;
  verse: number;
}

interface BibleBook {
  key: string;
  aliases: string[];
}

export interface BibleAlias {
  alias: string;
  option: BibleOption;
}

export interface BibleOption {
  label: string;
  value: string;
  order: number;
}

export class BibleListHelper {
  public static createIndex(books: BibleBook[]): BibleAlias[] {
    const aliases: BibleAlias[] = [];

    for (const [order, book] of books.entries()) {
      const option: BibleOption = { label: book.key, value: book.key, order };
      aliases.push({ alias: this.normalize(book.key), option });
      for (const alias of book.aliases) aliases.push({ alias: this.normalize(alias), option });
    }

    aliases.sort((a: BibleAlias, b: BibleAlias): number => b.alias.length - a.alias.length);
    return aliases;
  }

  public static options(labels: string[], aliases: BibleAlias[]): BibleOption[] {
    const result: Map<string, BibleOption> = new Map<string, BibleOption>();
    let isUnknown: boolean = false;

    for (const label of labels) {
      const parsed: Parsed | undefined = this.parse(label, aliases);
      if (parsed) result.set(parsed.option.value, parsed.option);
      else isUnknown = true;
    }

    const options: BibleOption[] = [...result.values()].sort((a: BibleOption, b: BibleOption): number => a.order - b.order);
    if (isUnknown) options.push({ label: 'app.features.bibleList.unknown', value: '#', order: Number.MAX_SAFE_INTEGER });
    return options;
  }

  public static value(label: string, aliases: BibleAlias[]): string {
    return this.parse(label, aliases)?.option.value ?? '#';
  }

  public static compare(a: string, b: string, aliases: BibleAlias[]): number {
    const left: Parsed | undefined = this.parse(a, aliases);
    const right: Parsed | undefined = this.parse(b, aliases);

    if (!left || !right) return left ? -1 : right ? 1 : a.localeCompare(b);
    return left.option.order - right.option.order || left.chapter - right.chapter || left.verse - right.verse;
  }

  private static parse(label: string, aliases: BibleAlias[]): Parsed | undefined {
    const trimmed: string = label.trimStart();
    const normalized: string = this.normalize(trimmed);

    for (const entry of aliases) {
      if (!normalized.startsWith(entry.alias)) continue;
      const rest: string = trimmed.slice(entry.alias.length).trim();
      const [chapter, verse] = this.reference(rest);
      return { option: entry.option, chapter, verse };
    }

    return undefined;
  }

  private static reference(value: string): [number, number] {
    const full: RegExpExecArray | null = /(\d+)\s*[,.]\s*(\d+)/.exec(value);
    if (full) return [Number(full[1]), Number(full[2])];

    const chapter: RegExpExecArray | null = /^\s*(\d+)/.exec(value);
    if (chapter) return [Number(chapter[1]), 0];

    const verse: RegExpExecArray | null = /^[,\s]+(\d+)/.exec(value);
    if (verse) return [1, Number(verse[1])];

    return [0, 0];
  }

  private static normalize(value: string): string {
    return value.trim().toLocaleLowerCase();
  }
}
