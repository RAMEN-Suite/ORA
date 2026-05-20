import { Component, computed, input, InputSignal, Signal } from '@angular/core';
import { Annotations } from './models/Annotations';
import { AnnotationSegment, ResolvedAnnotation, TextAnnotation } from './models/TextAnnotation';
import { AnnotationNormalizer, NormalizationResult } from './resolver/AnnotationNormalizer';
import { AnnotationResolver } from './resolver/AnnotationResolver';
import { AnnotationParser } from './resolver/AnnotationParser';
import { AnnotationSegmentsComponent } from './components/annotation-segments/annotation-segments.component';

@Component({
  selector: 'shared-text-view',
  imports: [AnnotationSegmentsComponent],
  templateUrl: './text-view.component.html',
})
export class TextViewComponent {
  public readonly config: InputSignal<Annotations> = input.required<Annotations>();
  public readonly text: InputSignal<string> = input.required<string>();
  public readonly annotations: InputSignal<TextAnnotation[]> = input<TextAnnotation[]>([]);

  protected readonly normalizedAnnotations: Signal<NormalizationResult> = computed((): NormalizationResult => {
    return new AnnotationNormalizer(this.text(), this.annotations(), this.config()).normalize();
  });

  protected readonly annotationSegments: Signal<AnnotationSegment[]> = computed((): AnnotationSegment[] => {
    const normalized: NormalizationResult = this.normalizedAnnotations();
    const resolved: ResolvedAnnotation[] = new AnnotationResolver(normalized.annotations, this.config()).resolve();
    return new AnnotationParser(this.text(), resolved).parse();
  });
}
