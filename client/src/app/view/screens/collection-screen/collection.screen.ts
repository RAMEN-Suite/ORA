import { Component, Signal } from '@angular/core';
import { ProgressSpinner } from 'primeng/progressspinner';
import { BlockRendererComponent } from '../../shared/block-renderer/block-renderer.component';

import { Collection } from '../../../models/Node';
import { AbstractDetailScreen } from '../abstract-detail.screen';
import { DetailView } from '../../../models/config/DetailViews';

@Component({
  selector: 'screen-collection',
  imports: [ProgressSpinner, BlockRendererComponent],
  templateUrl: './collection.screen.html',
})
export class CollectionScreen extends AbstractDetailScreen<Collection> {
  protected readonly collection: Signal<Collection | null> = this.node;
  protected readonly collectionView: Signal<DetailView | null> = this.detailView;

  constructor() {
    super();
    this.init('collection');
  }
}
