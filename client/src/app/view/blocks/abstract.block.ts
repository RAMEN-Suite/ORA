import { Component, inject, input, InputSignal } from '@angular/core';
import { BlockValueResolver } from '../../resolvers/block-value.resolver';
import { Binding, Template } from '../../models/config/Config';
import { Node } from '../../models/Node';
import { TranslocoService } from '@jsverse/transloco';

@Component({ template: '', host: { class: 'contents' } })
export abstract class AbstractBlock<TProperties extends object = object> {
  protected readonly translocoService: TranslocoService = inject(TranslocoService);

  public readonly properties: InputSignal<TProperties | undefined> = input<TProperties>();
  public readonly values: InputSignal<Record<string, unknown>> = input<Record<string, unknown>>({});

  protected resolveTemplate(value: Template | undefined): string {
    if (!value) return '';
    const params: Record<string, string> = {};

    for (const [key, templateValue] of Object.entries(value.values ?? {})) {
      const resolved: string = this.resolveTexts(templateValue).join(', ');
      params[key] = resolved ? this.translocoService.translate(resolved) : '';
    }

    return this.translocoService.translate(value.template, params);
  }

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

  private isBinding(value: unknown): value is Binding {
    return typeof value === 'object' && value !== null && 'path' in value && typeof value.path === 'string';
  }
}
