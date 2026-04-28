export namespace RAMEN {
  interface Node {
    _types: string[];
    [key: string]: unknown;
  }

  export interface Entity extends Node {
    _annotations: Annotation[];
    _referredToBy: Annotation[];

    uuid: string;
    label: string;
  }

  export interface Content extends Node {
    _collections: Collection[];
    _annotations: Annotation[];
    _referredToBy: Annotation[];

    uuid: string;
    label: string;
  }

  export interface Collection extends Node {
    _collections: Collection[];
    _collectionOf: Collection[];
    _content: Content[];
    _annotations: Annotation[];
    _referredToBy: Annotation[];

    uuid: string;
    label: string;
  }

  export interface Annotation extends Node {
    _annotations: Annotation[];
    _referredToBy: Annotation[];

    _annotatesCollections: Collection[];
    _annotatesContent: Content[];
    _annotatesEntities: Entity[];
    _annotatesAnnotations: Annotation[];

    _refersToCollections: Collection[];
    _refersToContent: Content[];
    _refersToEntities: Entity[];
    _refersToAnnotations: Annotation[];

    uuid: string;
    type: string;
  }
}
