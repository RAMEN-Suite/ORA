import { Component, computed, input, InputSignal, Signal } from '@angular/core';
import { Nullable } from 'primeng/ts-helpers';
import { sprintf } from 'sprintf-js';
import { MarkdownComponent } from 'ngx-markdown';

interface Property {
  name: string;
  display?: string;
}

@Component({
  selector: 'shared-property-list',
  imports: [MarkdownComponent],
  templateUrl: './property-list.component.html',
})
export class PropertyListComponent {
  public readonly object: InputSignal<Record<string, unknown>> = input({});
  public readonly properties: InputSignal<Property[]> = input<Property[]>([]);

  protected readonly formattedStrings: Signal<string[]> = computed((): string[] => {
    return this.properties()
      .map((property: Property): string => this.getFormattedString(this.object(), property))
      .filter((formattedString: string): boolean => formattedString !== '');
  });

  protected getFormattedString(object: Record<string, unknown>, property: Property): string {
    const value: Nullable<string | string[]> = this.getPropertyValue(object, property.name);
    if (value === null || value === undefined) return '';

    const args: string[] = Array.isArray(value) ? value : [value];
    return property.display ? sprintf(property.display, ...args) : args.join(',');
  }

  protected getPropertyValue(object: Record<string, unknown>, property: string): Nullable<string | string[]> {
    const value: Nullable<unknown> = object[property];
    if (value === null || value === undefined || value === '') return null;
    return Array.isArray(value) ? value.map(String) : String(value);
  }
}
