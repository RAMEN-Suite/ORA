import { Component, Signal } from '@angular/core';
import { AbstractDetailScreen } from '../abstract-detail.screen';
import { Entity } from '../../../models/Node';
import { DetailView } from '../../../models/config/DetailViews';
import { ScreenShellComponent } from '../../shared/layout/screen-shell/screen-shell.component';
import { ProgressSpinner } from 'primeng/progressspinner';
import { HeadlineBlock } from '../../blocks/headline-block/headline.block';
import { TextBlock } from '../../blocks/text-block/text.block';
import { AttributesBlock } from '../../blocks/attributes-block/attributes.block';

@Component({
  selector: 'screen-entity',
  imports: [ScreenShellComponent, ProgressSpinner, HeadlineBlock, TextBlock, AttributesBlock],
  templateUrl: './entity.screen.html',
})
export class EntityScreen extends AbstractDetailScreen<Entity> {
  protected readonly entity: Signal<Entity | null> = this.node;
  protected readonly entityView: Signal<DetailView | null> = this.detailView;

  public constructor() {
    super('entity');
  }
}
