import { Component, input, InputSignal } from '@angular/core';
import { MetadataItem, MetadataProperties } from '../../../models/Config';
import { BlockValueResolver } from '../../../resolvers/block-value.resolver';
import { Fieldset } from 'primeng/fieldset';

@Component({
  selector: 'block-metadata',
  imports: [Fieldset],
  templateUrl: './metadata.block.html',
})
export class MetadataBlock {
  public readonly props: InputSignal<MetadataProperties> = input.required();
  public readonly values: InputSignal<Record<string, unknown>> = input({});

  protected title(): string {
    return BlockValueResolver.resolveString(this.props().title, this.values());
  }

  protected label(item: MetadataItem): string {
    return BlockValueResolver.resolveString(item.label, this.values());
  }

  protected value(item: MetadataItem): string {
    const value: unknown = BlockValueResolver.resolve(item.value, this.values());
    return BlockValueResolver.stringify(value);
  }
}
