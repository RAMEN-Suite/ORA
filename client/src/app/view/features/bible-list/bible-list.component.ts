import { Component, computed, inject, input, InputSignal, model, ModelSignal, Signal } from '@angular/core';
import { BibleAlias, BibleListHelper, BibleOption } from './bible-list.helper';
import { FormsModule } from '@angular/forms';
import { TranslocoService } from '@jsverse/transloco';
import { SearchableListComponent } from '../../shared/searchable-list/searchable-list.component';

@Component({
  selector: 'feature-bible-list',
  imports: [FormsModule, SearchableListComponent],
  templateUrl: './bible-list.component.html',
})
export class BibleListComponent {
  private readonly translocoService: TranslocoService = inject(TranslocoService);

  public readonly aliases: InputSignal<BibleAlias[]> = input.required<BibleAlias[]>();
  public readonly items: InputSignal<string[]> = input<string[]>([]);
  public readonly isDisabled: InputSignal<boolean> = input(false);

  public activeBook: ModelSignal<string> = model('');

  protected readonly books: Signal<BibleOption[]> = computed((): BibleOption[] => {
    const options: BibleOption[] = BibleListHelper.options(this.items(), this.aliases());
    return options.map((o: BibleOption): BibleOption => ({ ...o, label: this.translocoService.translate(o.label) }));
  });
}
