import { Component, input, InputSignal } from '@angular/core';
import { TextViewSegment } from '../../models/TextViewSegments';
import { TextViewSegmentComponent } from '../text-view-segment/text-view-segment.component';

@Component({
  selector: 'annotation-text-view-segments',
  imports: [TextViewSegmentComponent],
  templateUrl: './text-view-segments.component.html',
})
export class TextViewSegmentsComponent {
  public readonly segments: InputSignal<TextViewSegment[]> = input<TextViewSegment[]>([]);
}
