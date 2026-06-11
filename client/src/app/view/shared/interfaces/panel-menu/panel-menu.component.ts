import { NgClass, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { MenuItem } from 'primeng/api';
import { PanelMenuModule } from 'primeng/panelmenu';

@Component({
  selector: 'shared-panel-menu',
  imports: [NgClass, NgTemplateOutlet, RouterLink, RouterLinkActive, TranslocoDirective, PanelMenuModule],
  templateUrl: './panel-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelMenuComponent {
  public items: InputSignal<MenuItem[]> = input<MenuItem[]>([]);
}
