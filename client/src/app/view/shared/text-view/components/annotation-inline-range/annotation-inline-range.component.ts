import { Component, computed, forwardRef, input, InputSignal, signal, Signal, viewChild, WritableSignal } from '@angular/core';
import { Popover } from 'primeng/popover';
import { InlineRangeSegment, ResolvedInlineAnnotation } from '../../models/TextAnnotation';
import { AnnotationSegmentsComponent } from '../annotation-segments/annotation-segments.component';
import { ActivateDirective } from '../../../../../directives/activate.directive';
import { AnnotationPopoverComponent } from '../annotation-popover/annotation-popover.component';

@Component({
  selector: 'annotation-inline-range',
  imports: [
    Popover,
    ActivateDirective,
    forwardRef(() => AnnotationSegmentsComponent),
    ActivateDirective,
    AnnotationPopoverComponent,
  ],
  templateUrl: './annotation-inline-range.component.html',
  host: { class: 'contents' },
})
export class AnnotationInlineRangeComponent {
  public readonly segment: InputSignal<InlineRangeSegment> = input.required<InlineRangeSegment>();

  private readonly popoverComponent: Signal<Popover | undefined> = viewChild(Popover);

  protected readonly isPopoverOpen: WritableSignal<boolean> = signal(false);
  protected readonly hasPopover: Signal<boolean> = computed((): boolean => this.popoverAnnotations().length > 0);

  protected readonly popoverAnnotations: Signal<ResolvedInlineAnnotation[]> = computed((): ResolvedInlineAnnotation[] => {
    return this.segment().annotations.filter((a: ResolvedInlineAnnotation): boolean => a.definition.behavior === 'popover');
  });

  protected readonly classes: Signal<string> = computed((): string => {
    const classes: string[] = this.segment().annotations.flatMap((a: ResolvedInlineAnnotation): string[] => a.classes);
    return Array.from(new Set(classes)).join(' ');
  });

  protected handleTogglePopover(event: Event): void {
    if (!this.hasPopover()) return;

    event.preventDefault();
    event.stopPropagation();

    this.isPopoverOpen.set(true);
    this.popoverComponent()?.toggle(event);
  }

  protected handleHidePopover(): void {
    this.isPopoverOpen.set(false);
  }
}
