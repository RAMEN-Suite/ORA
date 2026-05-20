import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  InputSignal,
  signal,
  Signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { NgStyle } from '@angular/common';
import { ResolvedAnnotation, ZeroPointAnnotationSegment } from '../../models/TextAnnotation';
import { MarginPositionStyle, MarginPositionUtils } from '../../utils/MarginPositionUtils';

@Component({
  selector: 'annotation-zero-point',
  imports: [NgStyle],
  templateUrl: './annotation-zero-point.component.html',
  host: { class: 'contents' },
})
export class AnnotationZeroPointComponent {
  private static readonly markerWidth: number = 70;
  private static readonly markerGap: number = 22;
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  public readonly segment: InputSignal<ZeroPointAnnotationSegment> = input.required<ZeroPointAnnotationSegment>();

  private readonly anchor: Signal<ElementRef<HTMLElement> | undefined> = viewChild('anchor');
  private readonly marker: Signal<ElementRef<HTMLElement> | undefined> = viewChild('marker');

  protected readonly position: WritableSignal<MarginPositionStyle> = signal<MarginPositionStyle>({});
  protected readonly annotation: Signal<ResolvedAnnotation> = computed((): ResolvedAnnotation => this.segment().annotation);
  protected readonly isMargin: Signal<boolean> = computed((): boolean => this.annotation().definition.placement === 'margin');
  protected readonly classes: Signal<string> = computed((): string => this.annotation().classes.join(' '));

  protected readonly markerClasses: Signal<string> = computed((): string => {
    return this.isMargin() ? ['inline', 'md:absolute', 'md:text-right', this.classes()].join(' ') : this.classes();
  });

  protected readonly label: Signal<string> = computed((): string => {
    switch (this.annotation().definition.behavior) {
      case 'page-break':
        return this.sourceString('n');
      case 'gap':
        return this.gapLabel();
      default:
        return '';
    }
  });

  protected readonly displayLabel: Signal<string> = computed((): string => {
    const label: string = this.label();
    return label ? `[${label}]` : '';
  });

  public constructor() {
    afterNextRender((): void => this.setupPositioning());
  }

  private setupPositioning(): void {
    this.updatePosition();

    const anchor: HTMLElement | undefined = this.anchor()?.nativeElement;
    const root: HTMLElement | undefined = anchor ? MarginPositionUtils.root(anchor) : undefined;
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

    const position: MarginPositionStyle | undefined = MarginPositionUtils.resolve(anchor, marker, {
      markerWidth: AnnotationZeroPointComponent.markerWidth,
      markerGap: AnnotationZeroPointComponent.markerGap,
    });

    if (position) this.position.set(position);
  }

  private gapLabel(): string {
    const parts: string[] = ['quantity', 'unit', 'reason']
      .map((property: string): string => this.sourceString(property))
      .filter(Boolean);

    return parts.length > 0 ? `[${parts.join(' ')}]` : '[…]';
  }

  private sourceString(property: string): string {
    const value: unknown = this.annotation().source[property];
    return typeof value === 'string' ? value.trim() : '';
  }
}
