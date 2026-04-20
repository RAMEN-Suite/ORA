export interface Annotation {
  uuid: string;
  type: string;
}

export interface TypedAnnotation extends Annotation {
  [key: string]: string;
}
