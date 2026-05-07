type Parsed = { option: BibleOption; chapter: number; verse: number };

interface BibleBookMatch {
  book: BibleBook;
  order: number;
  rest: string;
}

interface BibleBook {
  key: string;
  aliases: string[];
}

export interface BibleOption {
  label: string;
  value: string;
  order: number;
}

export class BibleListHelper {
  public static getBibleOptions(labels: string[], books: BibleBook[]): BibleOption[] {
    const result = new Map<string, BibleOption>();
    let isUnknown: boolean = false;

    for (const label of labels) {
      const parsed: Parsed | undefined = this.parseLabel(label, books);
      parsed ? result.set(parsed.option.value, parsed.option) : (isUnknown = true);
    }

    const options: BibleOption[] = [...result.values()].sort(this.sortBibleBooks);
    if (isUnknown) options.push({ label: '#', value: '#', order: Number.MAX_SAFE_INTEGER });
    return options;
  }

  public static getBibleValue(label: string, books: BibleBook[]): string {
    return this.parseLabel(label, books)?.option.value ?? '#';
  }

  public static compare(a: string, b: string, books: BibleBook[]): number {
    const left: Parsed | undefined = this.parseLabel(a, books);
    const right: Parsed | undefined = this.parseLabel(b, books);

    if (!left || !right) return left ? -1 : right ? 1 : a.localeCompare(b);
    return left.option.order - right.option.order || left.chapter - right.chapter || left.verse - right.verse;
  }

  private static parseLabel(label: string, books: BibleBook[]): Parsed | undefined {
    const match: void | BibleBookMatch = this.match(label, books);
    if (!match) return undefined;

    const [chapter, verse] = this.parseReference(match.rest);
    return { option: { label: match.book.key, value: match.book.key, order: match.order }, chapter, verse };
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

  private static match(label: string, books: BibleBook[]): BibleBookMatch | void {
    const trimmed: string = label.trimStart();
    const normalized: string = this.normalize(trimmed);

    for (const [order, book] of books.entries()) {
      for (const alias of [book.key, ...book.aliases]) {
        const normalizedAlias: string = this.normalize(alias);
        if (!normalized.startsWith(normalizedAlias)) continue;
        return { book, order, rest: trimmed.slice(alias.length).trim() };
      }
    }
  }

  private static sortBibleBooks(a: BibleOption, b: BibleOption): number {
    return a.order - b.order;
  }

  private static normalize(value: string): string {
    return value.trim().toLocaleLowerCase();
  }
}
