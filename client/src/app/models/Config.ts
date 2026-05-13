export interface Config {
  screens: Screens;
  features: Features;
}

export interface Screens {
  entities: ListScreen<EntityOption>;
  collections: ListScreen;
  collection: ComposedScreen[];
  entity: ComposedScreen[];
}

export interface ComposedScreen {
  match: string[];
  blocks: Block[];
}

export interface ListScreen<TOption extends Option = NodeOption> {
  initial: string;
  nodes: TOption[];
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

export interface EntityOption extends Option {
  properties?: Property[];
  index?: EntityIndex;
}

export interface Selection<TOption extends Option = Option> {
  initial: string;
  options: TOption[];
}

export interface SortSelection extends Selection {
  direction: SortDirection;
}

export interface Property {
  name: string;
  display?: string;
  valueMap?: Record<string, string>;
}

export type Headline = Base<'headline', HeadlineProperties>;
export type Metadata = Base<'metadata', MetadataProperties>;
export type Text = Base<'text', TextProperties>;

export type Block = Headline | Metadata | Text;
export type Value<T = unknown> = T | Binding<T>;

export interface Base<TType extends string, TProperties> {
  type: TType;
  properties: TProperties;
}

export interface HeadlineProperties {
  title: Value<string>;
}

export interface MetadataProperties {
  title?: Value<string>;
  items: MetadataItem[];
  link?: 'entity' | 'collection';
}

export interface MetadataItem {
  label: Value<string>;
  value: Value<string | string[]>;
}

export interface TextProperties {
  title?: Value<string>;
  text: Value<string>;
}

export interface Binding<T = unknown> {
  path: string;
  fallback?: T;
}
