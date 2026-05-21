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
import { BlockValueResolver } from '../../../../resolvers/block-value.resolver';
import { AnnotationValue, ZeroPointDefinition } from '../../../../models/annotations/Annotations';
import { TextAnnotation, ZeroPointAnnotation, ZeroPointSegment } from '../../../../models/annotations/TextAnnotation';
import { MarginPositionOptions, MarginPositionStyle, MarginPositionUtils } from '../../../../utils/MarginPositionUtils';

const TEXT_VIEW_ROOT = '[data-text-view-root]';
const TEXT_VIEW_CONTENT = '[data-text-view-content]';

const MARKER_WIDTH: number = 70;
const MARKER_GAP: number = 22;
const MARGIN_STYLE_CLASSES: string[] = ['inline', 'md:absolute', 'md:text-right'];

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

  protected readonly zeroPoint: Signal<ZeroPointAnnotation> = computed(() => this.segment().annotation);
  protected readonly definition: Signal<ZeroPointDefinition> = computed(() => this.zeroPoint().definition);

  protected readonly isLineBreak: Signal<boolean> = computed((): boolean => this.definition().behavior === 'line-break');
  protected readonly isMargin: Signal<boolean> = computed((): boolean => this.definition().placement === 'margin');

  protected readonly classes: Signal<string> = computed((): string => this.zeroPoint().classes.join(' '));
  protected readonly marginPosition: WritableSignal<MarginPositionStyle> = signal<MarginPositionStyle>({});
  protected readonly marginClasses: Signal<string> = computed((): string => MARGIN_STYLE_CLASSES.join(' '));

  protected readonly label: Signal<string> = computed((): string => this.labelValues().join(' '));
  protected readonly displayLabel: Signal<string> = computed((): string => (this.label() ? `[${this.label()}]` : ''));

  public constructor() {
    afterNextRender((): void => this.initMarginPosition());
  }

  private labelValues(): string[] {
    const labels: AnnotationValue[] = this.zeroPoint().definition.label ?? [];
    const source: TextAnnotation = this.zeroPoint().source;

    const resolved: string[] = labels.map((value: AnnotationValue): string => BlockValueResolver.resolveString(value, source));
    return resolved.filter((value: string): boolean => value.trim().length > 0);
  }

  private initMarginPosition(): void {
    this.updateMarginPosition();

    const anchor: HTMLElement | undefined = this.anchor()?.nativeElement;
    const root: HTMLElement | undefined = anchor ? MarginPositionUtils.root(anchor, TEXT_VIEW_ROOT) : undefined;
    if (!root) return;

    const observer: ResizeObserver = this.createObserver();
    observer.observe(root);
    this.destroyRef.onDestroy((): void => observer.disconnect());
  }

  private updateMarginPosition(): void {
    if (!this.isMargin()) return;

    const anchor: HTMLElement | undefined = this.anchor()?.nativeElement;
    const marker: HTMLElement | undefined = this.marker()?.nativeElement;
    if (!anchor || !marker) return;

    const root: HTMLElement | undefined = MarginPositionUtils.root(anchor, TEXT_VIEW_ROOT);
    const content: HTMLElement | undefined = root ? MarginPositionUtils.content(root, TEXT_VIEW_CONTENT) : undefined;
    if (!root || !content) return;

    const options: MarginPositionOptions = { width: MARKER_WIDTH, gap: MARKER_GAP };
    const position: MarginPositionStyle = MarginPositionUtils.resolve(anchor, marker, root, content, options);
    this.marginPosition.set(position);
  }

  private createObserver(): ResizeObserver {
    return new ResizeObserver((): void => void requestAnimationFrame((): void => this.updateMarginPosition()));
  }
}
