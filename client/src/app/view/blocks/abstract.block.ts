import { Component, input, InputSignal } from '@angular/core';
import { BlockValueResolver } from '../../resolvers/block-value.resolver';
import { Binding } from '../../models/config/Config';
import { Node } from '../../models/Node';

@Component({ template: '' })
export abstract class AbstractBlock<TProps extends object = object> {
  public readonly properties: InputSignal<TProps | undefined> = input<TProps>();
  public readonly values: InputSignal<Record<string, unknown>> = input<Record<string, unknown>>({});

  protected resolveString(binding: Binding | undefined): string {
    return BlockValueResolver.resolveString(binding, this.values());
  }

  protected resolveOptionalString(key: keyof TProps): string {
    return this.resolveText(this.optionalProperty(key));
  }

  protected resolveRequiredString(key: keyof TProps): string {
    return this.resolveText(this.requiredProperty(key));
  }

  protected resolveNodes(binding: Binding | undefined): Node[] {
    return BlockValueResolver.resolveNodes(binding, this.values());
  }

  protected resolveOptionalNodes(key: keyof TProps): Node[] {
    return this.resolveNodeList(this.optionalProperty(key));
  }

  protected resolveRequiredNodes(key: keyof TProps): Node[] {
    return this.resolveNodeList(this.requiredProperty(key));
  }

  private resolveText(value: unknown): string {
    if (typeof value === 'string') return value;
    if (this.isBinding(value)) return this.resolveString(value);
    return '';
  }

  private resolveNodeList(value: unknown): Node[] {
    if (this.isBinding(value)) return this.resolveNodes(value);
    return [];
  }

  private optionalProperty(key: keyof TProps): unknown {
    return this.properties()?.[key];
  }

  private requiredProperty(key: keyof TProps): unknown {
    const value: unknown = this.optionalProperty(key);

    if (value === undefined || value === null) {
      console.warn(`Missing ${this.constructor.name} Property: ${String(key)}`);
      return undefined;
    }

    return value;
  }

  private isBinding(value: unknown): value is Binding {
    return typeof value === 'object' && value !== null && 'path' in value;
  }
}
