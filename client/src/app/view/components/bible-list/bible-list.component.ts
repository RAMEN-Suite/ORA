import { Component, computed, effect, input, InputSignal, model, ModelSignal, Signal } from '@angular/core';
import { BibleListHelper, BibleOption } from './bible-list.helper';
import { Button } from 'primeng/button';
import { Config } from '../../../models/Config';
import BibleBook = Config.BibleBook;

@Component({
  selector: 'shared-bible-list',
  imports: [Button],
  templateUrl: './bible-list.component.html',
})
export class BibleListComponent {
  public readonly items: InputSignal<string[]> = input<string[]>([]);
  public readonly isDisabled: InputSignal<boolean> = input(false);

  public readonly bibleBooks: InputSignal<BibleBook[]> = input.required<BibleBook[]>();
  public readonly activeBook: ModelSignal<string> = model('');

  protected readonly books: Signal<BibleOption[]> = computed((): BibleOption[] =>
    BibleListHelper.getBibleOptions(this.items(), this.bibleBooks()),
  );

  constructor() {
    effect((): void => {
      const books: BibleOption[] = this.books();
      if (books.length === 0) return;

      const current: string = this.activeBook();
      if (books.some((book: BibleOption): boolean => book.value === current)) return;

      this.activeBook.set(books.reduce((a: BibleOption, b: BibleOption): BibleOption => (a.order < b.order ? a : b)).value);
    });
  }
}
