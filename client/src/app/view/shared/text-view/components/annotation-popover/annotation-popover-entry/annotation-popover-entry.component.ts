import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  InputSignal,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ViewResponse, ViewService } from '../../../../../../services/view.service';
import { ResolvedAnnotation } from '../../../models/TextAnnotation';
import { AnnotationPopover } from '../../../models/Annotations';
import { BlockValueResolver } from '../../../../../../resolvers/block-value.resolver';
import { RouterLink } from '@angular/router';
import { BlockPathResolver } from '../../../../../../resolvers/block-path.resolver';
import { Binding } from '../../../../../../models/config/Config';

interface AnnotationReferenceView {
  label: string;
  uuid: string;
  icon?: string;
}

@Component({
  selector: 'annotation-popover-entry',
  imports: [RouterLink],
  templateUrl: './annotation-popover-entry.component.html',
})
export class AnnotationPopoverEntryComponent {
  private readonly viewService: ViewService = inject(ViewService);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  public readonly annotation: InputSignal<ResolvedAnnotation> = input.required<ResolvedAnnotation>();
  public readonly isOpen: InputSignal<boolean> = input<boolean>(false);

  protected readonly response: WritableSignal<ViewResponse | undefined> = signal<ViewResponse | undefined>(undefined);
  protected readonly isLoading: WritableSignal<boolean> = signal(false);
  protected readonly hasLoaded: WritableSignal<boolean> = signal(false);

  protected readonly popover: Signal<AnnotationPopover | undefined> = computed(() => {
    return this.annotation().definition.popover;
  });

  protected readonly paths: Signal<string[]> = computed((): string[] => {
    return BlockPathResolver.resolvePaths(this.annotation().definition.popover);
  });

  protected readonly values: Signal<Record<string, unknown>> = computed(() => {
    return this.response()?.values ?? {};
  });

  protected readonly title: Signal<string> = computed(() => {
    return this.popover()?.title ?? this.annotation().type;
  });

  protected readonly descriptions: Signal<string[]> = computed((): string[] => {
    const popover = this.popover();
    if (!popover) return [];

    return (popover.description ?? [])
      .map((value: Binding): string => BlockValueResolver.resolveString(value, this.values()))
      .filter((value: string): boolean => value.trim().length > 0);
  });

  protected readonly externalLink: Signal<string> = computed((): string => {
    const externalLink = this.popover()?.externalLink;
    return externalLink ? BlockValueResolver.resolveString(externalLink, this.values()) : '';
  });

  public constructor() {
    effect((): void => {
      if (!this.isOpen()) return;
      this.loadOnce();
    });
  }

  protected readonly references: Signal<AnnotationReferenceView[]> = computed((): AnnotationReferenceView[] => {
    const references = this.popover()?.references ?? [];
    const values = this.values();

    return references
      .map(
        (reference): AnnotationReferenceView => ({
          label: BlockValueResolver.resolveString(reference.label, values),
          uuid: BlockValueResolver.resolveString(reference.uuid, values),
          icon: reference.icon,
        }),
      )
      .filter((reference: AnnotationReferenceView): boolean => {
        return reference.label.trim().length > 0 && reference.uuid.trim().length > 0;
      });
  });

  private loadOnce(): void {
    if (this.hasLoaded()) return;

    const paths: string[] = this.paths();
    if (paths.length === 0) {
      this.hasLoaded.set(true);
      return;
    }

    this.isLoading.set(true);

    this.viewService
      .fetchViewOnce(this.annotation().uuid, paths)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: ViewResponse): void => {
          this.response.set(response);
          this.hasLoaded.set(true);
          this.isLoading.set(false);
        },
        error: (): void => {
          this.hasLoaded.set(true);
          this.isLoading.set(false);
        },
      });
  }
}
