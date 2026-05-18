export type IdentifiableNode = Node & { uuid: string };

export interface Node {
  _labels: string[];
  [key: string]: unknown;
}

export interface Entity extends Node {
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
