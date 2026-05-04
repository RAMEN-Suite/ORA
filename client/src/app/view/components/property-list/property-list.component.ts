import { Component, computed, input, InputSignal, Signal } from '@angular/core';
import { sprintf } from 'sprintf-js';
import { MarkdownComponent } from 'ngx-markdown';

export type Property = { name: string; display?: string; valueMap?: Record<string, string> };

@Component({
  selector: 'shared-property-list',
  imports: [MarkdownComponent],
  templateUrl: './property-list.component.html',
})
export class PropertyListComponent {
  public readonly item: InputSignal<Record<string, unknown>> = input({});
  public readonly properties: InputSignal<Property[]> = input<Property[]>([]);

  protected readonly formattedStrings: Signal<string[]> = computed((): string[] => {
    return this.properties()
      .map((property: Property): string => this.getFormattedString(this.item(), property))
      .filter((formattedString: string): boolean => formattedString !== '');
  });

  protected getFormattedString(item: Record<string, unknown>, property: Property): string {
    const value: string | string[] | null = this.getPropertyValue(item, property.name);
    if (value === null || value === undefined) return '';
    const mapped: string[] = this.getMappedValues(value, property);
    return property.display ? sprintf(property.display, ...mapped) : mapped.join(',');
  }

  protected getPropertyValue(item: Record<string, unknown>, property: string): string | string[] | null {
    const value: unknown | undefined = item[property];
    if (value === null || value === undefined || value === '') return null;
    return Array.isArray(value) ? value.map(String) : String(value);
  }

  protected getMappedValues(value: string | string[], property: Property): string[] {
    const values: string[] = Array.isArray(value) ? value : [value];
    if (!property.valueMap) return values;
    return values.map((value: string): string => property.valueMap?.[value] ?? value);
  }
}
