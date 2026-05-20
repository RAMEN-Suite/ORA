import { Clipboard } from '@angular/cdk/clipboard';
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
import { TranslocoDirective } from '@jsverse/transloco';
import { Button } from 'primeng/button';
import { Popover } from 'primeng/popover';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Tooltip } from 'primeng/tooltip';
import { Binding } from '../../../../../../models/config/Config';
import { BlockPathResolver } from '../../../../../../resolvers/block-path.resolver';
import { BlockValueResolver } from '../../../../../../resolvers/block-value.resolver';
import { NavigationService } from '../../../../../../services/navigation.service';
import { ViewResponse, ViewService } from '../../../../../../services/view.service';
import { AnnotationPopover, AnnotationReference } from '../../../models/Annotations';
import { ResolvedInlineAnnotation } from '../../../models/TextAnnotation';
import { AnnotationReferenceResolver } from '../../../resolver/annotation-reference.resolver';

interface AnnotationReferenceView {
  label: string;
  uuid: string;
  icon?: string;
}

@Component({
  selector: 'annotation-popover-entry',
  imports: [TranslocoDirective, Button, ProgressSpinner, Tooltip],
  templateUrl: './annotation-popover-entry.component.html',
})
export class AnnotationPopoverEntryComponent {
  private readonly navigationService: NavigationService = inject(NavigationService);
  private readonly viewService: ViewService = inject(ViewService);

  private readonly popoverComponent: Popover = inject(Popover);
  private readonly clipboard: Clipboard = inject(Clipboard);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  public readonly annotation: InputSignal<ResolvedInlineAnnotation> = input.required<ResolvedInlineAnnotation>();
  public readonly isOpen: InputSignal<boolean> = input<boolean>(false);

  protected readonly response: WritableSignal<ViewResponse | undefined> = signal<ViewResponse | undefined>(undefined);
  protected readonly isLoading: WritableSignal<boolean> = signal(false);
  protected readonly hasLoaded: WritableSignal<boolean> = signal(false);
  protected readonly hasCopied: WritableSignal<boolean> = signal(false);

  protected readonly popover: Signal<AnnotationPopover | undefined> = computed((): AnnotationPopover | undefined => {
    return this.annotation().definition.popover;
  });

  protected readonly paths: Signal<string[]> = computed((): string[] => BlockPathResolver.resolvePaths(this.popover()));
  protected readonly values: Signal<Record<string, unknown>> = computed((): Record<string, unknown> => {
    return this.response()?.values ?? {};
  });

  protected readonly title: Signal<string> = computed((): string => this.popover()?.title ?? this.annotation().type);
  protected readonly descriptions: Signal<string[]> = computed((): string[] => {
    const popover: AnnotationPopover | undefined = this.popover();
    if (!popover) return [];

    return (popover.description ?? [])
      .map((binding: Binding): string => BlockValueResolver.resolveString(binding, this.values()))
      .filter((value: string): boolean => value.trim().length > 0);
  });

  protected readonly externalLink: Signal<string> = computed((): string => {
    const externalLink: Binding | undefined = this.popover()?.externalLink;
    return externalLink ? BlockValueResolver.resolveString(externalLink, this.values()) : '';
  });

  protected readonly references: Signal<AnnotationReferenceView[]> = computed((): AnnotationReferenceView[] => {
    return (this.popover()?.references ?? []).flatMap((reference: AnnotationReference): AnnotationReferenceView[] => {
      return AnnotationReferenceResolver.resolve(reference, this.values());
    });
  });

  public constructor() {
    effect((): void => {
      if (this.isOpen()) this.loadPopOverContents();
    });
  }

  protected handlePopoverContentChanged(): void {
    requestAnimationFrame((): void => this.popoverComponent.align());
  }

  protected handleCopyUuid(): void {
    this.clipboard.copy(this.annotation().uuid);
    this.hasCopied.set(true);
    window.setTimeout((): void => this.hasCopied.set(false), 1200);
  }

  protected handleOpenReference(reference: AnnotationReferenceView): void {
    this.navigationService.toNode(reference.uuid);
  }

  protected handleOpenExternal(link: string): void {
    window.open(link, '_blank');
  }

  private loadPopOverContents(): void {
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
          this.handlePopoverContentChanged();
        },
        error: (): void => {
          this.hasLoaded.set(true);
          this.isLoading.set(false);
        },
      });
  }
}
