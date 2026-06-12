import { Component, computed, Signal } from '@angular/core';
import { AbstractContent } from '../abstract.content';
import { LinkListItem, LinkListProps } from '../../../models/config/PageViews';
import { MenuItem } from 'primeng/api';
import { PanelMenuComponent } from '../../shared/interfaces/panel-menu/panel-menu.component';

@Component({
  selector: 'content-link-list',
  imports: [PanelMenuComponent],
  templateUrl: './link-list.content.html',
})
export class LinkListContent extends AbstractContent<LinkListProps> {
  protected readonly items: Signal<MenuItem[]> = computed((): MenuItem[] => {
    const linkListItems: LinkListItem[] = this.properties()?.items ?? [];
    return linkListItems.map((item: LinkListItem): MenuItem => {
      return {
        label: item.label,
        icon: item.icon,
        route: item.path,
        url: item.path ? undefined : item.url,
      };
    });
  });
}
