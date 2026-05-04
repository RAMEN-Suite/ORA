export namespace Config {
  export interface Root {
    screens: Screens;
  }

  export interface Screens {
    entities: Entities;
    collections: Collections;
  }

  export interface MultiNode {
    initial: string;
    nodes: Option[];
    properties?: Property[];
  }

  export interface Entities extends MultiNode {
    nodes: (Option & Properties)[];
  }

  export interface Collections extends MultiNode {
    nodes: (Option & Properties & ListControls)[];
  }

  export interface Properties {
    properties?: Property[];
  }

  export interface ListControls {
    sort: Selection & { direction: 'asc' | 'desc' };
    filter: Selection;
  }

  export interface Selection {
    initial: string;
    options: Option[];
  }

  export interface Option {
    icon?: string;
    label: string;
    value: string;
  }

  export interface Property {
    name: string;
    display?: string;
    valueMap?: Record<string, string>;
  }
}
