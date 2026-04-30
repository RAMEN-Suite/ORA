import { Component, input, InputSignal, model, ModelSignal } from '@angular/core';
import { IftaLabel } from 'primeng/iftalabel';
import { Select } from 'primeng/select';
import { Nullable } from 'primeng/ts-helpers';
import { FormsModule } from '@angular/forms';

interface Selectable {
  icon?: string;
  label: string;
  value: string;
}

@Component({
  selector: 'shared-select',
  imports: [IftaLabel, Select, FormsModule],
  templateUrl: './select.component.html',
})
export class SelectComponent {
  public readonly selectLabel: InputSignal<string> = input('');
  public readonly items: InputSignal<Selectable[]> = input<Selectable[]>([]);
  public activeItem: ModelSignal<Nullable<Selectable>> = model<Nullable<Selectable>>(null);
}
