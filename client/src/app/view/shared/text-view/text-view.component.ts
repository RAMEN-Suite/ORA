import { Component, computed, input, InputSignal, Signal } from '@angular/core';
import { Annotations } from './models/Annotations';
import { AnnotationSegment, ResolvedAnnotation, TextAnnotation } from './models/TextAnnotation';
import { AnnotationNormalizer, NormalizationResult } from './parser/AnnotationNormalizer';
import { AnnotationResolver } from './parser/AnnotationResolver';
import { AnnotationParser } from './parser/AnnotationParser';
import { AnnotationSegmentsComponent } from './components/annotation-segments/annotation-segments.component';

@Component({
  selector: 'shared-text-view',
  imports: [AnnotationSegmentsComponent],
  templateUrl: './text-view.component.html',
})
export class TextViewComponent {
  public readonly text: InputSignal<string> = input.required<string>();
  public readonly annotations: InputSignal<TextAnnotation[]> = input<TextAnnotation[]>([]);
  public readonly config: InputSignal<Annotations> = input.required<Annotations>();

  protected readonly normalized: Signal<NormalizationResult> = computed((): NormalizationResult => {
    return new AnnotationNormalizer(this.text(), this.annotations(), this.config()).normalize();
  });

  protected readonly segments: Signal<AnnotationSegment[]> = computed((): AnnotationSegment[] => {
    const normalized: NormalizationResult = this.normalized();
    const resolved: ResolvedAnnotation[] = new AnnotationResolver(normalized.annotations, this.config()).resolve();
    return new AnnotationParser(this.text(), resolved).parse();
  });
}
