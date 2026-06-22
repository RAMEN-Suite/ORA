import { NgClass, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  input,
  InputSignal,
  Signal,
  TemplateRef,
} from '@angular/core';

type SidebarPosition = 'left' | 'right';

@Component({
  selector: 'shared-screen-shell',
  imports: [NgClass, NgTemplateOutlet],
  templateUrl: './screen-shell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScreenShellComponent {
  public sidebarPosition: InputSignal<SidebarPosition> = input<SidebarPosition>('right');
  public isStickySidebar: InputSignal<boolean> = input<boolean>(false);
  public isFullWidth: InputSignal<boolean> = input<boolean>(true);
  public isCentered: InputSignal<boolean> = input<boolean>(false);

  protected mainTemplate: Signal<TemplateRef<unknown> | undefined> = contentChild<TemplateRef<unknown>>('main');
  protected sidebarTemplate: Signal<TemplateRef<unknown> | undefined> = contentChild<TemplateRef<unknown>>('sidebar');

  protected hasSidebar: Signal<boolean> = computed<boolean>((): boolean => !!this.sidebarTemplate());
  protected isSidebarLeft: Signal<boolean> = computed<boolean>((): boolean => this.sidebarPosition() === 'left');

  protected gridClasses: Signal<string> = computed<string>((): string => {
    if (!this.hasSidebar() && this.isFullWidth()) return this.isCentered() ? 'place-items-center' : '';
    return this.isSidebarLeft() ? 'lg:grid-cols-[350px_minmax(0,1fr)]' : 'lg:grid-cols-[minmax(0,1fr)_350px]';
  });
}
