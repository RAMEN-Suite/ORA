import { Component, computed, Signal } from '@angular/core';
import { BlockValueResolver } from '../../../resolvers/block-value.resolver';
import { Fieldset } from 'primeng/fieldset';
import { Node } from '../../../models/Node';
import { Utils } from '../../../utils/Utils';
import { ROUTES } from '../../../app.routes';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { AbstractBlock } from '../abstract.block';
import { MetadataItem, MetadataNodeItem, MetadataProps, MetadataValueItem } from '../../../models/config/DetailViews';
import { Binding } from '../../../models/config/Config';

interface Metadata {
  label: string;
  value: string;
  href?: string[];
}

@Component({
  selector: 'block-metadata',
  imports: [Fieldset, RouterLink, TranslocoDirective],
  templateUrl: './metadata.block.html',
})
export class MetadataBlock extends AbstractBlock<MetadataProps> {
  protected readonly title: Signal<string> = computed((): string => {
    const title: Binding | undefined = this.properties()?.title;
    if (!title) console.warn('Missing Metadata Property: title');
    return BlockValueResolver.resolveString(title, this.values());
  });

  protected readonly metadata: Signal<Metadata[]> = computed((): Metadata[] => {
    const items: MetadataItem[] = this.properties()?.items ?? [];
    return items.flatMap((item: MetadataItem): Metadata[] => {
      if (item.kind === 'node') return this.resolveNodeItem(item);
      return [this.resolveValueItem(item)];
    });
  });

  private resolveValueItem(item: MetadataValueItem): Metadata {
    const value: string = BlockValueResolver.resolveString(item.value, this.values());
    return { label: item.label, value };
  }

  private resolveNodeItem(item: MetadataNodeItem): Metadata[] {
    const nodes: Node[] = BlockValueResolver.resolveNodes(item.value, this.values());

    return nodes.map((node: Node): Metadata => {
      const value: string = Utils.parseString(node[item.property]) ?? '';
      const href: string[] | undefined = item.isLinked ? this.resolveHref(node) : undefined;
      return { label: item.label, value, href };
    });
  }

  private resolveHref(node: Node): string[] {
    const uuid: string | undefined = Utils.parseString(node['uuid']);
    if (!uuid) return [];

    if (node._labels.includes('Collection')) return ['/', ROUTES.COLLECTION, uuid];
    if (node._labels.includes('Entity')) return ['/', ROUTES.ENTITY, uuid];
    return ['/', ROUTES.IDENTIFIER, uuid];
  }
}
