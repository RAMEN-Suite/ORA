import { Clipboard } from '@angular/cdk/clipboard';
import { Component, computed, inject, input, InputSignal, Signal, signal, WritableSignal } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { NavigationService } from '../../../../../services/navigation.service';
import { InlineAnnotation } from '../../models/TextAnnotation';
import { ViewResponse } from '../../../../../services/view.service';
import { AnnotationPopover, AnnotationReference } from '../../models/Annotations';
import { BlockValueResolver } from '../../../../../resolvers/block-value.resolver';
import { Binding } from '../../../../../models/config/Config';
import { AnnotationReferenceResolver } from '../../resolver/annotation-reference.resolver';

interface AnnotationReferenceView {
  label: string;
  uuid: string;
  icon?: string;
}

@Component({
  selector: 'annotation-popover-entry',
  imports: [TranslocoDirective, Button, Tooltip],
  templateUrl: './annotation-popover-entry.component.html',
})
export class AnnotationPopoverEntryComponent {
  private readonly navigationService: NavigationService = inject(NavigationService);
  private readonly clipboard: Clipboard = inject(Clipboard);

  public readonly annotation: InputSignal<InlineAnnotation> = input.required<InlineAnnotation>();
  public readonly response: InputSignal<ViewResponse | undefined> = input<ViewResponse | undefined>(undefined);
  public readonly isOpen: InputSignal<boolean> = input<boolean>(false);

  protected readonly hasCopied: WritableSignal<boolean> = signal(false);

  protected readonly popover: Signal<AnnotationPopover | undefined> = computed((): AnnotationPopover | undefined => {
    return this.annotation().definition.popover;
  });

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
}
