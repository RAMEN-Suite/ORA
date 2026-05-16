import { Component, input, InputSignal } from '@angular/core';
import { BlockValueResolver } from '../../../resolvers/block-value.resolver';
import { Fieldset } from 'primeng/fieldset';
import { TextProps } from '../../../models/Config';

@Component({
  selector: 'block-text',
  imports: [Fieldset],
  templateUrl: './text.block.html',
})
export class TextBlock {
  public readonly props: InputSignal<TextProps> = input.required<TextProps>();
  public readonly values: InputSignal<Record<string, unknown>> = input({});

  protected title(): string {
    return BlockValueResolver.resolveString(this.props().title, this.values());
  }

  protected text(): string {
    return BlockValueResolver.resolveString(this.props().text, this.values());
  }
}
