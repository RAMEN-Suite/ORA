import {
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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { Divider } from 'primeng/divider';
import { Popover } from 'primeng/popover';
import { BlockPathResolver } from '../../../../resolvers/block-path.resolver';
import { ViewResponse, ViewService } from '../../../../services/view.service';
import { AnnotationDialog, AnnotationValue } from '../../../../models/annotations/Annotations';
import { InlineAnnotation } from '../../../../models/annotations/TextAnnotation';
import { AnnotationDialogItemComponent } from './annotation-dialog-item.component';
import { ActivateDirective } from '../../../../directives/activate.directive';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { NgTemplateOutlet } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';

const LOADING_STYLE_CLASSES: string[] = ['cursor-wait'];
const DEFAULT_STYLE_CLASSES: string[] = ['cursor-pointer'];

@Component({
  selector: 'annotation-dialog',
  imports: [
    Divider,
    AnnotationDialogItemComponent,
    ActivateDirective,
    Popover,
    Button,
    Dialog,
    NgTemplateOutlet,
    TranslocoDirective,
  ],
  templateUrl: './annotation-dialog.component.html',
  host: { class: 'contents' },
})
export class AnnotationDialogComponent {
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  private readonly viewService: ViewService = inject(ViewService);

  private readonly popoverComponent: Signal<Popover | undefined> = viewChild(Popover);
  private readonly annotationAnchor: Signal<ElementRef<HTMLElement> | undefined> = viewChild('anchor');

  public readonly classes: InputSignal<string> = input<string>('');
  public readonly annotations: InputSignal<InlineAnnotation[]> = input<InlineAnnotation[]>([]);

  protected readonly isScrollHighlighted: WritableSignal<boolean> = signal(false);
  protected readonly isLoading: WritableSignal<boolean> = signal(false);
  protected readonly isPopoverOpen: WritableSignal<boolean> = signal(false);
  protected readonly isDialogOpen: WritableSignal<boolean> = signal(false);
  protected readonly hasError: WritableSignal<boolean> = signal(false);

  protected readonly currentAnnotations: WritableSignal<InlineAnnotation[]> = signal<InlineAnnotation[]>([]);
  protected readonly viewMap: WritableSignal<Record<string, ViewResponse | undefined>> = signal({});

  protected readonly relevant: Signal<InlineAnnotation[]> = computed((): InlineAnnotation[] => this.filterAnnotations());
  protected readonly hasRelevant: Signal<boolean> = computed((): boolean => this.relevant().length > 0);

  protected readonly loadingClasses: Signal<string> = computed((): string => LOADING_STYLE_CLASSES.join(' '));
  protected readonly defaultClasses: Signal<string> = computed((): string => DEFAULT_STYLE_CLASSES.join(' '));

  public handleScrollToAnnotation(uuid?: string): void {
    if (uuid && !this.hasAnnotation(uuid)) return;

    const element: HTMLElement | undefined = this.annotationAnchor()?.nativeElement;
    if (!element) return;

    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    });

    element.focus({ preventScroll: true });
    this.isScrollHighlighted.set(true);
    window.setTimeout((): void => this.isScrollHighlighted.set(false), 1600);
  }

  protected async handleOpenPopover(event: Event): Promise<void> {
    if (!this.hasRelevant() || this.isLoading()) return;
    event.preventDefault();
    event.stopPropagation();

    const target: EventTarget | null = event.currentTarget;
    const annotations: InlineAnnotation[] = this.relevant();

    this.currentAnnotations.set(annotations);
    this.isLoading.set(true);

    try {
      const response: Record<string, ViewResponse | undefined> = await this.resolveView(annotations);
      this.viewMap.set(response);
      this.showPopover(event, target);
    } catch {
      this.hasError.set(true);
      this.showPopover(event, target);
    } finally {
      this.isLoading.set(false);
    }
  }

  protected handlePopoverHide(): void {
    this.isPopoverOpen.set(false);
  }

  protected handleOpenDialog(event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();

    this.popoverComponent()?.hide();
    this.isPopoverOpen.set(false);
    this.isDialogOpen.set(true);
  }

  protected handleDialogChange(isVisible: boolean): void {
    this.isDialogOpen.set(isVisible);
  }

  protected getViewResponse(annotation: InlineAnnotation): ViewResponse | undefined {
    return this.viewMap()[annotation.uuid];
  }

  private showPopover(event: Event, target: EventTarget | null): void {
    this.isPopoverOpen.set(true);
    const isHTMLElement: boolean = target instanceof HTMLElement;

    if (!isHTMLElement) return this.popoverComponent()?.show(event);
    this.popoverComponent()?.show(event, target);
  }

  private hasAnnotation(uuid: string): boolean {
    return this.annotations().some((annotation: InlineAnnotation): boolean => annotation.uuid === uuid);
  }

  private filterAnnotations(): InlineAnnotation[] {
    return this.annotations().filter((annotation: InlineAnnotation): boolean => annotation.definition.behavior === 'dialog');
  }

  private async resolveView(annotations: InlineAnnotation[]): Promise<Record<string, ViewResponse | undefined>> {
    const entries: [string, ViewResponse | undefined][] = await Promise.all(
      annotations.map(async (annotation: InlineAnnotation): Promise<[string, ViewResponse | undefined]> => {
        const response: ViewResponse | undefined = await this.fetchView(annotation);
        return [annotation.uuid, response];
      }),
    );

    return Object.fromEntries(entries);
  }

  private async fetchView(annotation: InlineAnnotation): Promise<ViewResponse | undefined> {
    const paths: string[] = this.resolveViewPaths(annotation);
    if (paths.length === 0) return undefined;

    const uuid: string = annotation.uuid;
    return await firstValueFrom(this.viewService.fetchViewOnce(uuid, paths).pipe(takeUntilDestroyed(this.destroyRef)));
  }

  private resolveViewPaths(annotation: InlineAnnotation): string[] {
    const dialog: AnnotationDialog | undefined = annotation.definition.dialog;
    const paths: string[] = BlockPathResolver.resolvePaths(dialog);

    for (const description of dialog?.description ?? []) {
      const annotationPath: string | undefined = this.annotationPath(description);
      if (annotationPath) paths.push(annotationPath);
    }

    return Array.from(new Set(paths)).sort();
  }

  private annotationPath(description: AnnotationValue): string | undefined {
    const path: string | undefined = description.annotations?.path;
    return path && path.trim().length > 0 ? path : undefined;
  }
}
