export namespace Config {
  export interface Root {
    screens: Screens;
    layout: Layout;
  }

  export interface Screens {
    entities: EntitiesScreen;
    collections: CollectionsScreen;
  }

  export interface EntitiesScreen {
    categories: Category[];
    initialType: string;
    properties: Property[];
  }

  export interface CollectionsScreen {
    categories: Category[];
    initialType: string;
    properties: Property[];
  }

  export interface Category {
    icon?: string;
    label: string;
    value: string;
  }

  export interface Property {
    name: string;
    display?: string;
    scope?: string[];
    valueMap?: Record<string, string>;
  }

  export interface Layout {}
}
