import { Annotation } from '../Node';
import { NormalizationIssue, NormalizationResult } from './Normalization';

export interface TextInterval {
  start: number;
  end: number;
}

export interface TextAnnotation extends Annotation {
  startIndex?: number;
  endIndex?: number;
  isZeroPoint?: boolean;

  text?: string;
  [key: string]: unknown;
}

export interface NormalizedTextAnnotation extends TextInterval {
  uuid: string;
  type: string;
  isZeroPoint: boolean;
  source: TextAnnotation;
}

export type TextNormalizationResult = NormalizationResult<NormalizedTextAnnotation, TextAnnotation>;
export type TextNormalizationIssue = NormalizationIssue<TextAnnotation>;
