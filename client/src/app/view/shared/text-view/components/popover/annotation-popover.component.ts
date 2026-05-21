import {
  Component,
  computed,
  DestroyRef,
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
import { BlockPathResolver } from '../../../../../resolvers/block-path.resolver';
import { ViewResponse, ViewService } from '../../../../../services/view.service';
import { AnnotationValue } from '../../models/Annotations';
import { InlineAnnotation } from '../../models/TextAnnotation';
import { AnnotationPopoverEntryComponent } from './annotation-popover-entry.component';
import { ActivateDirective } from '../../../../../directives/activate.directive';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';

type AnnotationViewMap = Record<string, ViewResponse | undefined>;

@Component({
  selector: 'annotation-popover',
  imports: [Divider, AnnotationPopoverEntryComponent, ActivateDirective, Popover, Button, Dialog],
  templateUrl: './annotation-popover.component.html',
  host: { class: 'contents' },
})
export class AnnotationPopoverComponent {
  private readonly viewService: ViewService = inject(ViewService);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  private readonly popoverComponent: Signal<Popover | undefined> = viewChild(Popover);

  public readonly classes: InputSignal<string> = input<string>('');
  public readonly annotations: InputSignal<InlineAnnotation[]> = input<InlineAnnotation[]>([]);

  protected readonly isLoading: WritableSignal<boolean> = signal(false);
  protected readonly isPopoverOpen: WritableSignal<boolean> = signal(false);
  protected readonly isDialogOpen: WritableSignal<boolean> = signal(false);

  protected readonly activeAnnotations: WritableSignal<InlineAnnotation[]> = signal<InlineAnnotation[]>([]);
  protected readonly views: WritableSignal<AnnotationViewMap> = signal<AnnotationViewMap>({});

  protected readonly popoverAnnotations: Signal<InlineAnnotation[]> = computed((): InlineAnnotation[] => {
    return this.annotations().filter((annotation: InlineAnnotation): boolean => annotation.definition.behavior === 'popover');
  });

  protected readonly hasPopover: Signal<boolean> = computed((): boolean => {
    return this.popoverAnnotations().length > 0;
  });

  protected readonly hostClasses: Signal<string> = computed((): string => {
    return [this.classes(), this.hasPopover() ? 'cursor-pointer' : '', this.isLoading() ? 'cursor-wait' : '']
      .filter(Boolean)
      .join(' ');
  });

  protected getView(annotation: InlineAnnotation): ViewResponse | undefined {
    return this.views()[annotation.uuid];
  }

  protected async handleOpen(event: Event): Promise<void> {
    if (!this.hasPopover() || this.isLoading()) return;

    event.preventDefault();
    event.stopPropagation();

    const target: EventTarget | null = event.currentTarget;
    const annotations: InlineAnnotation[] = this.popoverAnnotations();

    this.activeAnnotations.set(annotations);
    this.isLoading.set(true);

    try {
      this.views.set(await this.loadViews(annotations));
      this.showPopover(event, target);
    } finally {
      this.isLoading.set(false);
    }
  }

  private showPopover(event: Event, target: EventTarget | null): void {
    this.isPopoverOpen.set(true);

    if (target instanceof HTMLElement) {
      this.popoverComponent()?.show(event, target);
      return;
    }

    this.popoverComponent()?.show(event);
  }

  protected handlePopoverHide(): void {
    this.isPopoverOpen.set(false);
  }

  protected handlePopOut(event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();

    this.popoverComponent()?.hide();
    this.isPopoverOpen.set(false);
    this.isDialogOpen.set(true);
  }

  protected handleDialogVisibleChange(visible: boolean): void {
    this.isDialogOpen.set(visible);
  }

  private async loadViews(annotations: InlineAnnotation[]): Promise<AnnotationViewMap> {
    const entries: [string, ViewResponse | undefined][] = await Promise.all(
      annotations.map(async (annotation: InlineAnnotation): Promise<[string, ViewResponse | undefined]> => {
        return [annotation.uuid, await this.fetchView(annotation)];
      }),
    );

    return Object.fromEntries(entries);
  }

  private async fetchView(annotation: InlineAnnotation): Promise<ViewResponse | undefined> {
    const paths: string[] = this.resolveViewPaths(annotation);
    if (paths.length === 0) return undefined;

    try {
      return await firstValueFrom(
        this.viewService.fetchViewOnce(annotation.uuid, paths).pipe(takeUntilDestroyed(this.destroyRef)),
      );
    } catch {
      return undefined;
    }
  }

  private resolveViewPaths(annotation: InlineAnnotation): string[] {
    const popover = annotation.definition.popover;
    const paths: string[] = BlockPathResolver.resolvePaths(popover);

    for (const description of popover?.description ?? []) {
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
