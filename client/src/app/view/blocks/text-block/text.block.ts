import { Component, computed, Signal } from '@angular/core';
import { BlockValueResolver } from '../../../resolvers/block-value.resolver';
import { Fieldset } from 'primeng/fieldset';
import { TranslocoDirective } from '@jsverse/transloco';
import { Node } from '../../../models/Node';
import { JsonPipe } from '@angular/common';
import { AbstractBlock } from '../abstract.block';
import { TextProps } from '../../../models/config/DetailViews';
import { Binding } from '../../../models/config/Config';

@Component({
  selector: 'block-text',
  imports: [Fieldset, TranslocoDirective, JsonPipe],
  templateUrl: './text.block.html',
})
export class TextBlock extends AbstractBlock<TextProps> {
  protected readonly title: Signal<string | undefined> = computed((): string | undefined => {
    return this.properties()?.title;
  });

  protected readonly text: Signal<string> = computed((): string => {
    const text: Binding | undefined = this.properties()?.text;
    if (!text) console.error('Missing Text Property: text');
    return BlockValueResolver.resolveString(text, this.values());
  });

  protected readonly annotations: Signal<Node[]> = computed((): Node[] => {
    const access: Binding | undefined = this.properties()?.annotations;
    return BlockValueResolver.resolveNodes(access, this.values());
  });
}
