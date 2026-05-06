import { Component, input, InputSignal } from '@angular/core';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { Listbox } from 'primeng/listbox';
import { FacetGroup } from '../../../models/Facet';
import { ProgressSpinner } from 'primeng/progressspinner';

interface FilterOption {
  icon?: string;
  label: string;
  value: string;
  valueMap?: Record<string, string>;
  display?: 'list' | 'range';
}

@Component({
  selector: 'shared-facet-list',
  imports: [Accordion, AccordionContent, AccordionHeader, AccordionPanel, Listbox, ProgressSpinner],
  templateUrl: './facet-list.component.html',
})
export class FacetListComponent {
  public readonly facets: InputSignal<FacetGroup[]> = input<FacetGroup[]>([]);
  public readonly filters: InputSignal<FilterOption[]> = input<FilterOption[]>([]);
  public readonly isLoading: InputSignal<boolean> = input(false);

  protected getFilter(field: string): FilterOption | undefined {
    return this.filters().find((filter: FilterOption): boolean => filter.value === field);
  }

  protected getFacetIcon(field: string): string | undefined {
    return this.getFilter(field)?.icon;
  }

  protected getFacetLabel(field: string): string {
    return this.getFilter(field)?.label ?? field;
  }

  protected getValueLabel(field: string, value: string): string {
    return this.getFilter(field)?.valueMap?.[value] ?? value;
  }
}
