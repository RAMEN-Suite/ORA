import { Component, computed, inject, Signal } from '@angular/core';
import { Fieldset } from 'primeng/fieldset';
import { TranslocoDirective } from '@jsverse/transloco';
import { AbstractBlock } from '../abstract.block';
import { TextProps } from '../../../models/config/DetailViews';
import { TextViewComponent } from '../../shared/text-view/text-view.component';
import { TextAnnotation } from '../../shared/text-view/models/TextAnnotation';
import { AnnotationUtils } from '../../shared/text-view/resolver/AnnotationUtils';
import { ConfigService } from '../../../services/config.service';
import { Annotations } from '../../shared/text-view/models/Annotations';

@Component({
  selector: 'block-text',
  imports: [Fieldset, TranslocoDirective, TextViewComponent],
  templateUrl: './text.block.html',
})
export class TextBlock extends AbstractBlock<TextProps> {
  private readonly configService: ConfigService = inject(ConfigService);
  protected readonly config: Annotations = this.configService.config().annotations();

  protected readonly title: Signal<string> = computed((): string => this.resolveOptionalString('title'));
  protected readonly text: Signal<string> = computed((): string => this.resolveRequiredString('text'));
  protected readonly annotations: Signal<TextAnnotation[]> = computed((): TextAnnotation[] =>
    AnnotationUtils.toTextAnnotations(this.resolveOptionalNodes('annotations')),
  );
}
