import { Component, computed, inject, Signal } from '@angular/core';
import { Fieldset } from 'primeng/fieldset';
import { TranslocoDirective } from '@jsverse/transloco';
import { AbstractBlock } from '../abstract.block';
import { TextProps } from '../../../models/config/DetailViews';
import { TextViewComponent } from '../../shared/text-view/text-view.component';
import { TextAnnotation } from '../../../models/annotations/TextAnnotation';
import { AnnotationUtils } from '../../../utils/AnnotationUtils';
import { ConfigService } from '../../../services/config.service';
import { Annotations } from '../../../models/config/Annotations';

@Component({
  selector: 'block-text',
  imports: [Fieldset, TranslocoDirective, TextViewComponent],
  templateUrl: './text.block.html',
})
export class TextBlock extends AbstractBlock<TextProps> {
  private readonly configService: ConfigService = inject(ConfigService);
  protected readonly config: Annotations = this.configService.config().annotations();

  protected readonly title: Signal<string> = computed((): string => this.resolveText(this.properties()?.title));
  protected readonly text: Signal<string> = computed((): string => this.resolveText(this.properties()?.text));
  protected readonly annotations: Signal<TextAnnotation[]> = computed((): TextAnnotation[] =>
    AnnotationUtils.toTextAnnotations(this.resolveNodes(this.properties()?.annotations)),
  );
}
