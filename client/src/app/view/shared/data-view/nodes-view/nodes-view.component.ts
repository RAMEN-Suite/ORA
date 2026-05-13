import { Component, input, InputSignal } from '@angular/core';
import { Divider } from 'primeng/divider';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Property, PropertyListComponent } from '../../property-list/property-list.component';
import { RouterLink } from '@angular/router';

export interface LabeledNode {
  label: string;
  uuid: string;
  [key: string]: unknown;
}

@Component({
  selector: 'shared-nodes-view',
  imports: [Divider, ProgressSpinner, PropertyListComponent, RouterLink],
  templateUrl: './nodes-view.component.html',
})
export class NodesViewComponent {
  public readonly nodes: InputSignal<LabeledNode[]> = input<LabeledNode[]>([]);
  public readonly properties: InputSignal<Property[]> = input<Property[]>([]);
  public readonly routeTarget: InputSignal<string[]> = input<string[]>([]);

  public readonly isLoading: InputSignal<boolean> = input(false);
}
