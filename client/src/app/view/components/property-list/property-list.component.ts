import { Component, input, InputSignal } from '@angular/core';
import { Nullable } from 'primeng/ts-helpers';
import { sprintf } from 'sprintf-js';
import { MarkdownComponent } from 'ngx-markdown';

interface Property {
  name: string;
  display?: string;
}

@Component({
  selector: 'app-property-list',
  imports: [MarkdownComponent],
  templateUrl: './property-list.component.html',
})
export class PropertyListComponent {
  public readonly object: InputSignal<Record<string, unknown>> = input({});
  public readonly properties: InputSignal<Property[]> = input<Property[]>([]);

  public getFormattedString(object: Record<string, unknown>, property: Property): string {
    const value: string = this.getProperty(object, property.name);
    return property.display ? sprintf(property.display, value) : value;
  }

  private getProperty(object: Record<string, unknown>, property: string): string {
    const value: Nullable<unknown> = object[property];
    const isMissing: boolean = value === null || value === undefined || value === '';
    if (isMissing) console.warn('Missing property of object:', { property, object });
    return isMissing ? '' : String(value);
  }
}
