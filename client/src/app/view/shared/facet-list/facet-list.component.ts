import { Component, effect, input, InputSignal, output, OutputEmitterRef, signal, WritableSignal } from '@angular/core';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { ActiveFilter, FacetGroup } from '../../../models/Facet';
import { FormsModule } from '@angular/forms';
import { FacetListItemComponent } from './facet-list-item/facet-list-item.component';
import { TranslocoDirective } from '@jsverse/transloco';
import { ParseUtils } from '../../../utils/ParseUtils';

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

  public constructor() {
    effect((): void => {
      const fields: string[] = this.activeFilterFields();
      if (fields.length === 0) return;
      this.expandedFacets.update((current: string[]): string[] => Array.from(new Set([...current, ...fields])));
    });
  }

  public collapseAccordions(): void {
    this.expandedFacets.set([]);
  }

  protected handleAccordionChange(value: unknown): void {
    value = ParseUtils.parseArray(value);
    this.expandedFacets.set(ParseUtils.parseStringArray(value));
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

  private activeFilterFields(): string[] {
    const facetFields: Set<string> = new Set<string>(this.facets().map((facet: FacetGroup): string => facet.field));
    const fields: string[] = this.activeFilters()
      .map((filter: ActiveFilter): string => filter.field)
      .filter((field: string): boolean => facetFields.has(field));

    return Array.from(new Set(fields));
  }
}
