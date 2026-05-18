import { Component, computed, Signal } from '@angular/core';
import { HeadlineProps } from '../../../models/config/DetailViews';
import { AbstractBlock } from '../abstract.block';

@Component({
  selector: 'block-headline',
  imports: [],
  templateUrl: './headline.block.html',
})
export class HeadlineBlock extends AbstractBlock<HeadlineProps> {
  protected readonly title: Signal<string> = computed((): string => this.resolveRequiredString('title'));
}
