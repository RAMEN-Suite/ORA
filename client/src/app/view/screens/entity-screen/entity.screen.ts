import { Component, Signal } from '@angular/core';
import { AbstractDetailScreen } from '../abstract-detail.screen';
import { Entity } from '../../../models/Node';
import { DetailView } from '../../../models/config/DetailViews';

@Component({
  selector: 'screen-entity',
  imports: [],
  templateUrl: './entity.screen.html',
})
export class EntityScreen extends AbstractDetailScreen<Entity> {
  protected readonly entity: Signal<Entity | null> = this.node;
  protected readonly entityView: Signal<DetailView | null> = this.detailView;

  public constructor() {
    super();
    this.init('entity');
  }
}
