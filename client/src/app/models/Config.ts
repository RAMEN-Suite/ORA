export interface Config {
  screens: Screens;
  features: Features;
}

export interface Screens {
  entities: ListView<EntityItem>;
  collections: ListView;
  collection: DetailView[];
  entity: DetailView[];
}

export interface DetailView {
  match: string[];
  blocks: Block[];
}

export interface ListView<TItem extends Choice = ListItem> {
  initial: string;
  items: TItem[];
  properties?: Property[];
}

export interface Features {
  bible: BibleBook[];
}

export interface BibleBook {
  key: string;
  aliases: string[];
}

export type SortDirection = 'asc' | 'desc';
export type EntityIndex = 'character' | 'bible';

export interface Choice {
  icon?: string;
  label: string;
  value: string;
}

export interface FilterChoice extends Choice {
  display?: 'list' | 'range';
  valueMap?: Record<string, string>;
}

export interface ListItem extends Choice {
  properties?: Property[];
  sort?: SortSelection;
  filters?: FilterChoice[];
}

export interface EntityItem extends Choice {
  properties?: Property[];
  index?: EntityIndex;
}

export interface Selection<TOption extends Choice = Choice> {
  initial: string;
  options: TOption[];
}

export interface SortSelection extends Selection {
  direction: SortDirection;
}

export interface Property {
  name: AccessPath;
  display?: string;
  valueMap?: Record<string, string>;
}

export type Block = Headline | Metadata | Text;

export type Headline = BlockOf<'headline', HeadlineProps>;
export type Metadata = BlockOf<'metadata', MetadataProps>;
export type Text = BlockOf<'text', TextProps>;

export type AccessPath = string;
export type Value<T = unknown> = T | Binding<T>;

export interface BlockOf<TType extends string, TProps> {
  type: TType;
  properties: TProps;
}

export interface HeadlineProps {
  title: Value<string>;
}

export interface MetadataProps {
  title?: Value<string>;
  items: MetadataItem[];
  link?: 'entity' | 'collection';
}

export interface MetadataItem {
  label: string;
  value: Value<string | string[]>;
}

export interface TextProps {
  title?: string;
  text: Value<string>;
}

export interface Binding<T = unknown> {
  path: AccessPath;
  fallback?: T;
}
