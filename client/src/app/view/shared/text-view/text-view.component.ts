import { Component, computed, effect, input, InputSignal, Signal } from '@angular/core';
import { Annotations } from '../../../models/annotations/Annotations';
import { ResolvedAnnotation, TextAnnotation } from '../../../models/annotations/TextAnnotation';
import { AnnotationNormalizer, NormalizationIssue, NormalizationResult } from '../../../parser/AnnotationNormalizer';
import { TextViewParser } from '../../../parser/TextViewParser';
import { AnnotationResolver } from '../../../resolvers/annotation.resolver';
import { TextViewSegment } from '../../../models/annotations/TextViewSegments';
import { TextViewSegmentsComponent } from './segments/text-view-segments.component';

@Component({
  selector: 'shared-text-view',
  imports: [TextViewSegmentsComponent],
  templateUrl: './text-view.component.html',
})
export class TextViewComponent {
  public readonly config: InputSignal<Annotations> = input.required<Annotations>();
  public readonly text: InputSignal<string> = input.required<string>();
  public readonly annotations: InputSignal<TextAnnotation[]> = input<TextAnnotation[]>([]);

  protected readonly normalizedAnnotations: Signal<NormalizationResult> = computed((): NormalizationResult => {
    return new AnnotationNormalizer(this.text(), this.annotations(), this.config()).normalize();
  });

  protected readonly resolvedAnnotations: Signal<ResolvedAnnotation[]> = computed((): ResolvedAnnotation[] => {
    return new AnnotationResolver(this.normalizedAnnotations().annotations, this.config()).resolve();
  });

  protected readonly viewSegments: Signal<TextViewSegment[]> = computed((): TextViewSegment[] => {
    return new TextViewParser(this.text(), this.resolvedAnnotations()).parse();
  });

  public constructor() {
    effect((): void => {
      const issues: NormalizationIssue[] = this.normalizedAnnotations().issues;
      if (issues.length === 0) return;
      console.warn('[TextView] Annotation normalization issues', issues);
    });
  }
}
