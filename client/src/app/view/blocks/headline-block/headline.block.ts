import { Component, input, InputSignal } from '@angular/core';
import { HeadlineProps } from '../../../models/Config';
import { BlockValueResolver } from '../../../resolvers/block-value.resolver';

@Component({
  selector: 'block-headline',
  imports: [],
  templateUrl: './headline.block.html',
})
export class HeadlineBlock {
  public readonly props: InputSignal<HeadlineProps> = input.required();
  public readonly values: InputSignal<Record<string, unknown>> = input({});

  protected title(): string {
    return BlockValueResolver.resolveString(this.props().title, this.values());
  }
}
