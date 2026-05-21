import { Clipboard } from '@angular/cdk/clipboard';
import { Component, computed, forwardRef, inject, input, InputSignal, Signal, signal, WritableSignal } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { NavigationService } from '../../../../../services/navigation.service';
import { ViewResponse } from '../../../../../services/view.service';
import { ConfigService } from '../../../../../services/config.service';
import { AnnotationPopover, Annotations } from '../../models/Annotations';
import { InlineAnnotation } from '../../models/TextAnnotation';
import { TextViewComponent } from '../../text-view.component';
import { AnnotationPopoverResolver, AnnotationReferenceView, DescriptionView } from '../../resolver/annotation-popover.resolver';

@Component({
  selector: 'annotation-popover-entry',
  imports: [TranslocoDirective, Button, Tooltip, forwardRef(() => TextViewComponent)],
  templateUrl: './annotation-popover-entry.component.html',
})
export class AnnotationPopoverEntryComponent {
  private readonly navigationService: NavigationService = inject(NavigationService);
  private readonly popoverResolver: AnnotationPopoverResolver = inject(AnnotationPopoverResolver);
  private readonly configService: ConfigService = inject(ConfigService);
  private readonly clipboard: Clipboard = inject(Clipboard);

  public readonly annotation: InputSignal<InlineAnnotation> = input.required<InlineAnnotation>();
  public readonly view: InputSignal<ViewResponse | undefined> = input<ViewResponse | undefined>(undefined);
  public readonly isOpen: InputSignal<boolean> = input<boolean>(false);

  protected readonly hasCopied: WritableSignal<boolean> = signal(false);

  protected readonly config: Signal<Annotations> = computed((): Annotations => {
    return this.configService.config().annotations();
  });

  protected readonly popover: Signal<AnnotationPopover | undefined> = computed((): AnnotationPopover | undefined => {
    return this.annotation().definition.popover;
  });

  protected readonly values: Signal<Record<string, unknown>> = computed((): Record<string, unknown> => {
    return this.view()?.values ?? {};
  });

  protected readonly title: Signal<string> = computed((): string => {
    return this.popover()?.title ?? this.annotation().type;
  });

  protected readonly descriptions: Signal<DescriptionView[]> = computed((): DescriptionView[] => {
    return this.popoverResolver.resolveDescriptions(this.popover(), this.values());
  });

  protected readonly references: Signal<AnnotationReferenceView[]> = computed((): AnnotationReferenceView[] => {
    return this.popoverResolver.resolveReferences(this.popover(), this.values());
  });

  protected readonly externalLink: Signal<string> = computed((): string => {
    return this.popoverResolver.resolveExternalLink(this.popover(), this.values());
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
