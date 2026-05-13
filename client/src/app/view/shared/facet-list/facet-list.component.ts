import { Component, input, InputSignal, output, OutputEmitterRef, signal, WritableSignal } from '@angular/core';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { ActiveFilter, FacetGroup } from '../../../models/Facet';
import { FormsModule } from '@angular/forms';
import { FacetListItemComponent } from './facet-list-item/facet-list-item.component';
import { TranslocoDirective } from '@jsverse/transloco';
import { Utils } from '../../../utils/Utils';

export interface FacetFilter {
  icon?: string;
  label: string;
  value: string;
  valueMap?: Record<string, string>;
  display?: 'list' | 'range';
}

@Component({
  selector: 'shared-facet-list',
  imports: [
    Accordion,
    AccordionContent,
    AccordionHeader,
    AccordionPanel,
    FormsModule,
    TranslocoDirective,
    FacetListItemComponent,
  ],
  templateUrl: './facet-list.component.html',
})
export class FacetListComponent {
  public readonly facets: InputSignal<FacetGroup[]> = input<FacetGroup[]>([]);
  public readonly filters: InputSignal<FacetFilter[]> = input<FacetFilter[]>([]);

  public readonly activeFilters: InputSignal<ActiveFilter[]> = input<ActiveFilter[]>([]);
  public readonly activeFiltersChange: OutputEmitterRef<ActiveFilter[]> = output<ActiveFilter[]>();

  protected readonly expandedFacets: WritableSignal<string[]> = signal<string[]>([]);

  public collapseAccordions(): void {
    this.expandedFacets.set([]);
  }

  protected handleAccordionChange(value: unknown): void {
    value = Utils.parseArray(value);
    this.expandedFacets.set(Utils.parseStringArray(value));
  }

  protected getFilter(field: string): FacetFilter | undefined {
    return this.filters().find((filter: FacetFilter): boolean => filter.value === field);
  }

  protected getFacetIcon(field: string): string | undefined {
    return this.getFilter(field)?.icon;
  }

  protected getFacetLabel(field: string): string {
    return this.getFilter(field)?.label ?? field;
  }
}
