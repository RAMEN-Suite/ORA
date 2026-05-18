import { Component, computed, Signal } from '@angular/core';
import { Fieldset } from 'primeng/fieldset';
import { TranslocoDirective } from '@jsverse/transloco';
import { Node } from '../../../models/Node';
import { AbstractBlock } from '../abstract.block';
import { TextProps } from '../../../models/config/DetailViews';

@Component({
  selector: 'block-text',
  imports: [Fieldset, TranslocoDirective],
  templateUrl: './text.block.html',
})
export class TextBlock extends AbstractBlock<TextProps> {
  protected readonly title: Signal<string> = computed((): string => this.resolveOptionalString('title'));
  protected readonly text: Signal<string> = computed((): string => this.resolveRequiredString('text'));
  protected readonly annotations: Signal<Node[]> = computed((): Node[] => this.resolveOptionalNodes('annotations'));
}
