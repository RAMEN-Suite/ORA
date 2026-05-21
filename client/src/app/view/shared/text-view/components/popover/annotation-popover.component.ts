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
import { ActivateDirective } from '../../../../../directives/activate.directive';
import { BlockPathResolver } from '../../../../../resolvers/block-path.resolver';
import { ViewResponse, ViewService } from '../../../../../services/view.service';
import { AnnotationValue } from '../../models/Annotations';
import { InlineAnnotation } from '../../models/TextAnnotation';
import { AnnotationPopoverEntryComponent } from './annotation-popover-entry.component';

type AnnotationViewMap = Record<string, ViewResponse | undefined>;

@Component({
  selector: 'annotation-popover',
  imports: [Popover, Divider, ActivateDirective, AnnotationPopoverEntryComponent],
  templateUrl: './annotation-popover.component.html',
  host: { class: 'contents' },
})
export class AnnotationPopoverComponent {
  private readonly viewService: ViewService = inject(ViewService);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  private readonly popoverComponent: Signal<Popover | undefined> = viewChild(Popover);

  public readonly classes: InputSignal<string> = input<string>('');
  public readonly annotations: InputSignal<InlineAnnotation[]> = input<InlineAnnotation[]>([]);

  protected readonly isOpen: WritableSignal<boolean> = signal(false);
  protected readonly isLoading: WritableSignal<boolean> = signal(false);
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

    const annotations: InlineAnnotation[] = this.popoverAnnotations();

    this.activeAnnotations.set(annotations);
    this.isLoading.set(true);

    try {
      this.views.set(await this.loadViews(annotations));
      this.show(event);
    } finally {
      this.isLoading.set(false);
    }
  }

  protected handleHide(): void {
    this.isOpen.set(false);
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

  private show(event: Event): void {
    this.isOpen.set(true);
    this.popoverComponent()?.show(event);
  }
}
