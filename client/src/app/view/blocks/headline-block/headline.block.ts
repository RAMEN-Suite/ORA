import { Component, computed, Signal } from '@angular/core';
import { BlockValueResolver } from '../../../resolvers/block-value.resolver';
import { HeadlineProps } from '../../../models/config/DetailViews';
import { Binding } from '../../../models/config/Config';
import { AbstractBlock } from '../abstract.block';

@Component({
  selector: 'block-headline',
  imports: [],
  templateUrl: './headline.block.html',
})
export class HeadlineBlock extends AbstractBlock<HeadlineProps> {
  protected readonly title: Signal<string> = computed((): string => {
    const title: Binding | undefined = this.properties()?.title;
    if (!title) console.error('Missing Headline Property: title');
    return BlockValueResolver.resolveString(title, this.values());
  });
}
