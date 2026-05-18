import { Component, input, InputSignal } from '@angular/core';

@Component({
  selector: 'block-abstract',
  imports: [],
  template: '',
})
export abstract class AbstractBlock<T> {
  public readonly properties: InputSignal<T | undefined> = input();
  public readonly values: InputSignal<Record<string, unknown>> = input({});
}
