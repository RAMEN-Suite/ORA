import { Component, computed, input, InputSignal, Signal } from '@angular/core';
import { Nullable } from 'primeng/ts-helpers';
import { sprintf } from 'sprintf-js';
import { MarkdownComponent } from 'ngx-markdown';
import { Config } from '../../../models/Config';

type Property = Config.Property;

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
    const value: Nullable<string | string[]> = this.getPropertyValue(item, property.name);
    if (value === null || value === undefined) return '';
    const mapped: string[] = this.getMappedValues(value, property);
    return property.display ? sprintf(property.display, ...mapped) : mapped.join(',');
  }

  protected getPropertyValue(item: Record<string, unknown>, property: string): Nullable<string | string[]> {
    const value: Nullable<unknown> = item[property];
    if (value === null || value === undefined || value === '') return null;
    return Array.isArray(value) ? value.map(String) : String(value);
  }

  protected getMappedValues(value: string | string[], property: Property): string[] {
    const values: string[] = Array.isArray(value) ? value : [value];
    if (!property.valueMap) return values;
    return values.map((value: string): string => property.valueMap?.[value] ?? value);
  }
}
