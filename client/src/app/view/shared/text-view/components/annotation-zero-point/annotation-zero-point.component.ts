import { Component, computed, input, InputSignal, Signal } from '@angular/core';
import { ResolvedAnnotation, ZeroPointAnnotationSegment } from '../../models/TextAnnotation';

@Component({
  selector: 'annotation-zero-point',
  imports: [],
  templateUrl: './annotation-zero-point.component.html',
})
export class AnnotationZeroPointComponent {
  public readonly segment: InputSignal<ZeroPointAnnotationSegment> = input.required<ZeroPointAnnotationSegment>();

  protected readonly annotation: Signal<ResolvedAnnotation> = computed((): ResolvedAnnotation => this.segment().annotation);
  protected readonly classes: Signal<string> = computed((): string => this.annotation().classes.join(' '));

  protected readonly label: Signal<string> = computed((): string => {
    const annotation: ResolvedAnnotation = this.annotation();
    if (annotation.definition.behavior === 'page-break') return this.sourceString('n') ?? '';
    if (annotation.definition.behavior === 'gap') return this.gapLabel();
    return '';
  });

  protected readonly href: Signal<string | undefined> = computed((): string | undefined => {
    return this.sourceString('facs');
  });

  private gapLabel(): string {
    const quantity: string | undefined = this.sourceString('quantity');
    const unit: string | undefined = this.sourceString('unit');
    const reason: string | undefined = this.sourceString('reason');
    const parts: string[] = [quantity, unit, reason].filter((part: string | undefined): part is string => !!part);
    return parts.length > 0 ? `[${parts.join(' ')}]` : '[…]';
  }

  private sourceString(property: string): string | undefined {
    const value: unknown = this.annotation().source[property];
    return typeof value === 'string' ? value : undefined;
  }
}
