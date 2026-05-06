import { Component, input, InputSignal, output, OutputEmitterRef } from '@angular/core';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { ActiveFilter, FacetGroup } from '../../../models/Facet';
import { FormsModule } from '@angular/forms';
import { FacetListItemComponent } from './facet-list-item/facet-list-item.component';
import { Config } from '../../../models/Config';
import FilterOption = Config.FilterOption;

@Component({
  selector: 'shared-facet-list',
  imports: [Accordion, AccordionContent, AccordionHeader, AccordionPanel, FormsModule, FacetListItemComponent],
  templateUrl: './facet-list.component.html',
})
export class FacetListComponent {
  public readonly facets: InputSignal<FacetGroup[]> = input<FacetGroup[]>([]);
  public readonly filters: InputSignal<FilterOption[]> = input<FilterOption[]>([]);

  public readonly activeFilters: InputSignal<ActiveFilter[]> = input<ActiveFilter[]>([]);
  public readonly activeFiltersChange: OutputEmitterRef<ActiveFilter[]> = output<ActiveFilter[]>();

  protected isExpanded(field: string): boolean {
    return this.activeFilters().some((filter: ActiveFilter): boolean => filter.field === field);
  }

  protected getFilter(field: string): FilterOption | undefined {
    return this.filters().find((filter: FilterOption): boolean => filter.value === field);
  }

  protected getFacetIcon(field: string): string | undefined {
    return this.getFilter(field)?.icon;
  }

  protected getFacetLabel(field: string): string {
    return this.getFilter(field)?.label ?? field;
  }
}
