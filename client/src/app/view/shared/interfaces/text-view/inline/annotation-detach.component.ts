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
import { AnnotationValue } from '../../../../../models/config/Annotations';
import { TextAnnotation } from '../../../../../models/annotations/TextAnnotation';
import { MarginPositionOptions, MarginPositionStyle, MarginPositionUtils } from '../../../../../utils/MarginPositionUtils';
import { AnnotationDialogComponent } from '../dialog/annotation-dialog.component';
import { InlineAnnotation } from '../../../../../models/annotations/ResolvedAnnotation';

const TEXT_VIEW_ROOT = '[data-text-view-root]';
const TEXT_VIEW_CONTENT = '[data-text-view-content]';

const DETACHED_WIDTH: number = 70;
const DETACHED_GAP: number = 22;
const MARGIN_STYLE_CLASSES: string[] = ['inline', 'md:absolute', 'md:text-right'];

@Component({
  selector: 'annotation-detach',
  imports: [NgStyle, AnnotationDialogComponent],
  templateUrl: './annotation-detach.component.html',
  host: { class: 'contents' },
})
export class AnnotationDetachComponent {
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  private readonly anchor: Signal<ElementRef<HTMLElement> | undefined> = viewChild('anchor');
  private readonly detachedElement: Signal<ElementRef<HTMLElement> | undefined> = viewChild('detached');

  public readonly annotation: InputSignal<InlineAnnotation> = input.required<InlineAnnotation>();

  protected readonly classes: Signal<string> = computed((): string => this.annotation().classes.join(' '));
  protected readonly isMargin: Signal<boolean> = computed((): boolean => this.annotation().definition.placement === 'margin');
  protected readonly marginPosition: WritableSignal<MarginPositionStyle> = signal<MarginPositionStyle>({});
  protected readonly marginClasses: Signal<string> = computed((): string => MARGIN_STYLE_CLASSES.join(' '));

  protected readonly label: Signal<string> = computed((): string => this.labelValues().join(' '));
  protected readonly displayLabel: Signal<string> = computed((): string => (this.label() ? `[${this.label()}]` : '↗'));

  public constructor() {
    afterNextRender((): void => this.initMarginPosition());
  }

  private labelValues(): string[] {
    const labels: AnnotationValue[] = this.annotation().definition.label ?? [];
    const source: TextAnnotation = this.annotation().source;

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
    const detached: HTMLElement | undefined = this.detachedElement()?.nativeElement;
    if (!anchor || !detached) return;

    const root: HTMLElement | undefined = MarginPositionUtils.root(anchor, TEXT_VIEW_ROOT);
    const content: HTMLElement | undefined = root ? MarginPositionUtils.content(root, TEXT_VIEW_CONTENT) : undefined;
    if (!root || !content) return;

    const options: MarginPositionOptions = { width: DETACHED_WIDTH, gap: DETACHED_GAP };
    const position: MarginPositionStyle = MarginPositionUtils.resolve(anchor, detached, root, content, options);
    this.marginPosition.set(position);
  }

  private createObserver(): ResizeObserver {
    return new ResizeObserver((): void => void requestAnimationFrame((): void => this.updateMarginPosition()));
  }
}
