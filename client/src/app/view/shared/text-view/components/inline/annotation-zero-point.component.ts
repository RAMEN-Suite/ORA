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
import { BlockValueResolver } from '../../../../../resolvers/block-value.resolver';
import { AnnotationValue } from '../../models/Annotations';
import { TextAnnotation, ZeroPointAnnotation, ZeroPointSegment } from '../../models/TextAnnotation';
import { MarginPositionStyle, MarginPositionUtils } from '../../utils/MarginPositionUtils';

const MARKER_WIDTH: number = 70;
const MARKER_GAP: number = 22;
const MARGIN_CLASSES: string[] = ['inline', 'md:absolute', 'md:text-right'];

@Component({
  selector: 'annotation-zero-point',
  imports: [NgStyle],
  templateUrl: './annotation-zero-point.component.html',
  host: { class: 'contents' },
})
export class AnnotationZeroPointComponent {
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  public readonly segment: InputSignal<ZeroPointSegment> = input.required<ZeroPointSegment>();

  private readonly anchor: Signal<ElementRef<HTMLElement> | undefined> = viewChild('anchor');
  private readonly marker: Signal<ElementRef<HTMLElement> | undefined> = viewChild('marker');

  protected readonly position: WritableSignal<MarginPositionStyle> = signal<MarginPositionStyle>({});
  protected readonly annotation: Signal<ZeroPointAnnotation> = computed((): ZeroPointAnnotation => {
    return this.segment().annotation;
  });

  protected readonly isLineBreak: Signal<boolean> = computed((): boolean => {
    return this.annotation().definition.behavior === 'line-break';
  });
  protected readonly isMargin: Signal<boolean> = computed((): boolean => {
    return this.annotation().definition.placement === 'margin';
  });

  protected readonly classes: Signal<string> = computed((): string => {
    return this.annotation().classes.join(' ');
  });
  protected readonly markerClasses: Signal<string> = computed((): string => {
    return this.isMargin() ? [...MARGIN_CLASSES, this.classes()].filter(Boolean).join(' ') : this.classes();
  });

  protected readonly label: Signal<string> = computed((): string => this.labelValues().join(' '));
  protected readonly displayLabel: Signal<string> = computed((): string => {
    const label: string = this.label();
    return label ? `[${label}]` : '';
  });

  public constructor() {
    afterNextRender((): void => this.setupMarkerPosition());
  }

  private setupMarkerPosition(): void {
    this.updateMarkerPosition();

    const anchor: HTMLElement | undefined = this.anchor()?.nativeElement;
    const root: HTMLElement | undefined = anchor ? MarginPositionUtils.root(anchor) : undefined;
    if (!root) return;

    const observer: ResizeObserver = new ResizeObserver((): void => {
      requestAnimationFrame((): void => this.updateMarkerPosition());
    });

    observer.observe(root);
    this.destroyRef.onDestroy((): void => observer.disconnect());
  }

  private updateMarkerPosition(): void {
    if (!this.isMargin()) return;

    const anchor: HTMLElement | undefined = this.anchor()?.nativeElement;
    const marker: HTMLElement | undefined = this.marker()?.nativeElement;
    if (!anchor || !marker) return;

    const position: MarginPositionStyle | undefined = MarginPositionUtils.resolve(anchor, marker, {
      markerWidth: MARKER_WIDTH,
      markerGap: MARKER_GAP,
    });

    if (position) this.position.set(position);
  }

  private labelValues(): string[] {
    const labels: AnnotationValue[] = this.annotation().definition.label ?? [];
    const source: TextAnnotation = this.annotation().source;

    const resolved: string[] = labels.map((value: AnnotationValue): string => BlockValueResolver.resolveString(value, source));
    return resolved.filter((value: string): boolean => value.trim().length > 0);
  }
}
