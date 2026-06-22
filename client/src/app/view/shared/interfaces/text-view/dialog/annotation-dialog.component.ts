import {
  Component,
  computed,
  ElementRef,
  inject,
  input,
  InputSignal,
  Signal,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Divider } from 'primeng/divider';
import { Popover } from 'primeng/popover';
import { TranslocoDirective } from '@jsverse/transloco';
import { ActivateDirective } from '../../../../../directives/activate.directive';
import { AnnotationDialogItemComponent } from './annotation-dialog-item.component';
import { AnnotationDialogController } from './annotation-dialog.controller';
import { InlineAnnotation } from '../../../../../models/annotations/ResolvedAnnotation';

@Component({
  selector: 'annotation-dialog',
  imports: [
    ActivateDirective,
    AnnotationDialogItemComponent,
    Button,
    Dialog,
    Divider,
    NgTemplateOutlet,
    Popover,
    TranslocoDirective,
  ],
  providers: [AnnotationDialogController],
  templateUrl: './annotation-dialog.component.html',
  host: { class: 'contents' },
})
export class AnnotationDialogComponent {
  protected readonly controller: AnnotationDialogController = inject(AnnotationDialogController);
  protected readonly parent: AnnotationDialogComponent | null = inject(AnnotationDialogComponent, {
    optional: true,
    skipSelf: true,
  });

  private readonly popover: Signal<Popover | undefined> = viewChild(Popover);
  private readonly anchor: Signal<ElementRef<HTMLElement> | undefined> = viewChild<ElementRef<HTMLElement>>('anchor');

  public readonly classes: InputSignal<string> = input<string>('');
  public readonly annotations: InputSignal<InlineAnnotation[]> = input<InlineAnnotation[]>([]);

  protected readonly isPopoverOpen: WritableSignal<boolean> = signal(false);
  protected readonly isDialogOpen: WritableSignal<boolean> = signal(false);

  private readonly isJumpHighlighted: WritableSignal<boolean> = signal(false);
  private readonly activeAnnotationIds: WritableSignal<string[]> = signal<string[]>([]);

  protected readonly selected: Signal<InlineAnnotation[]> = computed((): InlineAnnotation[] => this.getDialogAnnotations());
  protected readonly isInteractive: Signal<boolean> = computed((): boolean => this.selected().length > 0);
  protected readonly triggerClasses: Signal<string> = computed((): string => this.getTriggerClasses());
  protected readonly isHighlighted: Signal<boolean> = computed((): boolean => this.getIsHighlighted());

  public ensureDialogOpen(): void {
    this.parent?.ensureDialogOpen();
    this.showDialog();
  }

  public setActiveAnnotations(annotations: InlineAnnotation[], active: boolean): void {
    const ids: string[] = annotations.map((annotation: InlineAnnotation): string => annotation.uuid);
    const idSet: Set<string> = new Set<string>(ids);

    this.activeAnnotationIds.update((current: string[]): string[] => {
      if (active) return Array.from(new Set([...current, ...ids]));
      return current.filter((id: string): boolean => !idSet.has(id));
    });
  }

  public handleScrollToAnnotation(uuid?: string): void {
    if (uuid && !this.hasAnnotation(uuid)) return;
    this.parent?.ensureDialogOpen();

    const element: HTMLElement | undefined = this.anchor()?.nativeElement;
    if (!element) return;

    element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    element.focus({ preventScroll: true });
    this.highlightTemporarily();
  }

  protected async handleOpenAnnotation(event: Event): Promise<void> {
    if (!this.isInteractive()) return;
    event.preventDefault();
    event.stopPropagation();

    const isInsideDialog: boolean = this.isInsideDialog(event.currentTarget);
    const loaded: boolean = await this.controller.load(this.selected());
    if (!loaded) return;

    if (isInsideDialog) return this.openDialog(true);
    this.openPopover(event);
  }

  protected handleOpenDialog(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.openDialog(false);
  }

  protected handlePopoverHide(): void {
    this.isPopoverOpen.set(false);
  }

  protected handleDialogChange(open: boolean): void {
    this.isDialogOpen.set(open);
    if (!open) this.parent?.setActiveAnnotations(this.controller.currentAnnotations(), false);
  }

  private getDialogAnnotations(): InlineAnnotation[] {
    return this.annotations().filter((annotation: InlineAnnotation): boolean => {
      return annotation.definition.behavior === 'dialog' || annotation.definition.behavior === 'detach';
    });
  }

  private getTriggerClasses(): string {
    const classes: string[] = [this.classes()];

    if (this.isInteractive()) classes.push('cursor-pointer');
    if (this.controller.isLoading()) classes.push('cursor-wait');

    return classes.filter(Boolean).join(' ');
  }

  private getIsHighlighted(): boolean {
    return this.isDialogOpen() || this.isJumpHighlighted() || this.isHighlightedFromParent();
  }

  private openPopover(event: Event): void {
    const target: EventTarget | null = event.currentTarget;
    this.isPopoverOpen.set(true);

    if (target instanceof HTMLElement) {
      this.popover()?.show(event, target);
      return;
    }

    this.popover()?.show(event);
  }

  private openDialog(openParents: boolean): void {
    if (openParents) this.parent?.ensureDialogOpen();

    this.showDialog();
    this.parent?.setActiveAnnotations(this.controller.currentAnnotations(), true);
  }

  private showDialog(): void {
    this.popover()?.hide();
    this.isPopoverOpen.set(false);
    this.isDialogOpen.set(true);
  }

  private hasAnnotation(uuid: string): boolean {
    return this.annotations().some((annotation: InlineAnnotation): boolean => annotation.uuid === uuid);
  }

  private isHighlightedFromParent(): boolean {
    const activeIds: string[] = this.parent?.activeAnnotationIds() ?? [];
    return this.annotations().some((annotation: InlineAnnotation): boolean => activeIds.includes(annotation.uuid));
  }

  private isInsideDialog(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;

    const dialog: Element | null = target.closest('.p-dialog');
    const popover: Element | null = target.closest('.p-popover, .p-popover-panel');

    return !!dialog && !popover;
  }

  private highlightTemporarily(): void {
    this.isJumpHighlighted.set(true);
    window.setTimeout((): void => this.isJumpHighlighted.set(false), 1600);
  }
}
