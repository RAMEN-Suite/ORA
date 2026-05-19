import { Component, computed, forwardRef, input, InputSignal, Signal, viewChild } from '@angular/core';
import { InteractionAnnotationSegment, ResolvedAnnotation } from '../../models/TextAnnotation';
import { Popover } from 'primeng/popover';
import { AnnotationSegmentsComponent } from '../annotation-segments/annotation-segments.component';
import { Tooltip } from 'primeng/tooltip';
import { AnnotationPopoverComponent } from '../annotation-popover/annotation-popover.component';
import { AnnotationBehavior } from '../../models/Annotations';

@Component({
  selector: 'annotation-interaction',
  imports: [Popover, Tooltip, AnnotationPopoverComponent, forwardRef(() => AnnotationSegmentsComponent)],
  templateUrl: './annotation-interaction.component.html',
})
export class AnnotationInteractionComponent {
  public readonly segment: InputSignal<InteractionAnnotationSegment> = input.required<InteractionAnnotationSegment>();
  private readonly popover: Signal<Popover | undefined> = viewChild(Popover);

  protected readonly classes: Signal<string> = computed((): string => {
    const classes: string[] = this.segment().annotations.flatMap((a: ResolvedAnnotation): string[] => a.classes);
    return Array.from(new Set(classes)).join(' ');
  });

  protected readonly tooltip: Signal<string | undefined> = computed((): string | undefined => {
    const annotation: ResolvedAnnotation | undefined = this.findBehavior('tooltip');
    const property: string | undefined = annotation?.definition.tooltipProperty;
    return this.sourceString(annotation, property);
  });

  protected readonly isTooltip: Signal<boolean> = computed((): boolean => this.hasBehavior('tooltip'));
  protected readonly isLink: Signal<boolean> = computed((): boolean => this.hasBehavior('external-link'));

  protected readonly href: Signal<string | undefined> = computed((): string | undefined => {
    const annotation: ResolvedAnnotation | undefined = this.findBehavior('external-link');
    const property: string | undefined = annotation?.definition.hrefProperty;
    return this.sourceString(annotation, property);
  });

  protected togglePopover(event: Event): void {
    if (this.isTooltip() || this.isLink()) return;
    this.popover()?.toggle(event);
  }

  private hasBehavior(behavior: AnnotationBehavior): boolean {
    return this.findBehavior(behavior) !== undefined;
  }

  private findBehavior(behavior: AnnotationBehavior): ResolvedAnnotation | undefined {
    return this.segment().annotations.find((a: ResolvedAnnotation): boolean => a.definition.behavior === behavior);
  }

  private sourceString(annotation: ResolvedAnnotation | undefined, property: string | undefined): string | undefined {
    if (!annotation || !property) return undefined;
    const value: unknown = annotation.source[property];
    return typeof value === 'string' ? value : undefined;
  }
}
