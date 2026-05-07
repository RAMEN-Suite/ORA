export namespace Config {
  export interface Root {
    screens: Screens;
    extensions: Extensions;
  }

  export interface Screens {
    entities: EntityNodes;
    collections: MultiNodes;
  }

  export interface MultiNodes {
    initial: string;
    nodes: NodeOption[];
    properties?: Property[];
  }

  export interface EntityNodes extends MultiNodes {
    nodes: EntityOption[];
  }

  export interface Option {
    icon?: string;
    label: string;
    value: string;
  }

  export interface FilterOption extends Option {
    display?: 'list' | 'range';
    valueMap?: Record<string, string>;
  }

  export interface NodeOption extends Option {
    properties?: Property[];
    sort?: SortSelection;
    filters?: FilterOption[];
  }

  export interface EntityOption extends NodeOption {
    index?: EntityIndex;
  }

  export interface Selection {
    initial: string;
    options: Option[];
  }

  export interface SortSelection extends Selection {
    direction: SortDirection;
  }

  export interface Property {
    name: string;
    display?: string;
    valueMap?: Record<string, string>;
  }

  export interface Extensions {
    bible: BibleBook[];
  }

  export interface BibleBook {
    key: string;
    aliases: string[];
  }

  export type SortDirection = 'asc' | 'desc';
  export type EntityIndex = 'character' | 'bible';
}
