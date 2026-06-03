import { Clipboard } from '@angular/cdk/clipboard';
import { Component, computed, forwardRef, inject, input, InputSignal, Signal, signal, WritableSignal } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { ViewResponse } from '../../../../services/view.service';
import { ConfigService } from '../../../../services/config.service';
import { AnnotationDialog, Annotations } from '../../../../models/config/Annotations';
import { TextViewComponent } from '../text-view.component';
import { AnnotationDialogResolver, DialogDescription, DialogReference } from '../../../../resolvers/annotation-dialog.resolver';
import { InlineAnnotation } from '../../../../models/annotations/ResolvedAnnotation';
import { ROUTES } from '../../../../app.routes';

@Component({
  selector: 'annotation-dialog-item',
  imports: [TranslocoDirective, Button, Tooltip, forwardRef(() => TextViewComponent)],
  templateUrl: './annotation-dialog-item.component.html',
})
export class AnnotationDialogItemComponent {
  private readonly configService: ConfigService = inject(ConfigService);
  private readonly clipboard: Clipboard = inject(Clipboard);

  public readonly annotation: InputSignal<InlineAnnotation> = input.required<InlineAnnotation>();
  public readonly viewResponse: InputSignal<ViewResponse | undefined> = input<ViewResponse | undefined>(undefined);
  public readonly isAnnotationOpened: InputSignal<boolean> = input<boolean>(false);

  protected readonly definitions: Annotations = this.configService.config().getAnnotations();
  protected readonly hasCopiedIdentifier: WritableSignal<boolean> = signal(false);

  protected readonly values: Signal<Record<string, unknown>> = computed((): Record<string, unknown> => {
    return this.viewResponse()?.values ?? {};
  });
  protected readonly dialog: Signal<AnnotationDialog | undefined> = computed((): AnnotationDialog | undefined => {
    return this.annotation().definition.dialog;
  });

  protected readonly title: Signal<string> = computed((): string => {
    return this.dialog()?.title ?? this.annotation().type;
  });
  protected readonly descriptions: Signal<DialogDescription[]> = computed((): DialogDescription[] => {
    return AnnotationDialogResolver.resolveDescriptions(this.dialog(), this.values());
  });
  protected readonly references: Signal<DialogReference[]> = computed((): DialogReference[] => {
    return AnnotationDialogResolver.resolveReferences(this.dialog(), this.values());
  });
  protected readonly externalLink: Signal<string> = computed((): string => {
    return AnnotationDialogResolver.resolveExternalLink(this.dialog(), this.values());
  });

  protected handleCopyUuid(): void {
    this.clipboard.copy(this.annotation().uuid);
    this.hasCopiedIdentifier.set(true);
    window.setTimeout((): void => this.hasCopiedIdentifier.set(false), 1200);
  }

  protected handleOpenReference(reference: DialogReference): void {
    const path: string = ['/', ROUTES.IDENTIFIER, '/', reference.uuid].join('');
    window.open(path, '_blank', 'noopener,noreferrer');
  }

  protected handleOpenExternal(link: string): void {
    window.open(link, '_blank');
  }
}
