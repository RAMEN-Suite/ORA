import { Component, computed, inject, input, InputSignal, Signal } from '@angular/core';
import { MarkdownComponent } from 'ngx-markdown';
import { TranslocoService } from '@jsverse/transloco';

export type Property = { name: string; display?: string; valueMap?: Record<string, string> };

@Component({
  selector: 'shared-property-list',
  imports: [MarkdownComponent],
  templateUrl: './property-list.component.html',
})
export class PropertyListComponent {
  private readonly translocoService: TranslocoService = inject(TranslocoService);

  public readonly item: InputSignal<Record<string, unknown>> = input({});
  public readonly properties: InputSignal<Property[]> = input<Property[]>([]);

  protected readonly formattedStrings: Signal<string[]> = computed((): string[] =>
    this.properties()
      .map((property: Property): string => this.formatString(property))
      .filter(Boolean),
  );

  private formatString(property: Property): string {
    const value: string | string[] | null = this.getValue(property.name);
    if (value === null) return '';

    const values: string[] = this.getMappedValues(value, property);
    if (!property.display) return values.join(', ');

    return this.translocoService.translate(property.display, { value: values[0], values });
  }

  private getValue(property: string): string | string[] | null {
    const value: unknown = this.item()[property];
    if (value === null || value === undefined || value === '') return null;
    return Array.isArray(value) ? value.map(String) : String(value);
  }

  private getMappedValues(value: string | string[], property: Property): string[] {
    const values: string[] = Array.isArray(value) ? value : [value];

    return values.map((value: string): string => {
      const mapped: string = property.valueMap?.[value] ?? value;
      return this.translocoService.translate(mapped);
    });
  }
}
