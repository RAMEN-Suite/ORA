import { Injectable } from '@angular/core';
import { TranslocoTranspiler } from '@jsverse/transloco';
import Handlebars, { TemplateDelegate } from 'handlebars';

interface TranspileOptions {
  value: unknown;
  params?: Record<string, unknown>;
}

@Injectable()
export class Transpiler implements TranslocoTranspiler {
  private readonly handlebars = Handlebars.create();
  private readonly cache: Map<string, TemplateDelegate> = new Map<string, TemplateDelegate>();

  public constructor() {
    this.registerHelpers();
  }

  public transpile({ value, params = {} }: TranspileOptions): unknown {
    return typeof value === 'string' ? this.compile(value)(params) : value;
  }

  private registerHelpers(): void {
    this.handlebars.registerHelper('eq', (left: unknown, right: unknown): boolean => String(left) === String(right));
  }

  private compile(value: string): TemplateDelegate {
    let template: TemplateDelegate | undefined = this.cache.get(value);

    if (!template) {
      template = this.handlebars.compile(value);
      this.cache.set(value, template);
    }

    return template;
  }
}
