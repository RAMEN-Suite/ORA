import {
  Component,
  computed,
  DOCUMENT,
  effect,
  inject,
  input,
  InputSignal,
  model,
  ModelSignal,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { Listbox } from 'primeng/listbox';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { IftaLabel } from 'primeng/iftalabel';
import { InputText } from 'primeng/inputtext';
import { TranslocoDirective } from '@jsverse/transloco';

export interface SearchableOption {
  label: string;
  value: string;
  search?: string[];
}

@Component({
  selector: 'shared-searchable-list',
  imports: [Listbox, FormsModule, Button, IftaLabel, InputText, TranslocoDirective],
  templateUrl: './searchable-list.component.html',
})
export class SearchableListComponent {
  private readonly document: Document = inject(DOCUMENT);

  public readonly options: InputSignal<SearchableOption[]> = input<SearchableOption[]>([]);
  public readonly isDisabled: InputSignal<boolean> = input(false);
  public readonly searchLabel: InputSignal<string> = input('app.shared.searchableList.search');

  public activeValue: ModelSignal<string> = model('');

  protected readonly search: WritableSignal<string> = signal('');
  protected readonly filteredOptions: Signal<SearchableOption[]> = computed(this.filterOptions.bind(this));

  constructor() {
    effect((): void => {
      const disabled: boolean = this.isDisabled();
      const options: SearchableOption[] = this.options();
      if (options.length === 0 || disabled) return;

      const current: string = this.activeValue();
      if (!options.some((option: SearchableOption): boolean => option.value === current)) {
        this.activeValue.set(options[0]?.value ?? '');
      }

      this.scrollToSelected();
    });
  }

  protected change(offset: number): void {
    const options: SearchableOption[] = this.filteredOptions();
    const index: number = options.findIndex((option: SearchableOption): boolean => option.value === this.activeValue());

    const next: SearchableOption | undefined = options[index + offset];
    if (!next) return;

    this.activeValue.set(next.value);
    this.scrollToSelected();
  }

  private scrollToSelected(): void {
    queueMicrotask((): void => {
      const element: HTMLElement | null = this.document.querySelector<HTMLElement>('.p-listbox-option-selected');
      element?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
  }

  private filterOptions(): SearchableOption[] {
    const search: string = this.search().trim().toLocaleLowerCase();
    const options: SearchableOption[] = this.options();
    if (!search || search.length < 2) return options;

    return options.filter((option: SearchableOption): boolean => {
      const options: string[] = [option.label, ...(option.search ?? [])];
      return options.some((value: string): boolean => value.toLocaleLowerCase().includes(search));
    });
  }
}
