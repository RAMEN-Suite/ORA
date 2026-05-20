import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  InputSignal,
  Signal,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { NgStyle, NgTemplateOutlet } from '@angular/common';
import { ResolvedAnnotation, ZeroPointAnnotationSegment } from '../../models/TextAnnotation';
import { MarginPositionHelper } from './annotation-zero-point.helper';

@Component({
  selector: 'annotation-zero-point',
  imports: [NgTemplateOutlet, NgStyle],
  templateUrl: './annotation-zero-point.component.html',
})
export class AnnotationZeroPointComponent {
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  private readonly markerWidth: number = 70;
  private readonly markerGap: number = 22;

  public readonly segment: InputSignal<ZeroPointAnnotationSegment> = input.required<ZeroPointAnnotationSegment>();

  private readonly anchor: Signal<ElementRef<HTMLElement> | undefined> = viewChild('anchor');
  private readonly marker: Signal<ElementRef<HTMLElement> | undefined> = viewChild('marker');

  protected readonly position: WritableSignal<Record<string, string>> = signal<Record<string, string>>({});
  protected readonly annotation: Signal<ResolvedAnnotation> = computed((): ResolvedAnnotation => this.segment().annotation);
  protected readonly behavior: Signal<string> = computed((): string => this.annotation().definition.behavior);
  protected readonly isMargin: Signal<boolean> = computed((): boolean => this.annotation().definition.placement === 'margin');

  protected readonly classes: Signal<string> = computed((): string => this.annotation().classes.join(' '));
  protected readonly markerClasses: Signal<string> = computed((): string => {
    if (!this.isMargin()) return this.classes();
    return ['inline', 'md:absolute', 'md:text-right', this.classes()].join(' ');
  });

  protected readonly displayLabel: Signal<string> = computed((): string => {
    const label: string = this.label();
    return label ? `[${label}]` : '';
  });

  protected readonly label: Signal<string> = computed((): string => {
    if (this.behavior() === 'page-break') return this.sourceString('n') ?? '';
    if (this.behavior() === 'gap') return this.gapLabel();
    return '';
  });

  protected readonly href: Signal<string | undefined> = computed((): string | undefined => {
    const property: string | undefined = this.annotation().definition.hrefProperty;
    return property ? this.sourceString(property) : undefined;
  });

  public constructor() {
    afterNextRender((): void => this.setupPositioning());
  }

  private setupPositioning(): void {
    this.updatePosition();

    const anchor: HTMLElement | undefined = this.anchor()?.nativeElement;
    if (!anchor) return;

    const root: HTMLElement | undefined = MarginPositionHelper.root(anchor);
    if (!root) return;

    const observer: ResizeObserver = new ResizeObserver((): void => {
      requestAnimationFrame((): void => this.updatePosition());
    });

    observer.observe(root);
    this.destroyRef.onDestroy((): void => observer.disconnect());
  }

  private updatePosition(): void {
    if (!this.isMargin()) return;

    const anchor: HTMLElement | undefined = this.anchor()?.nativeElement;
    const marker: HTMLElement | undefined = this.marker()?.nativeElement;

    if (!anchor || !marker) return;

    const position: Record<string, string> | undefined = MarginPositionHelper.resolve(anchor, marker, {
      markerWidth: this.markerWidth,
      markerGap: this.markerGap,
    });

    if (position) this.position.set(position);
  }

  private gapLabel(): string {
    const parts: string[] = ['quantity', 'unit', 'reason']
      .map((property: string): string | undefined => this.sourceString(property))
      .filter((value: string | undefined): value is string => !!value);

    return parts.length > 0 ? `[${parts.join(' ')}]` : '[…]';
  }

  private sourceString(property: string): string | undefined {
    const value: unknown = this.annotation().source[property];
    return typeof value === 'string' ? value : undefined;
  }
}
