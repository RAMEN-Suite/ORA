import { Component, computed, input, InputSignal, Signal } from '@angular/core';
import { BlockValueResolver } from '../../../resolvers/block-value.resolver';
import { HeadlineProps } from '../../../models/config/Block';
import { AccessValue } from '../../../models/config/Access';

@Component({
  selector: 'block-headline',
  imports: [],
  templateUrl: './headline.block.html',
})
export class HeadlineBlock {
  public readonly properties: InputSignal<HeadlineProps | undefined> = input();
  public readonly values: InputSignal<Record<string, unknown>> = input({});

  protected readonly title: Signal<string> = computed((): string => {
    const title: AccessValue<string> | undefined = this.properties()?.title;
    if (!title) console.warn('Missing Headline Property: title');
    return BlockValueResolver.resolveString(title, this.values());
  });
}
