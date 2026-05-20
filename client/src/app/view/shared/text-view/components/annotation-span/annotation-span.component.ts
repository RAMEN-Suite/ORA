import { Component, computed, forwardRef, input, InputSignal, signal, Signal, viewChild, WritableSignal } from '@angular/core';
import { Popover } from 'primeng/popover';
import { AnnotationSpanSegment, ResolvedAnnotation } from '../../models/TextAnnotation';
import { AnnotationPopoverComponent } from '../annotation-popover/annotation-popover.component';
import { AnnotationSegmentsComponent } from '../annotation-segments/annotation-segments.component';

@Component({
  selector: 'annotation-span',
  imports: [Popover, AnnotationPopoverComponent, forwardRef(() => AnnotationSegmentsComponent)],
  templateUrl: './annotation-span.component.html',
  host: { class: 'contents' },
})
export class AnnotationSpanComponent {
  public readonly segment: InputSignal<AnnotationSpanSegment> = input.required<AnnotationSpanSegment>();
  private readonly popoverComponent: Signal<Popover | undefined> = viewChild(Popover);

  protected readonly classes: Signal<string> = computed((): string => {
    const classes: string[] = this.segment().annotations.flatMap((a: ResolvedAnnotation): string[] => a.classes);
    return Array.from(new Set(classes)).join(' ');
  });

  protected readonly isPopoverOpen: WritableSignal<boolean> = signal(false);
  protected readonly hasPopover: Signal<boolean> = computed((): boolean => {
    return this.segment().annotations.some((a: ResolvedAnnotation): boolean => a.definition.behavior === 'popover');
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
