import { Component, input, InputSignal } from '@angular/core';
import { BlockValueResolver } from '../../resolvers/block-value.resolver';
import { Binding } from '../../models/config/Config';
import { Node } from '../../models/Node';

@Component({ template: '', host: { class: 'contents' } })
export abstract class AbstractBlock<TProps extends object = object> {
  public readonly properties: InputSignal<TProps | undefined> = input<TProps>();
  public readonly values: InputSignal<Record<string, unknown>> = input<Record<string, unknown>>({});

  protected resolveText(value: Binding | string | undefined): string {
    if (typeof value === 'string') return value;
    if (this.isBinding(value)) return BlockValueResolver.resolveString(value, this.values());
    return '';
  }

  protected resolveTexts(value: Binding | string | undefined): string[] {
    if (typeof value === 'string') return value ? [value] : [];
    if (this.isBinding(value)) return BlockValueResolver.resolveStrings(value, this.values());
    return [];
  }

  protected resolveNode(value: Binding | undefined): Node | undefined {
    if (!this.isBinding(value)) return undefined;
    return BlockValueResolver.resolveNode(value, this.values());
  }

  protected resolveNodes(value: Binding | undefined): Node[] {
    if (!this.isBinding(value)) return [];
    return BlockValueResolver.resolveNodes(value, this.values());
  }

  protected requireValue<T>(value: T | undefined | null, name: string): T | undefined {
    if (value !== undefined && value !== null) return value;

    console.warn(`Missing ${this.constructor.name} property: ${name}`);
    return undefined;
  }

  private isBinding(value: unknown): value is Binding {
    return typeof value === 'object' && value !== null && 'path' in value && typeof value.path === 'string';
  }
}
