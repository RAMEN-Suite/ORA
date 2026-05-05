export namespace Config {
  export interface Root {
    screens: Screens;
  }

  export interface Screens {
    entities: MultiNode;
    collections: MultiNode;
  }

  export interface MultiNode {
    initial: string;
    nodes: NodeOption[];
    properties?: Property[];
  }

  export interface Option {
    icon?: string;
    label: string;
    value: string;
  }

  export interface NodeOption extends Option {
    properties?: Property[];
    sort?: SortSelection;
    filter?: Selection;
  }

  export interface Selection {
    initial: string;
    options: Option[];
  }

  export interface SortSelection extends Selection {
    direction: 'asc' | 'desc';
  }

  export interface Property {
    name: string;
    display?: string;
    valueMap?: Record<string, string>;
  }
}
