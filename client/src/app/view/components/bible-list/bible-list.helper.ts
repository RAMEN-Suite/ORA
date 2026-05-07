type Parsed = { option: BibleOption; chapter: number; verse: number };

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

  public static getBibleOptions(labels: string[], aliases: BibleAlias[]): BibleOption[] {
    const result = new Map<string, BibleOption>();
    let isUnknown: boolean = false;

    for (const label of labels) {
      const parsed: Parsed | void = this.match(label, aliases);
      parsed ? result.set(parsed.option.value, parsed.option) : (isUnknown = true);
    }

    const options: BibleOption[] = [...result.values()].sort(this.sortBibleBooks);
    if (isUnknown) options.push({ label: '#', value: '#', order: Number.MAX_SAFE_INTEGER });
    return options;
  }

  public static getBibleValue(label: string, aliases: BibleAlias[]): string {
    return this.match(label, aliases)?.option.value ?? '#';
  }

  public static compare(a: string, b: string, aliases: BibleAlias[]): number {
    const left: Parsed | void = this.match(a, aliases);
    const right: Parsed | void = this.match(b, aliases);

    if (!left || !right) return left ? -1 : right ? 1 : a.localeCompare(b);
    return left.option.order - right.option.order || left.chapter - right.chapter || left.verse - right.verse;
  }

  private static parseReference(value: string): [number, number] {
    const full: RegExpMatchArray | null = value.match(/(\d+)\s*[,.]\s*(\d+)/);
    if (full) return [Number(full[1]), Number(full[2])];

    const chapter: RegExpMatchArray | null = value.match(/^\s*(\d+)/);
    if (chapter) return [Number(chapter[1]), 0];

    const verse: RegExpMatchArray | null = value.match(/^[,\s]+(\d+)/);
    if (verse) return [1, Number(verse[1])];

    return [0, 0];
  }

  private static match(label: string, aliases: BibleAlias[]): Parsed | void {
    const trimmed: string = label.trimStart();
    const normalized: string = this.normalize(trimmed);

    for (const entry of aliases) {
      if (!normalized.startsWith(entry.alias)) continue;
      const rest: string = trimmed.slice(entry.alias.length).trim();
      const [chapter, verse] = this.parseReference(rest);
      return { option: entry.option, chapter, verse };
    }
  }

  private static sortBibleBooks(a: BibleOption, b: BibleOption): number {
    return a.order - b.order;
  }

  private static normalize(value: string): string {
    return value.trim().toLocaleLowerCase();
  }
}
