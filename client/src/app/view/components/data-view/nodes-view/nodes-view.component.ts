import { Component, input, InputSignal } from '@angular/core';
import { Divider } from 'primeng/divider';
import { ProgressSpinner } from 'primeng/progressspinner';
import { PropertyListComponent } from '../../property-list/property-list.component';
import { RouterLink } from '@angular/router';
import { ROUTES } from '../../../../app.routes';
import { Nullable } from 'primeng/ts-helpers';

type LabeledNode = { label: string; uuid: string };
type Property = { name: string; display?: string };

@Component({
  selector: 'shared-nodes-view',
  imports: [Divider, ProgressSpinner, PropertyListComponent, RouterLink],
  templateUrl: './nodes-view.component.html',
})
export class NodesViewComponent {
  public nodes: InputSignal<LabeledNode[]> = input<LabeledNode[]>([]);
  public properties: InputSignal<Property[]> = input<Property[]>([]);
  public route: InputSignal<Nullable<ROUTES>> = input<Nullable<ROUTES>>(null);

  public isLoading: InputSignal<boolean> = input(false);
}
