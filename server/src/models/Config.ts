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
  }

  export interface Category {
    label: string;
    type: string;
    icon?: string;
    properties?: Property[];
  }

  export interface Property {
    property: string;
    emphasis: TextEmphasis;
  }

  export interface Layout {}
}
