export namespace Config {
  export type TextEmphasis = 'bold' | 'italic' | 'underline' | 'strike';

  export interface Root {
    screens: Screens;
    layout: Layout;
  }

  export interface Screens {
    entities: EntitiesScreen;
  }

  export interface EntitiesScreen {
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
    emphasis?: TextEmphasis[];
  }

  export interface Layout {}
}
