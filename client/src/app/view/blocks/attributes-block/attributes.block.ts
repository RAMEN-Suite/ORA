import { Component, computed, Signal } from '@angular/core';
import { Fieldset } from 'primeng/fieldset';
import { Node } from '../../../models/Node';
import { Utils } from '../../../utils/Utils';
import { ROUTES } from '../../../app.routes';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { AbstractBlock } from '../abstract.block';
import { AttributesItem, AttributesNodeItem, AttributesProps, AttributesValueItem } from '../../../models/config/DetailViews';

interface Attribute {
  label: string;
  values: AttributeValue[];
}

interface AttributeValue {
  value: string;
  href?: string[];
}

@Component({
  selector: 'block-attributes',
  imports: [Fieldset, RouterLink, TranslocoDirective],
  templateUrl: './attributes.block.html',
})
export class AttributesBlock extends AbstractBlock<AttributesProps> {
  protected readonly title: Signal<string> = computed((): string => this.resolveRequiredString('title'));

  protected readonly attributes: Signal<Attribute[]> = computed((): Attribute[] => {
    const items: AttributesItem[] = this.properties()?.items ?? [];
    const attributes: Attribute[] = items.map((item: AttributesItem): Attribute => this.resolveItem(item));
    return attributes.filter((attribute: Attribute): boolean => attribute.values.length > 0);
  });

  private resolveItem(item: AttributesItem): Attribute {
    if (item.kind === 'node') return this.resolveNodeItem(item);
    return this.resolveValueItem(item);
  }

  private resolveValueItem(item: AttributesValueItem): Attribute {
    const value: string = this.resolveString(item.value);
    const values: AttributeValue[] = value.trim() ? [{ value }] : [];
    return { label: item.label, values };
  }

  private resolveNodeItem(item: AttributesNodeItem): Attribute {
    const nodes: Node[] = this.resolveNodes(item.value);
    const values: AttributeValue[] = [];

    for (const node of nodes) {
      const nodeValue: AttributeValue = this.resolveNodeValue(node, item);
      if (nodeValue.value.trim()) values.push(nodeValue);
    }

    return { label: item.label, values };
  }

  private resolveNodeValue(node: Node, item: AttributesNodeItem): AttributeValue {
    const value: string = Utils.parseString(node[item.property]) ?? '';
    const href: string[] | undefined = item.isLinked ? this.resolveHref(node) : undefined;
    return { value, href };
  }

  private resolveHref(node: Node): string[] {
    const uuid: string | undefined = Utils.parseString(node['uuid']);
    if (!uuid) return [];

    if (node._labels.includes('Collection')) return ['/', ROUTES.COLLECTION, uuid];
    if (node._labels.includes('Entity')) return ['/', ROUTES.ENTITY, uuid];
    return ['/', ROUTES.IDENTIFIER, uuid];
  }
}
