export enum Resource {
  COLLECTION = "Collection",
  ENTITY = "Entity",
  CONTENT = "Content",
  ANNOTATION = "Annotation",
}

export enum Relation {
  HAS_ANNOTATION = "HAS_ANNOTATION",
  REFERS_TO = "REFERS_TO",
  PART_OF = "PART_OF",
}

export interface Node {
  _labels: string[];
  [key: string]: unknown;
}

export interface Entity extends Node {
  uuid: string;
  label: string;
}

export interface Content extends Node {
  uuid: string;
  label: string;
}

export interface Collection extends Node {
  uuid: string;
  label: string;
}

export interface Annotation extends Node {
  uuid: string;
  type: string;
}
