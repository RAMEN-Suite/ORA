import { Component, computed, Signal } from '@angular/core';
import { Fieldset } from 'primeng/fieldset';
import { Node } from '../../../models/Node';
import { Utils } from '../../../utils/Utils';
import { ROUTES } from '../../../constants/ROUTES';
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
  isTranslatable?: boolean;
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
    const attributes: Attribute[] = [];

    for (const item of items) {
      const attribute: Attribute = this.resolveItem(item);
      if (attribute.values.length > 0) attributes.push(attribute);
    }

    return attributes;
  });

  private resolveItem(item: AttributesItem): Attribute {
    if (item.kind === 'node') return this.resolveNodeItem(item);
    return this.resolveValueItem(item);
  }

  private resolveValueItem(item: AttributesValueItem): Attribute {
    const value: string = this.resolveString(item.value);
    if (value.trim()) return { label: item.label, values: [{ value }] };

    const values: AttributeValue[] = item.isEmptyVisible ? [this.resolveEmptyValue(item)] : [];
    return { label: item.label, values };
  }

  private resolveNodeItem(item: AttributesNodeItem): Attribute {
    const nodes: Node[] = this.resolveNodes(item.value);
    const values: AttributeValue[] = [];

    for (const node of nodes) {
      const nodeValue: AttributeValue = this.resolveNodeValue(node, item);
      if (nodeValue.value.trim()) values.push(nodeValue);
    }

    if (values.length === 0 && item.isEmptyVisible) {
      values.push(this.resolveEmptyValue(item));
    }

    return { label: item.label, values };
  }

  private resolveNodeValue(node: Node, item: AttributesNodeItem): AttributeValue {
    const value: string = Utils.parseString(node[item.property]) ?? '';
    const href: string[] | undefined = item.isLinked ? this.resolveHref(node) : undefined;
    return { value, href };
  }

  private resolveEmptyValue(item: AttributesItem): AttributeValue {
    return { value: item.emptyLabel ?? this.EMPTY_LABEL, isTranslatable: true };
  }

  private resolveHref(node: Node): string[] {
    const uuid: string | undefined = Utils.parseString(node['uuid']);
    if (!uuid) return [];

    if (node._labels.includes('Collection')) return ['/', ROUTES.COLLECTION, uuid];
    if (node._labels.includes('Entity')) return ['/', ROUTES.ENTITY, uuid];
    return ['/', ROUTES.IDENTIFIER, uuid];
  }

  private readonly EMPTY_LABEL: string = 'app.blocks.attributes.missing';
}
