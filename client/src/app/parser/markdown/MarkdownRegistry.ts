import { EnvironmentInjector } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { Image } from 'primeng/image';

export class MarkdownRegistry {
  private static registered: boolean = false;

  public static register(injector: EnvironmentInjector): void {
    if (this.registered) return;
    this.registerPrimeImage(injector);
    this.registered = true;
  }

  private static registerPrimeImage(injector: EnvironmentInjector): void {
    const elementName: string = 'md-p-image';
    if (customElements.get(elementName)) return;
    customElements.define(elementName, createCustomElement(Image, { injector }));
  }
}
