import { Component, computed, input, InputSignal, output, OutputEmitterRef, Signal } from '@angular/core';
import { ActiveFilter, EqualFilter, FacetGroup, FacetValue } from '../../../../models/Facet';
import { Listbox } from 'primeng/listbox';
import { FormsModule } from '@angular/forms';

interface FilterOption {
  icon?: string;
  label: string;
  value: string;
  valueMap?: Record<string, string>;
  display?: 'list' | 'range';
}

@Component({
  selector: 'shared-facet-list-item',
  imports: [Listbox, FormsModule],
  templateUrl: './facet-list-item.component.html',
})
export class FacetListItemComponent {
  public readonly facet: InputSignal<FacetGroup> = input.required<FacetGroup>();
  public readonly filter: InputSignal<FilterOption | undefined> = input<FilterOption>();

  public readonly activeFilters: InputSignal<ActiveFilter[]> = input<ActiveFilter[]>([]);
  public readonly activeFiltersChange: OutputEmitterRef<ActiveFilter[]> = output<ActiveFilter[]>();

  protected readonly selectedSet: Signal<Set<string>> = computed((): Set<string> => new Set(this.selectedValues()));
  protected readonly options: Signal<FacetValue[]> = computed((): FacetValue[] => {
    const selected: Set<string> = this.selectedSet();

    return [...this.facet().values].sort((a: FacetValue, b: FacetValue): number => {
      const aSelected: boolean = selected.has(a.value);
      const bSelected: boolean = selected.has(b.value);
      if (aSelected !== bSelected) return aSelected ? -1 : 1;
      return b.count - a.count;
    });
  });

  protected readonly selectedValues: Signal<string[]> = computed((): string[] => {
    const equals: EqualFilter[] = this.activeFilters().filter((f: ActiveFilter): f is EqualFilter => f.kind === 'equal');
    const selected: EqualFilter[] = equals.filter((f: EqualFilter): boolean => f.field === this.facet().field);
    return selected.map((filter: EqualFilter): string => filter.value);
  });

  protected handleSelectionChange(values: string[] | null): void {
    const field: string = this.facet().field;

    const remaining: ActiveFilter[] = this.activeFilters().filter((filter: ActiveFilter): boolean => filter.field !== field);
    const next: EqualFilter[] = (values ?? []).map((value: string): EqualFilter => ({ kind: 'equal', field, value }));

    this.activeFiltersChange.emit([...remaining, ...next]);
  }

  protected getFilterValue(value: string): string {
    return this.filter()?.valueMap?.[value] ?? value;
  }

  protected isFilterable(): boolean {
    return this.facet().values.length > 10;
  }
}
