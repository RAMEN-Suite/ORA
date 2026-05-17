import { Component, input, InputSignal } from '@angular/core';
import { BlockValueResolver } from '../../../resolvers/block-value.resolver';
import { Fieldset } from 'primeng/fieldset';
import { TextProps } from '../../../models/config/Block';

@Component({
  selector: 'block-text',
  imports: [Fieldset],
  templateUrl: './text.block.html',
})
export class TextBlock {
  public readonly properties: InputSignal<TextProps> = input.required<TextProps>();
  public readonly values: InputSignal<Record<string, unknown>> = input({});

  protected title(): string {
    return BlockValueResolver.resolveString(this.properties().title, this.values());
  }

  protected text(): string {
    return BlockValueResolver.resolveString(this.properties().text, this.values());
  }
}
