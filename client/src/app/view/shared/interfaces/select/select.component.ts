import { Component, input, InputSignal, model, ModelSignal } from '@angular/core';
import { IftaLabel } from 'primeng/iftalabel';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { TranslocoDirective } from '@jsverse/transloco';

export interface Selectable {
  icon?: string;
  label: string;
  value: string;
}

@Component({
  selector: 'shared-select',
  imports: [IftaLabel, Select, FormsModule, TranslocoDirective],
  templateUrl: './select.component.html',
})
export class SelectComponent {
  public readonly label: InputSignal<string> = input('');
  public readonly items: InputSignal<Selectable[]> = input<Selectable[]>([]);
  public activeItem: ModelSignal<Selectable | undefined> = model<Selectable | undefined>(undefined);
}
