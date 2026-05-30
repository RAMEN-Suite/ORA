import { Component, computed, effect, input, InputSignal, Signal } from '@angular/core';
import { Annotations } from '../../../models/config/Annotations';
import { TextAnnotation, TextNormalizationIssue, TextNormalizationResult } from '../../../models/annotations/TextAnnotation';
import { StructureParser } from '../../../parser/annotations/StructureParser';
import { ViewSegment } from '../../../models/annotations/ViewSegments';
import { TextViewSegmentsComponent } from './segments/text-view-segments.component';
import { ResolvedAnnotation } from '../../../models/annotations/ResolvedAnnotation';
import { TextNormalizer } from '../../../parser/annotations/TextNormalizer';
import { TextAnnotationResolver } from '../../../resolvers/annotation-text.resolver';

@Component({
  selector: 'shared-text-view',
  imports: [TextViewSegmentsComponent],
  templateUrl: './text-view.component.html',
})
export class TextViewComponent {
  public readonly config: InputSignal<Annotations> = input.required<Annotations>();
  public readonly text: InputSignal<string> = input.required<string>();
  public readonly annotations: InputSignal<TextAnnotation[]> = input<TextAnnotation[]>([]);

  protected readonly normalizedAnnotations: Signal<TextNormalizationResult> = computed((): TextNormalizationResult => {
    return new TextNormalizer(this.text(), this.annotations(), this.config()).normalize();
  });
  protected readonly resolvedAnnotations: Signal<ResolvedAnnotation[]> = computed((): ResolvedAnnotation[] => {
    return new TextAnnotationResolver(this.normalizedAnnotations().annotations, this.config()).resolve();
  });
  protected readonly viewSegments: Signal<ViewSegment[]> = computed((): ViewSegment[] => {
    return new StructureParser(this.text(), this.resolvedAnnotations()).parse();
  });

  public constructor() {
    effect((): void => {
      const issues: TextNormalizationIssue[] = this.normalizedAnnotations().issues;
      if (issues.length === 0) return;
      console.warn('[TextView] Annotation normalization issues', issues);
    });
  }
}
