import { Component, Signal } from '@angular/core';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Collection } from '../../../models/Node';
import { AbstractDetailScreen } from '../abstract-detail.screen';
import { AttributesBlock } from '../../blocks/attributes-block/attributes.block';
import { CitationBlockComponent } from '../../blocks/citation-block/citation-block.component';
import { HeadlineBlock } from '../../blocks/headline-block/headline.block';
import { TextBlock } from '../../blocks/text-block/text.block';
import { ScreenShellComponent } from '../../shared/layout/screen-shell/screen-shell.component';

@Component({
  selector: 'screen-collection',
  imports: [ProgressSpinner, AttributesBlock, CitationBlockComponent, HeadlineBlock, TextBlock, ScreenShellComponent],
  templateUrl: './collection.screen.html',
})
export class CollectionScreen extends AbstractDetailScreen<Collection> {
  protected readonly collection: Signal<Collection | null> = this.node;

  public constructor() {
    super('collection');
  }
}
