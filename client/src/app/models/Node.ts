export interface Node {
  _labels: string[];
  uuid: string;
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
