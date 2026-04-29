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
    label: string;
    type: string;
    icon?: string;
  }

  export interface Property {
    name: string;
    emphasis?: TextEmphasis;
  }

  export interface Layout {}
}
