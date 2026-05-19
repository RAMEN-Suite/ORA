import { Component, input, InputSignal } from '@angular/core';
import { ResolvedAnnotation } from '../../models/TextAnnotation';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'annotation-popover',
  imports: [JsonPipe],
  templateUrl: './annotation-popover.component.html',
})
export class AnnotationPopoverComponent {
  public readonly annotations: InputSignal<ResolvedAnnotation[]> = input<ResolvedAnnotation[]>([]);
}
