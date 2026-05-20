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
import { AnnotationPopover, AnnotationReference } from '../../../models/Annotations';
import { ResolvedAnnotation } from '../../../models/TextAnnotation';
import { ViewResponse, ViewService } from '../../../../../../services/view.service';
import { Binding } from '../../../../../../models/config/Config';
import { BlockValueResolver } from '../../../../../../resolvers/block-value.resolver';
import { BlockPathResolver } from '../../../../../../resolvers/block-path.resolver';
import { Utils } from '../../../../../../utils/Utils';
import { TranslocoDirective } from '@jsverse/transloco';
import { Button } from 'primeng/button';
import { ProgressSpinner } from 'primeng/progressspinner';

interface AnnotationReferenceView {
  label: string;
  uuid: string;
  icon?: string;
}

@Component({
  selector: 'annotation-popover-entry',
  imports: [TranslocoDirective, Button, ProgressSpinner],
  templateUrl: './annotation-popover-entry.component.html',
})
export class AnnotationPopoverEntryComponent {
  private readonly clipboard: Clipboard = inject(Clipboard);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  private readonly viewService: ViewService = inject(ViewService);

  public readonly annotation: InputSignal<ResolvedAnnotation> = input.required<ResolvedAnnotation>();
  public readonly isOpen: InputSignal<boolean> = input<boolean>(false);

  protected readonly response: WritableSignal<ViewResponse | undefined> = signal<ViewResponse | undefined>(undefined);
  protected readonly isLoading: WritableSignal<boolean> = signal(false);
  protected readonly hasLoaded: WritableSignal<boolean> = signal(false);
  protected readonly hasCopied: WritableSignal<boolean> = signal(false);

  protected readonly popover: Signal<AnnotationPopover | undefined> = computed((): AnnotationPopover | undefined => {
    return this.annotation().definition.popover;
  });

  protected readonly paths: Signal<string[]> = computed((): string[] => {
    return BlockPathResolver.resolvePaths(this.popover());
  });

  protected readonly values: Signal<Record<string, unknown>> = computed((): Record<string, unknown> => {
    return this.response()?.values ?? {};
  });

  protected readonly title: Signal<string> = computed((): string => {
    return this.popover()?.title ?? this.annotation().type;
  });

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
      return this.resolveReference(reference);
    });
  });

  public constructor() {
    effect((): void => {
      if (this.isOpen()) this.loadOnce();
    });
  }

  protected handleCopyUuid(): void {
    this.clipboard.copy(this.annotation().uuid);
    this.hasCopied.set(true);
    window.setTimeout((): void => this.hasCopied.set(false), 1200);
  }

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

  private resolveReference(reference: AnnotationReference): AnnotationReferenceView[] {
    const labels: string[] = this.resolveBindingValues(reference.label);
    const uuids: string[] = this.resolveBindingValues(reference.uuid);
    const length: number = Math.max(labels.length, uuids.length);

    const result: AnnotationReferenceView[] = [];

    for (let index: number = 0; index < length; index++) {
      const label: string = labels[index] ?? '';
      const uuid: string = uuids[index] ?? '';

      if (!label.trim() || !uuid.trim()) continue;
      result.push({ label, uuid, icon: reference.icon });
    }

    return result;
  }

  private resolveBindingValues(binding: Binding): string[] {
    const value: unknown = this.values()[binding.path];

    if (Array.isArray(value)) {
      return value.map((item: unknown): string => Utils.stringify(item) ?? '').filter(Boolean);
    }

    const resolved: string = BlockValueResolver.resolveString(binding, this.values());
    return resolved ? [resolved] : [];
  }
}
