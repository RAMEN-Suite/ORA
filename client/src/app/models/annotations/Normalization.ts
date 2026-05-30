export interface NormalizationResult<TAnnotation, TSource> {
  annotations: TAnnotation[];
  issues: NormalizationIssue<TSource>[];
}

export interface NormalizationIssue<TSource> {
  type: IssueType;
  message: string;
  annotation: TSource;
}

export type IssueType = 'missing-range' | 'invalid-range' | 'unknown-type';
