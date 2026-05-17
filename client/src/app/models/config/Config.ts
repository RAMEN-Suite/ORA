import { EntityOption, ListOption, Option, Property } from './Options';
import { Block } from './Block';

export interface Config {
  screens: Screens;
  features: Features;
}

export interface Screens {
  entities: ListScreen<EntityOption>;
  collections: ListScreen;
  collection: DetailScreen[];
  entity: DetailScreen[];
}

export interface ListScreen<TItem extends Option = ListOption> {
  initial: string;
  options: TItem[];
  properties?: Property[];
}

export interface DetailScreen {
  match: string[];
  blocks: Block[];
}

export interface Features {
  bible: BibleBook[];
}

export interface BibleBook {
  key: string;
  aliases: string[];
}
