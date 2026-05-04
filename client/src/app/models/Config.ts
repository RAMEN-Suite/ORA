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
    sort?: Selection & { direction: 'asc' | 'desc' };
    filter?: Selection;
  }

  export interface Selection {
    initial: string;
    options: Option[];
  }

  export interface Property {
    name: string;
    display?: string;
    valueMap?: Record<string, string>;
  }
}
