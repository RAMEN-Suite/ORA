import { Component, input, InputSignal } from '@angular/core';
import { HeadlineBlock } from '../../blocks/headline-block/headline.block';
import { AttributesBlock } from '../../blocks/attributes-block/attributes.block';
import { TextBlock } from '../../blocks/text-block/text.block';
import { Block } from '../../../models/config/DetailViews';

@Component({
  selector: 'shared-block-renderer',
  imports: [HeadlineBlock, AttributesBlock, TextBlock],
  templateUrl: './block-renderer.component.html',
})
export class BlockRendererComponent {
  public readonly blocks: InputSignal<Block[]> = input<Block[]>([]);
  public readonly values: InputSignal<Record<string, unknown>> = input({});
}
