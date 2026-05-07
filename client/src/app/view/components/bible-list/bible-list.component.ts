import { Component, computed, effect, input, InputSignal, model, ModelSignal, Signal } from '@angular/core';
import { BibleAlias, BibleListHelper, BibleOption } from './bible-list.helper';
import { FormsModule } from '@angular/forms';
import { Listbox } from 'primeng/listbox';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'shared-bible-list',
  imports: [FormsModule, Listbox, TranslocoDirective],
  templateUrl: './bible-list.component.html',
})
export class BibleListComponent {
  public readonly items: InputSignal<string[]> = input<string[]>([]);
  public readonly isDisabled: InputSignal<boolean> = input(false);

  public readonly bibleAliases: InputSignal<BibleAlias[]> = input.required<BibleAlias[]>();
  public activeBook: ModelSignal<string> = model('');

  protected readonly books: Signal<BibleOption[]> = computed((): BibleOption[] =>
    BibleListHelper.getBibleOptions(this.items(), this.bibleAliases()),
  );

  constructor() {
    effect((): void => {
      if (this.isDisabled()) return;

      const books: BibleOption[] = this.books();
      if (books.length === 0) return;

      const current: string = this.activeBook();
      if (books.some((book: BibleOption): boolean => book.value === current)) return;

      this.activeBook.set(books.reduce((a: BibleOption, b: BibleOption): BibleOption => (a.order < b.order ? a : b)).value);
    });
  }
}
